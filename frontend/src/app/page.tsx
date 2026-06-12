"use client";

import { useState, useMemo } from "react";
import styles from "./page.module.css";
import { Nav } from "@/components/ui/Nav";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { RestaurantSkeleton } from "@/components/restaurant/RestaurantSkeleton";
import { useRestaurants } from "@/hooks/useData";

const FILTERS = [
  "All",
  "South Indian",
  "Biryani",
  "Pizza",
  "Burgers",
  "Chinese",
  "Continental",
  "Desserts",
  "Vegetarian",
];

export default function DiscoveryPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { data: restaurants, isLoading, isError } = useRestaurants();

  const filtered = useMemo(() => {
    if (!restaurants) return [];
    return restaurants.filter((r) => {
      const matchesFilter =
        activeFilter === "All" ||
        r.cuisine.toLowerCase().includes(activeFilter.toLowerCase());
      const matchesSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [restaurants, activeFilter, search]);

  return (
    <>
      <Nav />
      <main className={styles.main}>
        {/* Hero */}
        <header className={styles.hero}>
          <p className={styles.eyebrow}>AI-powered ordering</p>
          <h1 className={styles.title}>
            What are you<br />craving today?
          </h1>
          <p className={styles.subtitle}>
            Personalized picks. Intelligent recommendations. Every order.
          </p>

          {/* Search */}
          <label className={styles.searchWrap} htmlFor="search">
            <span className={styles.searchIcon} aria-hidden="true">⌕</span>
            <input
              id="search"
              className={styles.searchInput}
              type="search"
              placeholder="Search restaurants or cuisines…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </label>
        </header>

        {/* Filters */}
        <div
          className={styles.filterStrip}
          role="group"
          aria-label="Filter restaurants"
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.pill} ${activeFilter === f ? styles.pillActive : ""}`}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Count */}
        {!isLoading && !isError && (
          <p className={styles.countLabel}>
            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} near you
          </p>
        )}

        {/* Grid */}
        <div className={styles.grid} aria-live="polite" aria-busy={isLoading}>
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <RestaurantSkeleton key={i} />
            ))}

          {isError && (
            <div className={styles.error}>
              <p>Couldn't load restaurants. Is the backend running?</p>
              <code>GET /api/restaurants</code>
            </div>
          )}

          {!isLoading &&
            !isError &&
            filtered.map((r, i) => (
              <div
                key={r.id}
                style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
              >
                <RestaurantCard restaurant={r} />
              </div>
            ))}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className={styles.noResults}>
              <span>No restaurants match "{search || activeFilter}"</span>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
