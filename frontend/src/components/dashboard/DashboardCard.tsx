"use client";

import styles from "./DashboardCard.module.css";

export interface ListItem {
  id: string;
  label: string;
  subLabel?: string;
  value: string;
}

interface Props {
  title: string;
  value: string;
  delta?: number;
  listTitle?: string;
  items?: ListItem[];
}

export default function DashboardCard({ title, value, delta, listTitle, items }: Props) {
  const isPositive = delta ? delta >= 0 : true;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {delta !== undefined && (
          <span className={`${styles.delta} ${isPositive ? styles.up : styles.down}`}>
            {isPositive ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className={styles.mainValue}>{value}</div>

      {items && (
        <div className={styles.listSection}>
          {listTitle && <h4 className={styles.listTitle}>{listTitle}</h4>}
          <ul className={styles.list}>
            {items.length > 0 ? (
              items.map((item) => (
                <li key={item.id} className={styles.listItem}>
                  <div className={styles.itemLabels}>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.subLabel && <span className={styles.itemSubLabel}>{item.subLabel}</span>}
                  </div>
                  <span className={styles.itemValue}>{item.value}</span>
                </li>
              ))
            ) : (
              <li className={styles.emptyItem}>Nenhum registro no período</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
