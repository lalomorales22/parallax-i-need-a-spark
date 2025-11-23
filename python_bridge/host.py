import sys
import os
import subprocess
import argparse

def main():
    parser = argparse.ArgumentParser(description="Start Parallax Host")
    parser.add_argument("--model", type=str, default="Qwen/Qwen2.5-0.5B-Instruct", help="Model to load")
    parser.add_argument("--port", type=str, default="8888", help="HTTP Port")
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
        "--model-path", args.model,
        "--port", args.port,
        # Pass through any other unknown arguments
    ] + unknown

    print(f"PYTHON_BRIDGE: Starting Host with command: {' '.join(cmd)}")
    print(f"PYTHON_BRIDGE: Project Root: {project_root}")

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
        print("PYTHON_BRIDGE: Stopping Host...")
        process.terminate()

if __name__ == "__main__":
    main()
