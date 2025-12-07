import sys
import os
import subprocess
import argparse
import shutil

def main():
    parser = argparse.ArgumentParser(description="Start Parallax Client (Node Worker)")
    parser.add_argument("--scheduler-addr", type=str, default=None, 
                        help="Scheduler address (peer ID) for remote connection. Leave empty for local network auto-discovery.")
    args, unknown = parser.parse_known_args()

    # Check if parallax CLI is available
    parallax_path = shutil.which("parallax")
    
    if not parallax_path:
        print("PYTHON_BRIDGE: ERROR - Parallax CLI not found!")
        print("PYTHON_BRIDGE: Please install Parallax first:")
        print("PYTHON_BRIDGE:   git clone https://github.com/GradientHQ/parallax.git")
        print("PYTHON_BRIDGE:   cd parallax")
        print("PYTHON_BRIDGE:   pip install -e '.[mac]'  # For macOS")
        print("PYTHON_BRIDGE:   pip install -e '.[gpu]'  # For Linux with GPU")
        sys.exit(1)

    # Use the Parallax CLI to join as a node
    # parallax join [-s scheduler-address]
    cmd = ["parallax", "join", "-u"]  # -u disables telemetry
    
    if args.scheduler_addr:
        scheduler_addr = args.scheduler_addr
        
        # Check if it's an IP address (simple check)
        is_ip = False
        try:
            import socket
            socket.inet_aton(scheduler_addr)
            is_ip = True
        except:
            pass
            
        if is_ip or scheduler_addr == "localhost":
            print(f"PYTHON_BRIDGE: Detected IP address: {scheduler_addr}")
            print(f"PYTHON_BRIDGE: Fetching join command from host API...")
            try:
                import requests
                response = requests.get(f"http://{scheduler_addr}:3001/node/join/command", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    # data['data'] contains the full command, e.g. "parallax join -s PEER_ID"
                    # We just want the peer ID usually, but let's see what it returns
                    # Actually, let's just use the peer ID if we can extract it, or use the full command logic?
                    # The join command might be complex.
                    # Let's try to extract the peer ID from the response if possible, 
                    # or just use the IP if parallax supports it (unlikely).
                    # Wait, the /node/join/command returns a string command.
                    # Let's try to parse it.
                    join_cmd = data.get('data', '')
                    print(f"PYTHON_BRIDGE: Received join command: {join_cmd}")
                    
                    # Extract -s argument
                    parts = join_cmd.split()
                    if '-s' in parts:
                        idx = parts.index('-s')
                        if idx + 1 < len(parts):
                            scheduler_addr = parts[idx + 1]
                            print(f"PYTHON_BRIDGE: Extracted Peer ID: {scheduler_addr}")
            except Exception as e:
                print(f"PYTHON_BRIDGE: Error fetching from host API: {e}")
                print(f"PYTHON_BRIDGE: Falling back to using {scheduler_addr} directly")

        # Remote connection with explicit scheduler address
        cmd.extend(["-s", scheduler_addr])
        # Always use relay for remote connections to ensure connectivity
        cmd.append("-r")
        print(f"PYTHON_BRIDGE: Joining Parallax network (remote mode)")
        print(f"PYTHON_BRIDGE: Scheduler: {scheduler_addr}")
        print(f"PYTHON_BRIDGE: Using relay servers for better connectivity")
    else:
        # Local network auto-discovery
        print(f"PYTHON_BRIDGE: Joining Parallax network (local auto-discovery)")
    
    cmd.extend(unknown)
    
    print(f"PYTHON_BRIDGE: Command: {' '.join(cmd)}")
    print(f"PYTHON_BRIDGE: ")
    print(f"PYTHON_BRIDGE: This node will contribute compute power to the cluster.")
    print(f"PYTHON_BRIDGE: Node API will be available at http://localhost:3000")
    print(f"PYTHON_BRIDGE: ")
    sys.stdout.flush()

    try:
        # Run the process and stream output
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True, 
            bufsize=1
        )

        for line in process.stdout:
            print(line, end='')
            sys.stdout.flush()

        process.wait()
    except FileNotFoundError:
        print("PYTHON_BRIDGE: ERROR - Could not run 'parallax' command")
        print("PYTHON_BRIDGE: Make sure Parallax is installed and in your PATH")
    except KeyboardInterrupt:
        print("PYTHON_BRIDGE: Stopping Parallax Node...")
        process.terminate()

if __name__ == "__main__":
    main()
