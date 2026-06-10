"use client";

import DashGrid from "@/components/dashboard/DashGrid";
import { useDragDropStore } from "@/store/store";
import { useRef } from "react";

export default function DashGridWrapper() {
  const { isDragging, setIsDragging } = useDragDropStore();

  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();

    dragCounter.current++;

    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();

    dragCounter.current--;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    dragCounter.current = 0;
    setIsDragging(false);
  };
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DashGrid showDropOverlay={isDragging} />
    </div>
  );
}
