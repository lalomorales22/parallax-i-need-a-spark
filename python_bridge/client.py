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
        # Remote connection with explicit scheduler address
        cmd.extend(["-s", args.scheduler_addr])
        print(f"PYTHON_BRIDGE: Joining Parallax network (remote mode)")
        print(f"PYTHON_BRIDGE: Scheduler: {args.scheduler_addr}")
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
