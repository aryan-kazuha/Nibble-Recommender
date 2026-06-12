"use client";

import { useRouter } from "next/navigation";
import styles from "./RestaurantCard.module.css";
import { useStore } from "@/store/useStore";
import type { Restaurant } from "@/lib/api";

const CUISINE_EMOJIS: Record<string, string> = {
  "South Indian": "🍽️",
  Biryani: "🍛",
  Pizza: "🍕",
  Burgers: "🍔",
  Chinese: "🥡",
  Continental: "🥩",
  Desserts: "🍮",
  Sweets: "🍮",
  Asian: "🍜",
  "North Indian": "🫕",
  Default: "🍴",
};

function getCuisineEmoji(cuisine: string): string {
  for (const [key, emoji] of Object.entries(CUISINE_EMOJIS)) {
    if (cuisine.includes(key)) return emoji;
  }
  return CUISINE_EMOJIS.Default;
}

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const setRestaurant = useStore((s) => s.setRestaurant);

  const handleClick = () => {
    setRestaurant(restaurant);
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <button className={styles.card} onClick={handleClick} aria-label={`Open ${restaurant.name}`}>
      <div className={styles.avatar} aria-hidden="true">
        {getCuisineEmoji(restaurant.cuisine)}
      </div>
      <div className={styles.name}>{restaurant.name}</div>
      <div className={styles.cuisine}>{restaurant.cuisine}</div>
      <div className={styles.meta}>
        <span className={styles.rating}>★ {restaurant.rating}</span>
        <span className={styles.dot}>·</span>
        <span className={styles.time}>{restaurant.time}</span>
      </div>
    </button>
  );
}
