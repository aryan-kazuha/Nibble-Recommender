"use client";

import styles from "./MenuItem.module.css";
import { VegBadge } from "@/components/ui/VegBadge";
import { useStore } from "@/store/useStore";
import type { MenuItem as MenuItemType } from "@/lib/api";

export function MenuItem({ item }: { item: MenuItemType }) {
  const { addToCart, removeFromCart, getItemQty } = useStore();
  const qty = getItemQty(item.id);

  return (
    <div className={styles.row}>
      <div className={styles.left}>
        <div className={styles.badgeWrap}>
          <VegBadge isVeg={item.isVeg} />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.category}>{item.category}</div>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.price}>₹{item.price}</span>

        {qty === 0 ? (
          <button
            className={styles.addBtn}
            onClick={() => addToCart(item)}
            aria-label={`Add ${item.name} to cart`}
          >
            +
          </button>
        ) : (
          <div className={styles.qtyCtrl} role="group" aria-label={`${item.name} quantity`}>
            <button
              className={styles.qtyBtn}
              onClick={() => removeFromCart(item.id)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className={styles.qtyNum}>{qty}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => addToCart(item)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
