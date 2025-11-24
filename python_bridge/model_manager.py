"""
Model Management System
Handles downloading, caching, and managing AI models from Hugging Face
"""
import os
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Callable
from huggingface_hub import hf_hub_download, list_repo_files, model_info, HfApi
from tqdm import tqdm
import requests


class ModelManager:
    """Manages AI model downloads and local cache"""

    def __init__(self, cache_dir: Optional[str] = None):
        """
        Initialize the model manager

        Args:
            cache_dir: Directory to store downloaded models. Defaults to ~/.cache/spark-models
        """
        if cache_dir is None:
            self.cache_dir = Path.home() / ".cache" / "spark-models"
        else:
            self.cache_dir = Path(cache_dir)

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.cache_dir / "models_metadata.json"
        self.metadata = self._load_metadata()
        self.api = HfApi()

    def _load_metadata(self) -> Dict:
        """Load metadata about downloaded models"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_metadata(self):
        """Save metadata about downloaded models"""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)

    def get_popular_models(self, task: str = "text-generation", limit: int = 20) -> List[Dict]:
        """
        Get list of popular models from Hugging Face

        Args:
            task: Model task type (text-generation, text-to-speech, etc.)
            limit: Maximum number of models to return

        Returns:
            List of model info dictionaries
        """
        try:
            models = []
            model_list = self.api.list_models(
                task=task,
                sort="downloads",
                limit=limit,
                cardData=True
            )

            for model in model_list:
                try:
                    info = model_info(model.modelId)
                    size_mb = 0

                    # Try to estimate size
                    if hasattr(info, 'siblings') and info.siblings:
                        size_mb = sum(s.size for s in info.siblings if hasattr(s, 'size')) / (1024 * 1024)

                    models.append({
                        'id': model.modelId,
                        'name': model.modelId.split('/')[-1],
                        'author': model.modelId.split('/')[0] if '/' in model.modelId else 'unknown',
                        'downloads': getattr(model, 'downloads', 0),
                        'likes': getattr(model, 'likes', 0),
                        'size_mb': round(size_mb, 2),
                        'tags': getattr(model, 'tags', []),
                        'description': getattr(info, 'description', '')[:200] if hasattr(info, 'description') else ''
                    })
                except Exception as e:
                    print(f"Error getting info for {model.modelId}: {e}")
                    continue

            return models
        except Exception as e:
            print(f"Error fetching popular models: {e}")
            return []

    def download_model(
        self,
        model_id: str,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> Optional[str]:
        """
        Download a model from Hugging Face

        Args:
            model_id: Hugging Face model identifier (e.g., "meta-llama/Llama-2-7b")
            progress_callback: Optional callback function(downloaded_bytes, total_bytes)

        Returns:
            Path to downloaded model directory or None if failed
        """
        try:
            print(f"LOG: Starting download of model: {model_id}")

            # Create model directory
            model_dir = self.cache_dir / model_id.replace('/', '_')
            model_dir.mkdir(parents=True, exist_ok=True)

            # Get list of files in the repo
            files = list_repo_files(model_id)
            print(f"LOG: Found {len(files)} files in repository")

            # Download each file
            downloaded_files = []
            total_files = len(files)

            for idx, filename in enumerate(files):
                try:
                    print(f"LOG: Downloading {filename} ({idx + 1}/{total_files})...")

                    # Download file
                    local_path = hf_hub_download(
                        repo_id=model_id,
                        filename=filename,
                        cache_dir=str(model_dir),
                        resume_download=True
                    )

                    downloaded_files.append({
                        'filename': filename,
                        'path': local_path
                    })

                    if progress_callback:
                        progress_callback(idx + 1, total_files)

                except Exception as e:
                    print(f"ERROR: Failed to download {filename}: {e}")
                    continue

            # Save metadata
            self.metadata[model_id] = {
                'model_dir': str(model_dir),
                'files': downloaded_files,
                'download_date': str(Path.ctime(model_dir))
            }
            self._save_metadata()

            print(f"LOG: Successfully downloaded {model_id} to {model_dir}")
            return str(model_dir)

        except Exception as e:
            print(f"ERROR: Failed to download model {model_id}: {e}")
            return None

    def get_local_models(self) -> List[Dict]:
        """Get list of all locally downloaded models"""
        local_models = []

        for model_id, info in self.metadata.items():
            model_dir = Path(info['model_dir'])
            if model_dir.exists():
                # Calculate total size
                total_size = sum(
                    Path(f['path']).stat().st_size if Path(f['path']).exists() else 0
                    for f in info.get('files', [])
                )

                local_models.append({
                    'id': model_id,
                    'name': model_id.split('/')[-1],
                    'path': str(model_dir),
                    'size_mb': round(total_size / (1024 * 1024), 2),
                    'files_count': len(info.get('files', [])),
                    'download_date': info.get('download_date', 'Unknown')
                })

        return local_models

    def delete_model(self, model_id: str) -> bool:
        """Delete a locally cached model"""
        try:
            if model_id in self.metadata:
                model_dir = Path(self.metadata[model_id]['model_dir'])
                if model_dir.exists():
                    import shutil
                    shutil.rmtree(model_dir)
                    print(f"LOG: Deleted model directory: {model_dir}")

                del self.metadata[model_id]
                self._save_metadata()
                print(f"LOG: Removed {model_id} from cache")
                return True
            else:
                print(f"ERROR: Model {model_id} not found in cache")
                return False
        except Exception as e:
            print(f"ERROR: Failed to delete model {model_id}: {e}")
            return False

    def get_model_path(self, model_id: str) -> Optional[str]:
        """Get the local path to a downloaded model"""
        if model_id in self.metadata:
            model_dir = Path(self.metadata[model_id]['model_dir'])
            if model_dir.exists():
                return str(model_dir)
        return None

    def verify_model_integrity(self, model_id: str) -> bool:
        """Verify that all files for a model are present"""
        if model_id not in self.metadata:
            return False

        for file_info in self.metadata[model_id].get('files', []):
            if not Path(file_info['path']).exists():
                print(f"ERROR: Missing file: {file_info['filename']}")
                return False

        return True


if __name__ == "__main__":
    # Test the model manager
    manager = ModelManager()

    print("=== Popular Text Generation Models ===")
    models = manager.get_popular_models(limit=10)
    for model in models[:5]:
        print(f"{model['id']}: {model['downloads']} downloads, ~{model['size_mb']} MB")

    print("\n=== Local Models ===")
    local_models = manager.get_local_models()
    if local_models:
        for model in local_models:
            print(f"{model['id']}: {model['size_mb']} MB, {model['files_count']} files")
    else:
        print("No models downloaded yet")
