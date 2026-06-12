import styles from "./MenuSection.module.css";
import { MenuItem } from "./MenuItem";
import type { MenuItem as MenuItemType } from "@/lib/api";

interface Props {
  category: string;
  items: MenuItemType[];
}

export function MenuSection({ category, items }: Props) {
  return (
    <section
      id={`section-${category}`}
      className={styles.section}
      aria-labelledby={`cat-${category}`}
    >
      <h2 id={`cat-${category}`} className={styles.title}>
        {category}
        <span className={styles.count}>{items.length}</span>
      </h2>
      <div role="list">
        {items.map((item) => (
          <div key={item.id} role="listitem">
            <MenuItem item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
