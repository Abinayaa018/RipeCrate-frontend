"""Combine raw, processed, and synthetic data sources into a unified dataset."""

from pathlib import Path

RAW_DIR = Path(__file__).resolve().parent / "datasets" / "raw"
SYNTHETIC_DIR = Path(__file__).resolve().parent / "datasets" / "synthetic"
FINAL_DIR = Path(__file__).resolve().parent / "datasets" / "final"


def merge_sources(output_path: Path) -> None:
    """Merge available datasets into a final training dataset."""
    raise NotImplementedError("Implement dataset merging and deduplication.")


if __name__ == "__main__":
    print("Run dataset merging from this module.")
