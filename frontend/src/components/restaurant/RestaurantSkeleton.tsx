import styles from "./RestaurantSkeleton.module.css";

export function RestaurantSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`skeleton ${styles.avatar}`} />
      <div className={`skeleton ${styles.nameLine}`} />
      <div className={`skeleton ${styles.cuisineLine}`} />
      <div className={styles.metaRow}>
        <div className={`skeleton ${styles.metaBit}`} />
        <div className={`skeleton ${styles.metaBit2}`} />
      </div>
    </div>
  );
}
