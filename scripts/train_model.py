"""Entrypoint for training models outside the API package."""

from app.train_model import main


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="dataset.csv")
    args = parser.parse_args()
    main(args.data)
