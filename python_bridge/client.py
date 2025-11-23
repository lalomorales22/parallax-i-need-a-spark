import sys
import os
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser(description="Start Parallax Client")
    parser.add_argument("--scheduler-addr", type=str, required=True, help="Address of the Host Scheduler")
    args, unknown = parser.parse_known_args()

    # Calculate project root (../../src from this file)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../src"))
    
    # Path to launch.py
    launch_script = os.path.join(project_root, "parallax/launch.py")

    # Construct command
    cmd = [
        sys.executable,
        launch_script,
        "--scheduler-addr", args.scheduler_addr,
        # Pass through any other unknown arguments
    ] + unknown

    print(f"PYTHON_BRIDGE: Starting Client connecting to {args.scheduler_addr}")
    print(f"PYTHON_BRIDGE: Command: {' '.join(cmd)}")

    # Set PYTHONPATH to include src
    env = os.environ.copy()
    env["PYTHONPATH"] = project_root + os.pathsep + env.get("PYTHONPATH", "")

    try:
        # Run the process and stream output
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT, 
            text=True, 
            bufsize=1,
            env=env
        )

        for line in process.stdout:
            print(line, end='')
            sys.stdout.flush()

        process.wait()
    except KeyboardInterrupt:
        print("PYTHON_BRIDGE: Stopping Client...")
        process.terminate()

if __name__ == "__main__":
    main()
