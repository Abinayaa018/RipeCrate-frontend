"""Data preprocessing utilities for the RipeCrate ML pipeline."""

from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent / "datasets" / "raw"
PROCESSED_DIR = Path(__file__).resolve().parent / "datasets" / "processed"


def clean_raw_data(input_path: Path, output_path: Path) -> None:
    """Load raw dataset, clean it, and save the processed version."""
    raise NotImplementedError("Implement raw data cleaning and validation.")


if __name__ == "__main__":
    print("Run preprocessing functions from this module.")
