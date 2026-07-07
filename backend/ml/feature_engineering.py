"""Feature engineering helpers for RipeCrate ML workflows."""

from pathlib import Path

PROCESSED_DIR = Path(__file__).resolve().parent / "datasets" / "processed"
FINAL_DIR = Path(__file__).resolve().parent / "datasets" / "final"


def create_features(input_path: Path, output_path: Path) -> None:
    """Transform processed data into model-ready features."""
    raise NotImplementedError("Implement feature extraction and transformation logic.")


if __name__ == "__main__":
    print("Run feature engineering tasks from this module.")
