import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type RecommendPayload } from "@/lib/api";

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: api.getRestaurants,
    staleTime: 5 * 60 * 1000, // 5 min — restaurant list doesn't change often
  });
}

export function useMenu(restaurantId: string | null) {
  return useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => api.getMenu(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecommendations(payload: RecommendPayload | null) {
  return useQuery({
    queryKey: [
      "recommendations",
      payload?.restaurant_id,
      payload?.cart_ids.sort().join(","),
      payload?.user_id,
    ],
    queryFn: () => api.getRecommendations(payload!),
    enabled: !!payload && payload.cart_ids.length > 0,
    staleTime: 30 * 1000, // rec results are cart-specific — 30s is enough
    placeholderData: (prev) => prev, // keep previous recs while re-fetching
  });
}
