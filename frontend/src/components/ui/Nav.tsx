"use client";

import styles from "./Nav.module.css";
import { useStore } from "@/store/useStore";

const USERS = [
  { id: "U0001", label: "U0001 — Premium" },
  { id: "U0002", label: "U0002 — Premium" },
  { id: "U0003", label: "U0003 — Mid" },
  { id: "U0004", label: "U0004 — Budget" },
];

export function Nav() {
  const { userId, setUserId } = useStore();

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoDot} />
        Nibble
      </div>

      <div className={styles.right}>
        <select
          className={styles.userSelect}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          aria-label="Switch user profile"
        >
          {USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.label}
            </option>
          ))}
        </select>
        <div className={styles.avatar} aria-label="User avatar">
          {userId.slice(0, 2)}
        </div>
      </div>
    </nav>
  );
}
