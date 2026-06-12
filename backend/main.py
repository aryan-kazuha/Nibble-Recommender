from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from recommender import CartRecommender

app = FastAPI(title="Nibble API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Init engine once at startup ──────────────────────────────
engine = CartRecommender(data_dir="data")
engine.train_stage2_ranker()


# ── Request models ───────────────────────────────────────────
class RecommendRequest(BaseModel):
    cart_ids: List[str]
    restaurant_id: str
    user_id: str


# ── Routes ───────────────────────────────────────────────────
@app.get("/api/restaurants")
async def get_restaurants():
    restaurants = []
    for _, row in engine.rest_df.iterrows():
        restaurants.append({
            "id":      row["restaurant_id"],
            "name":    row["restaurant_name"],
            "cuisine": row["cuisine_tags"].replace("|", " • "),
            "rating":  str(row["avg_rating"]),
            "time":    "30–45 min",
        })
    return {"status": "success", "restaurants": restaurants}


@app.get("/api/menu/{restaurant_id}")
async def get_menu(restaurant_id: str):
    menu_df = engine.items_df[engine.items_df["restaurant_id"] == restaurant_id]
    if menu_df.empty:
        raise HTTPException(status_code=404, detail=f"Restaurant {restaurant_id} not found")
    menu = []
    for _, row in menu_df.iterrows():
        menu.append({
            "id":            row["item_id"],
            "restaurant_id": row["restaurant_id"],
            "name":          row["item_name"],
            "price":         float(row["price_inr"]),
            "category":      row["item_category"],
            "isVeg":         row["is_veg"] == "Y",
        })
    return {"status": "success", "menu": menu}


@app.post("/api/recommend")
async def recommend(payload: RecommendRequest):
    result = engine.get_recommendations(
        current_cart_ids=payload.cart_ids,
        restaurant_id=payload.restaurant_id,
        user_id=payload.user_id,
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result


@app.get("/health")
async def health():
    return {"status": "ok", "trained": engine.is_trained}
