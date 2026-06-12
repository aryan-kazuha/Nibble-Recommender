const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: string;
  time: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  category: string;
  isVeg: boolean;
}

export interface Recommendation {
  item_id: string;
  item_name: string;
  price: number;
  confidence: number;
  reason?: string;
}

export interface RecommendPayload {
  cart_ids: string[];
  restaurant_id: string;
  user_id: string;
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  getRestaurants: () =>
    fetchJSON<{ status: string; restaurants: Restaurant[] }>("/api/restaurants").then(
      (r) => r.restaurants
    ),

  getMenu: (restaurantId: string) =>
    fetchJSON<{ status: string; menu: MenuItem[] }>(`/api/menu/${restaurantId}`).then(
      (r) => r.menu
    ),

  getRecommendations: (payload: RecommendPayload) =>
    fetchJSON<{ status: string; recommendations: Recommendation[] }>("/api/recommend", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((r) => r.recommendations),
};
