"""
Network Discovery Service using mDNS/Bonjour
Allows Spark devices to automatically discover each other on the local network
"""
import socket
import json
import time
import psutil
from zeroconf import ServiceInfo, Zeroconf, ServiceBrowser, ServiceListener
from typing import List, Dict, Callable, Optional
import threading


class SparkDevice:
    """Represents a discovered Spark device on the network"""
    def __init__(self, name: str, address: str, port: int, device_info: Dict):
        self.name = name
        self.address = address
        self.port = port
        self.device_info = device_info
        self.last_seen = time.time()

    def to_dict(self) -> Dict:
        return {
            'name': self.name,
            'address': self.address,
            'port': self.port,
            'role': self.device_info.get('role', 'unknown'),
            'personality': self.device_info.get('personality', ''),
            'model': self.device_info.get('model', ''),
            'last_seen': self.last_seen
        }


class SparkServiceListener(ServiceListener):
    """Listens for Spark devices on the network"""

    def __init__(self, on_device_found: Callable, on_device_lost: Callable):
        self.on_device_found = on_device_found
        self.on_device_lost = on_device_lost
        self.devices: Dict[str, SparkDevice] = {}

    def remove_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        print(f"Service {name} removed")
        if name in self.devices:
            device = self.devices.pop(name)
            self.on_device_lost(device)

    def add_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        info = zc.get_service_info(type_, name)
        if info:
            address = socket.inet_ntoa(info.addresses[0]) if info.addresses else None
            port = info.port

            # Parse device info from TXT records
            device_info = {}
            if info.properties:
                for key, value in info.properties.items():
                    try:
                        device_info[key.decode('utf-8')] = value.decode('utf-8')
                    except:
                        pass

            if address:
                device = SparkDevice(name, address, port, device_info)
                self.devices[name] = device
                print(f"Service {name} added - {address}:{port}")
                self.on_device_found(device)

    def update_service(self, zc: Zeroconf, type_: str, name: str) -> None:
        print(f"Service {name} updated")
        # Treat update as a new discovery
        self.add_service(zc, type_, name)


