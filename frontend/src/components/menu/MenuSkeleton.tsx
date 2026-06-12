import styles from "./MenuSkeleton.module.css";

export function MenuSkeleton() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      {[1, 2, 3].map((section) => (
        <div key={section} className={styles.section}>
          <div className={`skeleton ${styles.sectionTitle}`} />
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className={styles.row}>
              <div className={styles.rowLeft}>
                <div className={`skeleton ${styles.badge}`} />
                <div>
                  <div className={`skeleton ${styles.name}`} />
                  <div className={`skeleton ${styles.cat}`} />
                </div>
              </div>
              <div className={styles.rowRight}>
                <div className={`skeleton ${styles.price}`} />
                <div className={`skeleton ${styles.btn}`} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
