"use client";

import { useDragDropStore } from "@/store/store";
import styles from "./DashGrid.module.scss";

export default function DashGridWrapper({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay: React.ReactNode;
}) {
  const { isDragging, setIsDragging } = useDragDropStore();

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      className={styles.wrapper}
    >
      {isDragging ? overlay : children}
    </div>
  );
}