class NetworkDiscovery:
    """Manages network discovery for Spark devices"""

    SERVICE_TYPE = "_spark._tcp.local."

    def __init__(self, device_name: str, port: int = 3001, role: str = "host"):
        self.device_name = device_name
        self.port = port
        self.role = role
        self.zeroconf: Optional[Zeroconf] = None
        self.service_info: Optional[ServiceInfo] = None
        self.browser: Optional[ServiceBrowser] = None
        self.listener: Optional[SparkServiceListener] = None
        self.device_callbacks: List[Callable] = []
        self.running = False

    def get_system_info(self) -> Dict:
        """Get current system resource information"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()

        # Try to get GPU info if available
        gpu_info = "N/A"
        try:
            import GPUtil
            gpus = GPUtil.getGPUs()
            if gpus:
                gpu_info = f"{gpus[0].name} ({gpus[0].memoryUsed}/{gpus[0].memoryTotal}MB)"
        except:
            pass

        return {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_total_gb': round(memory.total / (1024**3), 2),
            'memory_used_gb': round(memory.used / (1024**3), 2),
            'gpu_info': gpu_info
        }

    def register_device_callback(self, callback: Callable):
        """Register a callback for when devices are found/lost"""
        self.device_callbacks.append(callback)

    def _on_device_found(self, device: SparkDevice):
        """Internal callback when a device is found"""
        print(f"LOG: Discovered device: {device.name} at {device.address}:{device.port}")
        for callback in self.device_callbacks:
            callback('found', device.to_dict())

    def _on_device_lost(self, device: SparkDevice):
        """Internal callback when a device is lost"""
        print(f"LOG: Lost device: {device.name}")
        for callback in self.device_callbacks:
            callback('lost', device.to_dict())

    def _get_local_ip(self) -> str:
        """Get the local network IP address (not 127.0.0.1)"""
        # Method 1: Connect to an external address to determine local IP
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(0.1)
            # Doesn't actually connect, just determines the right interface
            s.connect(('8.8.8.8', 80))
            local_ip = s.getsockname()[0]
            s.close()
            if local_ip and not local_ip.startswith('127.'):
                return local_ip
        except:
            pass
        
        # Method 2: Use psutil to find the first non-loopback interface
        try:
            for iface, addrs in psutil.net_if_addrs().items():
                if iface == 'lo' or iface.startswith('lo'):
                    continue
                for addr in addrs:
                    if addr.family == socket.AF_INET and not addr.address.startswith('127.'):
                        return addr.address
        except:
            pass
        
        # Method 3: Fallback to hostname lookup
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        return local_ip

    def start_broadcasting(self, personality: str = "", model: str = ""):
        """Start broadcasting this device's presence on the network"""
        self.zeroconf = Zeroconf()

        # Get local IP
        hostname = socket.gethostname()
        local_ip = self._get_local_ip()
        print(f"LOG: Detected local IP: {local_ip}")

        # Create service info with device metadata
        properties = {
            b'role': self.role.encode('utf-8'),
            b'personality': personality.encode('utf-8'),
            b'model': model.encode('utf-8'),
            b'hostname': hostname.encode('utf-8')
        }

        # Create service name
        service_name = f"{self.device_name}.{self.SERVICE_TYPE}"

        self.service_info = ServiceInfo(
            self.SERVICE_TYPE,
            service_name,
            addresses=[socket.inet_aton(local_ip)],
            port=self.port,
            properties=properties,
            server=f"{hostname}.local."
        )

        self.zeroconf.register_service(self.service_info)
        print(f"LOG: Broadcasting as {service_name} on {local_ip}:{self.port}")
        self.running = True

    def start_discovery(self):
        """Start discovering other Spark devices on the network"""
        if not self.zeroconf:
            self.zeroconf = Zeroconf()

        self.listener = SparkServiceListener(
            on_device_found=self._on_device_found,
            on_device_lost=self._on_device_lost
        )

        self.browser = ServiceBrowser(self.zeroconf, self.SERVICE_TYPE, self.listener)
        print(f"LOG: Started discovery for {self.SERVICE_TYPE}")
        self.running = True

    def get_discovered_devices(self) -> List[Dict]:
        """Get list of all discovered devices"""
        if self.listener:
            return [device.to_dict() for device in self.listener.devices.values()]
        return []

    def stop(self):
        """Stop broadcasting and discovery"""
        print("LOG: Stopping network discovery...")
        self.running = False

        if self.browser:
            self.browser.cancel()
            self.browser = None

        if self.service_info and self.zeroconf:
            self.zeroconf.unregister_service(self.service_info)
            self.service_info = None

        if self.zeroconf:
            self.zeroconf.close()
            self.zeroconf = None

        print("LOG: Network discovery stopped")


if __name__ == "__main__":
    # Network discovery service for Spark Voice Assistant
    import sys
    import json

    device_name = sys.argv[1] if len(sys.argv) > 1 else "Spark"
    role = sys.argv[2] if len(sys.argv) > 2 else "host"

    print(f"LOG: Starting network discovery for {device_name} as {role}")
    sys.stdout.flush()

    discovery = NetworkDiscovery(device_name, role=role)

    def on_device_update(action, device):
        """Output device updates in JSON format for Electron to parse"""
        output = f"{action.upper()}: {json.dumps(device)}"
        print(output)
        sys.stdout.flush()

    discovery.register_device_callback(on_device_update)
    
    try:
        discovery.start_broadcasting(personality="", model="")
        discovery.start_discovery()
        
        print("LOG: Network discovery running...")
        sys.stdout.flush()
        
        # Keep running and periodically report discovered devices
        while True:
            time.sleep(10)
            devices = discovery.get_discovered_devices()
            if devices:
                print(f"LOG: Currently see {len(devices)} device(s)")
                for d in devices:
                    print(f"DEVICE: {json.dumps(d)}")
                sys.stdout.flush()
    except KeyboardInterrupt:
        print("LOG: Stopping network discovery...")
        discovery.stop()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.stdout.flush()
