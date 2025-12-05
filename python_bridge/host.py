import sys
import os
import subprocess
import argparse
import shutil

def main():
    parser = argparse.ArgumentParser(description="Start Parallax Host (Scheduler)")
    parser.add_argument("--model", type=str, default="Qwen/Qwen3-0.6B", help="Model to load")
    parser.add_argument("--nodes", type=int, default=1, help="Number of worker nodes expected")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to bind to (0.0.0.0 for network access)")
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

    # Use the Parallax CLI to run the scheduler
    # parallax run -m {model} -n {nodes} --host 0.0.0.0
    cmd = [
        "parallax", "run",
        "-m", args.model,
        "-n", str(args.nodes),
        "--host", args.host,
        "-u",  # Disable usage telemetry
    ] + unknown

    print(f"PYTHON_BRIDGE: Starting Parallax Scheduler...")
    print(f"PYTHON_BRIDGE: Model: {args.model}")
    print(f"PYTHON_BRIDGE: Expected nodes: {args.nodes}")
    print(f"PYTHON_BRIDGE: Command: {' '.join(cmd)}")
    print(f"PYTHON_BRIDGE: ")
    print(f"PYTHON_BRIDGE: The Parallax setup UI will be available at http://localhost:3001")
    print(f"PYTHON_BRIDGE: The chat API will be at http://localhost:3001/v1/chat/completions")
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
        print("PYTHON_BRIDGE: Stopping Parallax Scheduler...")
        process.terminate()

if __name__ == "__main__":
    main()
