import styles from "./ConfidenceBar.module.css";

interface Props {
  value: number; // 0–1
}

export function ConfidenceBar({ value }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className={styles.wrap} aria-label={`${pct}% match confidence`}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <span className={styles.label}>{pct}%</span>
    </div>
  );
}
