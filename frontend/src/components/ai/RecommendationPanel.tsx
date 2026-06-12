"use client";

import styles from "./RecommendationPanel.module.css";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { useStore } from "@/store/useStore";
import { useRecommendations } from "@/hooks/useData";
import { useDebounce } from "@/hooks/useDebounce";
import type { MenuItem } from "@/lib/api";

interface Props {
  restaurantId: string;
  menuItems: MenuItem[]; // full menu so we can add rec directly to cart
}

export function RecommendationPanel({ restaurantId, menuItems }: Props) {
  const { userId, cartItemIds, addToCart } = useStore();
  const liveCartIds = cartItemIds();

  // Debounce so we don't fire on every single + click
  const debouncedCartIds = useDebounce(liveCartIds, 800);

  const payload =
    debouncedCartIds.length > 0
      ? { cart_ids: debouncedCartIds, restaurant_id: restaurantId, user_id: userId }
      : null;

  const { data: recs, isFetching, isError } = useRecommendations(payload);

  // Filter out items already in cart
  const filtered = recs?.filter((r) => !liveCartIds.includes(r.item_id)) ?? [];

  const handleAddRec = (itemId: string) => {
    const item = menuItems.find((m) => m.id === itemId);
    if (item) addToCart(item);
  };

  return (
    <aside className={styles.panel} aria-label="AI Recommendations">
      <div className={styles.header}>
        <div className={styles.label}>
          <span className={styles.pulse} aria-hidden="true" />
          AI Picks
        </div>
        <div className={styles.context}>
          {isFetching
            ? "Analyzing…"
            : liveCartIds.length === 0
            ? "Add items to start"
            : filtered.length === 0
            ? "Cart looks complete"
            : `Based on ${liveCartIds.length} item${liveCartIds.length > 1 ? "s" : ""}`}
        </div>
      </div>

      <div className={styles.body}>
        {/* Empty — no cart items yet */}
        {liveCartIds.length === 0 && !isFetching && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">◈</span>
            <p>Add items to your cart and I'll suggest what pairs well.</p>
          </div>
        )}

        {/* Loading state */}
        {isFetching && <AILoadingState />}

        {/* Error */}
        {isError && !isFetching && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">⚠</span>
            <p>Couldn't load suggestions. Try adding more items.</p>
          </div>
        )}

        {/* Recommendations */}
        {!isFetching && !isError && filtered.length > 0 &&
          filtered.map((rec, i) => (
            <button
              key={rec.item_id}
              className={styles.recCard}
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => handleAddRec(rec.item_id)}
              aria-label={`Add ${rec.item_name} to cart — ${Math.round(rec.confidence * 100)}% match`}
            >
              <div className={styles.recTop}>
                <span className={styles.recName}>{rec.item_name}</span>
                <span className={styles.recPrice}>₹{rec.price}</span>
              </div>
              <ConfidenceBar value={rec.confidence} />
              {rec.reason && (
                <p className={styles.recReason}>{rec.reason}</p>
              )}
              <div className={styles.addHint} aria-hidden="true">+ Add</div>
            </button>
          ))}

        {/* Cart complete */}
        {!isFetching && !isError && liveCartIds.length > 0 && filtered.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">✓</span>
            <p>Looking good — your cart has everything that pairs well together.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function AILoadingState() {
  return (
    <div aria-label="Loading AI recommendations" aria-live="polite">
      {[1, 2].map((i) => (
        <div key={i} className={styles.loadingRow}>
          <div className={styles.loadingDots}>
            <span className={styles.dot} style={{ animationDelay: "0ms" }} />
            <span className={styles.dot} style={{ animationDelay: "160ms" }} />
            <span className={styles.dot} style={{ animationDelay: "320ms" }} />
          </div>
          <span className={styles.loadingText}>
            {i === 1 ? "Analyzing your cart…" : "Ranking pairings…"}
          </span>
        </div>
      ))}
    </div>
  );
}
