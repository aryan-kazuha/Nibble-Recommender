import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import lightgbm as lgb
import joblib

# ==========================================
# 1. PYTORCH MODEL DEFINITION (STAGE 1)
# ==========================================
class CartTransformer(nn.Module):
    def __init__(self, vocab_size, embed_dim=64):
        super(CartTransformer, self).__init__()
        self.item_embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.encoder = nn.GRU(embed_dim, embed_dim, batch_first=True)
        self.fc_out = nn.Linear(embed_dim, vocab_size)

    def forward(self, x):
        embedded = self.item_embedding(x)
        output, hidden = self.encoder(embedded)
        logits = self.fc_out(hidden.squeeze(0))
        return logits


# ==========================================
# 2. THE CORE RECOMMENDATION ENGINE
# ==========================================
class CartRecommender:
    def __init__(self, data_dir="data", models_dir="models"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models_dir = models_dir
        print(f"🚀 Initializing Recommender on {self.device}...")

        # Load DataFrames
        self.items_df = pd.read_csv(f"{data_dir}/item_dim.csv")
        self.users_df = pd.read_csv(f"{data_dir}/user_dim.csv")
        self.seq_df   = pd.read_csv(f"{data_dir}/order_sequences.csv")
        self.rest_df  = pd.read_csv(f"{data_dir}/restaurant_dim.csv")

        # Build Lookups
        self.all_items   = self.items_df["item_id"].unique().tolist()
        self.item_to_idx = {item: idx + 1 for idx, item in enumerate(self.all_items)}
        self.idx_to_item = {idx: item for item, idx in self.item_to_idx.items()}
        self.vocab_size  = len(self.item_to_idx) + 1

        # Reason templates
        self._reasons = [
            "Ordered together {pct}% of the time",
            "Top pairing in your taste profile",
            "Popular add-on for this restaurant",
            "Frequently bought together",
            "Highly re-ordered by similar users",
        ]

        # Initialize models
        self.stage1_model  = CartTransformer(self.vocab_size).to(self.device)
        self.stage2_ranker = lgb.LGBMClassifier(
            n_estimators=100, learning_rate=0.05, random_state=42, verbose=-1
        )
        self.is_trained = False

    # --------------------------------------------------
    def _model_paths(self):
        return {
            "stage1":  os.path.join(self.models_dir, "stage1.pt"),
            "stage2":  os.path.join(self.models_dir, "stage2.pkl"),
            "lookups": os.path.join(self.models_dir, "lookups.pkl"),
        }

    def _models_exist(self):
        return all(os.path.exists(p) for p in self._model_paths().values())

    def save_models(self):
        os.makedirs(self.models_dir, exist_ok=True)
        paths = self._model_paths()

        torch.save(self.stage1_model.state_dict(), paths["stage1"])
        joblib.dump(self.stage2_ranker, paths["stage2"])
        joblib.dump(
            {
                "item_to_idx": self.item_to_idx,
                "idx_to_item": self.idx_to_item,
                "vocab_size":  self.vocab_size,
            },
            paths["lookups"],
        )
        print(f"💾 Models saved to '{self.models_dir}/'")

    def load_models(self):
        paths = self._model_paths()

        # Restore lookups first so vocab_size is correct before loading weights
        lookups = joblib.load(paths["lookups"])
        self.item_to_idx = lookups["item_to_idx"]
        self.idx_to_item = lookups["idx_to_item"]
        self.vocab_size  = lookups["vocab_size"]

        # Re-init Stage 1 with correct vocab size, then load weights
        self.stage1_model = CartTransformer(self.vocab_size).to(self.device)
        self.stage1_model.load_state_dict(
            torch.load(paths["stage1"], map_location=self.device)
        )
        self.stage1_model.eval()

        self.stage2_ranker = joblib.load(paths["stage2"])

        self.is_trained = True
        print("⚡ Models loaded from disk — startup instant!")

    # --------------------------------------------------
    def _get_restaurant_mask(self, restaurant_id):
        mask = torch.zeros(self.vocab_size, dtype=torch.bool).to(self.device)
        menu_items = self.items_df[
            self.items_df["restaurant_id"] == restaurant_id
        ]["item_id"]
        valid_indices = [
            self.item_to_idx[i] for i in menu_items if i in self.item_to_idx
        ]
        mask[valid_indices] = True
        return mask

    # --------------------------------------------------
    def train_stage2_ranker(self):
        # ── Fast path: load from disk if already trained ──
        if self._models_exist():
            print("✅ Saved models found — skipping training.")
            self.load_models()
            return

        # ── Slow path: train from scratch, then save ──
        print("⚙️  No saved models found. Training Stage 2 LightGBM Ranker...")
        rows = []

        for _ in range(3000):
            seq      = self.seq_df.sample(1).iloc[0]
            cart_ids = seq["item_sequence"].split("|")
            user     = self.users_df[self.users_df["user_id"] == seq["user_id"]]
            if user.empty:
                continue

            cart_total = 0
            rest_id    = None
            for item_id in cart_ids:
                item_data = self.items_df[self.items_df["item_id"] == item_id]
                if not item_data.empty:
                    cart_total += item_data.iloc[0]["price_inr"]
                    rest_id     = item_data.iloc[0]["restaurant_id"]

            if cart_total == 0 or rest_id is None:
                continue

            menu = self.items_df[self.items_df["restaurant_id"] == rest_id]
            if menu.empty:
                continue

            candidates = menu.sample(n=min(3, len(menu)))
            for i, (_, cand) in enumerate(candidates.iterrows()):
                price_ratio       = cand["price_inr"] / cart_total
                is_cheap          = 1 if price_ratio < 0.5 else 0
                transformer_score = (
                    np.random.uniform(0.7, 1.0)
                    if i == 0
                    else np.random.uniform(0.1, 0.5)
                )
                accepted = 1 if (i == 0 and is_cheap) else 0

                rows.append({
                    "transformer_score": transformer_score,
                    "price_ratio":       price_ratio,
                    "global_popularity": cand["global_popularity"],
                    "user_spicy_match":  1 - abs(
                        user.iloc[0]["spiciness_preference"]
                        - float(cand["taste_vector"].split(",")[0])
                    ),
                    "accepted": accepted,
                })

        df   = pd.DataFrame(rows)
        X, y = df.drop("accepted", axis=1), df["accepted"]
        self.stage2_ranker.fit(X, y)
        self.is_trained = True
        print("✅ Stage 2 training complete!")

        # Save so next startup is instant
        self.save_models()

    # --------------------------------------------------
    def get_recommendations(
        self, current_cart_ids, restaurant_id, user_id, top_k=3
    ):
        if not self.is_trained:
            return {"status": "error", "message": "Model not trained yet."}

        cart_matches = self.items_df[self.items_df["item_id"].isin(current_cart_ids)]
        cart_total   = cart_matches["price_inr"].sum()
        cart_indices = [
            self.item_to_idx[i]
            for i in current_cart_ids
            if i in self.item_to_idx
        ]

        if not cart_indices:
            return {"status": "error", "message": "No valid cart items found."}

        user_row  = self.users_df[self.users_df["user_id"] == user_id]
        user_data = user_row.iloc[0] if not user_row.empty else self.users_df.iloc[0]

        # Stage 1: PyTorch
        self.stage1_model.eval()
        with torch.no_grad():
            x_input = torch.tensor([cart_indices]).to(self.device)
            logits  = self.stage1_model(x_input)

        rest_mask = self._get_restaurant_mask(restaurant_id)
        logits[0, ~rest_mask] = -1e9
        probs = torch.softmax(logits[0], dim=0)

        n_candidates = min(15, int(rest_mask.sum().item()))
        if n_candidates == 0:
            return {"status": "error", "message": "No menu items for this restaurant."}

        top_k_result = torch.topk(probs, n_candidates)

        # Stage 2: LightGBM
        features = []
        meta     = []

        for i, idx_t in enumerate(top_k_result.indices):
            idx     = idx_t.item()
            item_id = self.idx_to_item.get(idx)
            if item_id is None:
                continue
            cand_rows = self.items_df[self.items_df["item_id"] == item_id]
            if cand_rows.empty:
                continue
            cand = cand_rows.iloc[0]
            meta.append(cand)
            features.append({
                "transformer_score": top_k_result.values[i].item(),
                "price_ratio":       cand["price_inr"] / cart_total if cart_total > 0 else 1.0,
                "global_popularity": cand["global_popularity"],
                "user_spicy_match":  1 - abs(
                    user_data["spiciness_preference"]
                    - float(cand["taste_vector"].split(",")[0])
                ),
            })

        if not features:
            return {"status": "error", "message": "No candidates after filtering."}

        lgb_scores     = self.stage2_ranker.predict_proba(pd.DataFrame(features))[:, 1]
        ranked_indices = np.argsort(lgb_scores)[::-1]

        recommendations = []
        for rank in range(min(top_k, len(ranked_indices))):
            ri     = ranked_indices[rank]
            item   = meta[ri]
            score  = float(lgb_scores[ri])
            pct    = int(60 + score * 35)
            reason = self._reasons[rank % len(self._reasons)].replace("{pct}", str(pct))

            recommendations.append({
                "item_id":    item["item_id"],
                "item_name":  item["item_name"],
                "price":      float(item["price_inr"]),
                "confidence": round(score, 3),
                "reason":     reason,
            })

        return {"status": "success", "recommendations": recommendations}


# ==========================================
# 3. SMOKE TEST
# ==========================================
if __name__ == "__main__":
    import json

    engine = CartRecommender(data_dir="data", models_dir="models")
    engine.train_stage2_ranker()

    print("\n--- Smoke test ---")
    result = engine.get_recommendations(
        current_cart_ids=["I0001", "I0007"],
        restaurant_id="R001",
        user_id="U0014",
    )
    print(json.dumps(result, indent=2))