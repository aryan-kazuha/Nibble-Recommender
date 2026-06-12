"use client";

import styles from "./CartPanel.module.css";
import { useStore } from "@/store/useStore";

export function CartPanel() {
  const {
    cart,
    cartCount,
    cartSubtotal,
    removeFromCart,
    addToCart,
    clearCart,
    activeRestaurant,
  } = useStore();

  const count = cartCount();
  const subtotal = cartSubtotal();
  const delivery = count > 0 ? 30 : 0;
  const total = subtotal + delivery;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>
          Cart
          {count > 0 && (
            <span className={styles.badge} aria-label={`${count} items`}>
              {count}
            </span>
          )}
        </div>
        {count > 0 && (
          <button className={styles.clearBtn} onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      {count === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">◻</span>
          <p>Your cart is empty.<br />Add something delicious.</p>
        </div>
      ) : (
        <>
          <div
            className={styles.itemsList}
            role="list"
            aria-label="Cart items"
          >
            {cart.map((item) => (
              <div key={item.id} className={styles.itemRow} role="listitem">
                <div className={styles.itemName}>
                  {item.name}
                  {item.qty > 1 && (
                    <span className={styles.qty}> ×{item.qty}</span>
                  )}
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemPrice}>
                    ₹{item.price * item.qty}
                  </span>
                  <div className={styles.microQty}>
                    <button
                      className={styles.microBtn}
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove one ${item.name}`}
                    >
                      −
                    </button>
                    <span className={styles.microNum}>{item.qty}</span>
                    <button
                      className={styles.microBtn}
                      onClick={() => addToCart(item)}
                      aria-label={`Add one more ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Delivery</span>
              <span>₹{delivery}</span>
            </div>
            <div className={styles.totalMain}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button
              className={styles.checkoutBtn}
              aria-label="Proceed to checkout"
            >
              Place order →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
