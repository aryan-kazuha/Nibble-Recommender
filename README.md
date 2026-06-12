# Nibble - Full-Stack Food Recommendation App

A full-stack web application featuring a two-stage recommendation engine built with a PyTorch GRU model (Stage 1) and a LightGBM Classifier Ranker (Stage 2), served via a FastAPI backend and a Next.js frontend.

## Project Structure

```text
├── backend/               # FastAPI & Machine Learning Engine
│   ├── data/              # CSV Datasets
│   ├── models/            # Saved Pre-trained Weights (.pt, .pkl)
│   ├── main.py            # API Entry Point
│   ├── recommender.py     # ML Model Code
│   └── requirements.txt   # Python Dependencies
└── frontend/              # Next.js Web App
    ├── src/               # React Components & Pages
    ├── package.json       # Node Dependencies
    └── next.config.js     # NextJS Configuration