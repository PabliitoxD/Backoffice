"use client";

import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import styles from "./DashboardFilter.module.css";

interface Props {
  onFilterChange: (startDate: Date, endDate: Date) => void;
}

export default function DashboardFilter({ onFilterChange }: Props) {
  const [filterType, setFilterType] = useState<"today" | "week" | "month" | "manual">("today");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  useEffect(() => {
    let start: Date;
    let end: Date = endOfDay(new Date());

    if (filterType === "today") {
      start = startOfDay(new Date());
      onFilterChange(start, end);
    } else if (filterType === "week") {
      start = startOfWeek(new Date(), { weekStartsOn: 1 });
      onFilterChange(start, end);
    } else if (filterType === "month") {
      start = startOfMonth(new Date());
      onFilterChange(start, end);
    }
  }, [filterType, onFilterChange]);

  const handleManualSubmit = () => {
    if (customRange.start && customRange.end) {
      onFilterChange(startOfDay(new Date(customRange.start)), endOfDay(new Date(customRange.end)));
    }
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.btnGroup}>
        <button className={filterType === "today" ? styles.active : ""} onClick={() => setFilterType("today")}>Hoje</button>
        <button className={filterType === "week" ? styles.active : ""} onClick={() => setFilterType("week")}>Semana</button>
        <button className={filterType === "month" ? styles.active : ""} onClick={() => setFilterType("month")}>Mês</button>
        <button className={filterType === "manual" ? styles.active : ""} onClick={() => setFilterType("manual")}>Manual</button>
      </div>

      {filterType === "manual" && (
        <div className={styles.manualInputs}>
          <input type="date" className={styles.dateInput} value={customRange.start} onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })} />
          <span className={styles.separator}>até</span>
          <input type="date" className={styles.dateInput} value={customRange.end} onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })} />
          <button className={styles.btnSearch} onClick={handleManualSubmit}>Aplicar</button>
        </div>
      )}
    </div>
  );
}
