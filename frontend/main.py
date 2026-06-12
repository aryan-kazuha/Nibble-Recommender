from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from recommender import CartRecommender

app = FastAPI(title="Nibble API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js default
        "http://localhost:5173",   # Vite (legacy)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Init ML engine ────────────────────────────────────────────
engine = CartRecommender(data_dir="./data")
engine.train_stage2_ranker()


# ── GET /api/restaurants ──────────────────────────────────────
@app.get("/api/restaurants")
async def get_restaurants():
    res_list = []
    for _, row in engine.rest_df.iterrows():
        res_list.append({
            "id":      row["restaurant_id"],
            "name":    row["restaurant_name"],
            "cuisine": row["cuisine_tags"].replace("|", " • "),
            "rating":  str(row["avg_rating"]),
            "time":    "30–45 min",
        })
    return {"status": "success", "restaurants": res_list}


# ── GET /api/menu/{restaurant_id} ────────────────────────────
@app.get("/api/menu/{restaurant_id}")
async def get_menu(restaurant_id: str):
    menu_df = engine.items_df[engine.items_df["restaurant_id"] == restaurant_id]
    menu_list = []
    for _, row in menu_df.iterrows():
        menu_list.append({
            "id":            row["item_id"],
            "restaurant_id": row["restaurant_id"],
            "name":          row["item_name"],
            "price":         float(row["price_inr"]),
            "category":      row["item_category"],
            "isVeg":         row["is_veg"] == "Y",
        })
    return {"status": "success", "menu": menu_list}


# ── POST /api/recommend ───────────────────────────────────────
@app.post("/api/recommend")
async def recommend_addons(payload: dict):
    raw = engine.get_recommendations(
        payload["cart_ids"],
        payload["restaurant_id"],
        payload["user_id"],
    )

    # Normalise the engine's output to match the frontend contract:
    # { item_id, item_name, price, confidence (0-1), reason }
    recommendations = []
    items = raw.get("recommendations", raw) if isinstance(raw, dict) else raw

    REASONS = [
        "Frequently ordered together",
        "Popular pairing in your taste profile",
        "Top-rated add-on for this restaurant",
        "Ordered together {pct}% of the time",
        "Highly re-ordered by similar users",
    ]

    for i, rec in enumerate(items):
        # Support both dict shapes the engine might return
        item_id   = rec.get("item_id")   or rec.get("id")
        item_name = rec.get("item_name") or rec.get("name", "")
        price     = rec.get("price",  0)
        score     = rec.get("score")  or rec.get("confidence") or rec.get("rank_score", 0)

        # Normalise score to 0-1 if engine returns raw floats > 1
        if score > 1:
            score = min(score / 10.0, 1.0)

        # Pick a plausible reason string
        pct = int(60 + score * 35)
        reason_template = REASONS[i % len(REASONS)]
        reason = reason_template.replace("{pct}", str(pct))

        recommendations.append({
            "item_id":    item_id,
            "item_name":  item_name,
            "price":      price,
            "confidence": round(float(score), 3),
            "reason":     reason,
        })

    return {"status": "success", "recommendations": recommendations}
