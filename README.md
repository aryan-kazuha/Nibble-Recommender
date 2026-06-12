# Two-Stage E-Commerce Recommendation System

A full-stack web application featuring a production-inspired, two-stage recommendation engine built with a PyTorch Two-Tower Neural Network (Stage 1: Retrieval) and a LightGBM Classifier Ranker (Stage 2: Ranking). The system serves real-time, personalized product suggestions based on active cart items through a FastAPI backend and a Next.js frontend.

## Core Features

* **Two-Stage Recommendation Engine:** Implements an industry-standard Retrieval and Ranking pipeline designed to deliver real-time personalized product suggestions based on active cart items.
* **Synthetic Data Simulation:** Synthesized a custom e-commerce dataset mapping user behaviors and product attributes to accurately simulate real-world cold-start and high-sparsity transaction scenarios.
* **Semantic Candidate Retrieval:** Implemented a Two-Tower Neural Network for the candidate generation stage, mapping user and item interactions into a shared embedding space to capture deep semantic similarities.
* **High-Precision Ranking:** Built a LightGBM ranking layer as the final stage to score retrieved candidates, optimizing for click/purchase probability to maximize Average Order Value (AOV).

---

## Technical Stack

* **Machine Learning & Modeling:** PyTorch, LightGBM, Pandas, NumPy, Scikit-learn
* **Backend API:** FastAPI, Pydantic, Python, Uvicorn
* **Frontend UI:** Next.js, TypeScript, Tailwind CSS

---

## System Architecture

1. **User Action / Active Cart:** The user adds items to their cart on the Next.js frontend, triggering a real-time API request to the backend.
2. **Stage 1: Retrieval (Two-Tower Model):** The PyTorch-based retrieval tower evaluates active cart items against the embedding space to safely narrow down thousands of catalog items into a handful of high-recall candidates.
3. **Stage 2: Ranking (LightGBM):** The retrieved candidates are passed to the LightGBM Classifier, which scores and ranks them based on user history, product attributes, and cross-feature interactions to maximize purchase likelihood.
4. **Delivery:** The top ranked recommendations are delivered via FastAPI endpoints and dynamically rendered on the client side.

---

## Deployment Links
* **Live Web Application:** https://nibble-frontend-mu.vercel.app/
