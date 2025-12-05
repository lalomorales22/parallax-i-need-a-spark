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

    def start_broadcasting(self, personality: str = "", model: str = ""):
        """Start broadcasting this device's presence on the network"""
        self.zeroconf = Zeroconf()

        # Get local IP
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)

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
    # Test the network discovery
    import sys

    device_name = sys.argv[1] if len(sys.argv) > 1 else "TestSpark"
    role = sys.argv[2] if len(sys.argv) > 2 else "host"

    discovery = NetworkDiscovery(device_name, role=role)

    def print_devices(action, device):
        print(f"{action.upper()}: {device}")

    discovery.register_device_callback(print_devices)
    discovery.start_broadcasting(personality="Test Device", model="Llama-3")
    discovery.start_discovery()

    try:
        print("Discovering devices... (Ctrl+C to stop)")
        while True:
            time.sleep(5)
            devices = discovery.get_discovered_devices()
            print(f"\nCurrently discovered devices: {len(devices)}")
            for d in devices:
                print(f"  - {d['name']} ({d['address']}:{d['port']}) - {d['role']}")
    except KeyboardInterrupt:
        print("\nStopping...")
        discovery.stop()
