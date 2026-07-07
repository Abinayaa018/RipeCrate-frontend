"""Entrypoint for dataset generation outside the API package."""

from app.generate_dataset import generate_dataset, inject_missing_values


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=60000)
    parser.add_argument("--out", type=str, default="dataset.csv")
    args = parser.parse_args()

    df = generate_dataset(args.rows)
    df = inject_missing_values(df)
    df.to_csv(args.out, index=False)
    print(f"Generated {len(df):,} rows -> {args.out}")
