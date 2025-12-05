import sys
import os
import subprocess
import argparse
import shutil

def find_parallax_cli():
    """Find the parallax CLI, checking venv first"""
    # First check if it's in the same venv as this Python
    venv_bin = os.path.dirname(sys.executable)
    venv_parallax = os.path.join(venv_bin, "parallax")
    if os.path.exists(venv_parallax):
        return venv_parallax
    
    # Check common locations relative to script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    possible_paths = [
        os.path.join(project_dir, "parallax", "venv", "bin", "parallax"),
        os.path.join(project_dir, "venv", "bin", "parallax"),
        os.path.join(os.path.expanduser("~"), ".local", "bin", "parallax"),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    # Finally check system PATH
    return shutil.which("parallax")

def main():
    parser = argparse.ArgumentParser(description="Start Parallax Host (Scheduler)")
    parser.add_argument("--model", type=str, default="Qwen/Qwen3-0.6B", help="Model to load")
    parser.add_argument("--nodes", type=int, default=1, help="Number of worker nodes expected")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to bind to (0.0.0.0 for network access)")
    args, unknown = parser.parse_known_args()

    # Check if parallax CLI is available
    parallax_path = find_parallax_cli()
    
    if not parallax_path:
        print("PYTHON_BRIDGE: ERROR - Parallax CLI not found!")
        print("PYTHON_BRIDGE: Please install Parallax first:")
        print("PYTHON_BRIDGE:   cd parallax-i-need-a-spark")
        print("PYTHON_BRIDGE:   ./install.sh")
        print("PYTHON_BRIDGE: Or manually:")
        print("PYTHON_BRIDGE:   source parallax/venv/bin/activate")
        print("PYTHON_BRIDGE:   pip install -e './parallax[mac]'")
        sys.exit(1)
    
    print(f"PYTHON_BRIDGE: Found Parallax CLI at: {parallax_path}")
    
    print(f"PYTHON_BRIDGE: Found Parallax CLI at: {parallax_path}")

    # Use the Parallax CLI to run the scheduler
    # parallax run -m {model} -n {nodes} --host 0.0.0.0
    cmd = [
        parallax_path, "run",
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
