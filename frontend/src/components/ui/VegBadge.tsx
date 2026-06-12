import styles from "./VegBadge.module.css";

export function VegBadge({ isVeg }: { isVeg: boolean }) {
  return (
    <span
      className={`${styles.badge} ${isVeg ? styles.veg : styles.nonveg}`}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className={styles.dot} />
    </span>
  );
}
