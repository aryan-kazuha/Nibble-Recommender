"use client";

import { useRef, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { Nav } from "@/components/ui/Nav";
import { MenuSection } from "@/components/menu/MenuSection";
import { MenuSkeleton } from "@/components/menu/MenuSkeleton";
import { RecommendationPanel } from "@/components/ai/RecommendationPanel";
import { CartPanel } from "@/components/cart/CartPanel";
import { useMenu } from "@/hooks/useData";
import { useStore } from "@/store/useStore";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { activeRestaurant } = useStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const { data: menu, isLoading, isError } = useMenu(id);

  // Group items by category, preserving order
  const categories = menu
    ? [...new Set(menu.map((i) => i.category))]
    : [];

  const grouped = categories.reduce<Record<string, typeof menu>>((acc, cat) => {
    acc[cat] = menu!.filter((i) => i.category === cat);
    return acc;
  }, {});

  const scrollToCategory = useCallback(
    (cat: string) => {
      setActiveCategory(cat);
      const el = document.getElementById(`section-${cat}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  // Track active category on scroll
  const handleScroll = useCallback(() => {
    if (!categories.length) return;
    for (const cat of [...categories].reverse()) {
      const el = document.getElementById(`section-${cat}`);
      if (el && el.getBoundingClientRect().top <= 130) {
        setActiveCategory(cat);
        return;
      }
    }
    setActiveCategory(categories[0] ?? null);
  }, [categories]);

  const displayName = activeRestaurant?.name ?? `Restaurant ${id}`;
  const displayRating = activeRestaurant?.rating ?? "—";
  const displayTime = activeRestaurant?.time ?? "30–45 min";
  const displayCuisine = activeRestaurant?.cuisine ?? "";

  return (
    <>
      <Nav />
      <div className={styles.layout}>
        {/* ── MAIN CONTENT ── */}
        <main
          className={styles.main}
          ref={mainRef}
          onScroll={handleScroll}
        >
          {/* Sticky restaurant header + category tabs */}
          <div className={styles.stickyHeader}>
            <div className={styles.restHeader}>
              <button
                className={styles.backBtn}
                onClick={() => router.push("/")}
                aria-label="Back to restaurants"
              >
                ← Back
              </button>
              <div>
                <h1 className={styles.restName}>{displayName}</h1>
                <div className={styles.restMeta}>
                  <span>⭐ {displayRating}</span>
                  <span className={styles.metaSep}>·</span>
                  <span>{displayTime}</span>
                  {displayCuisine && (
                    <>
                      <span className={styles.metaSep}>·</span>
                      <span className={styles.restCuisine}>{displayCuisine}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Category tabs */}
            {!isLoading && categories.length > 0 && (
              <nav
                className={styles.catTabs}
                aria-label="Menu categories"
                role="tablist"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.catTab} ${
                      activeCategory === cat ||
                      (!activeCategory && cat === categories[0])
                        ? styles.catTabActive
                        : ""
                    }`}
                    onClick={() => scrollToCategory(cat)}
                    role="tab"
                    aria-selected={activeCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            )}
          </div>

          {/* Menu content */}
          <div className={styles.menuContent}>
            {isLoading && <MenuSkeleton />}

            {isError && (
              <div className={styles.error}>
                <p>Couldn't load menu.</p>
                <code>GET /api/menu/{id}</code>
              </div>
            )}

            {!isLoading &&
              !isError &&
              categories.map((cat) => (
                <MenuSection
                  key={cat}
                  category={cat}
                  items={grouped[cat] ?? []}
                />
              ))}
          </div>
        </main>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar} aria-label="Order sidebar">
          <RecommendationPanel
            restaurantId={id}
            menuItems={menu ?? []}
          />
          <CartPanel />
        </aside>
      </div>
    </>
  );
}
