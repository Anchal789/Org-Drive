"use client";

import { useState } from "react";
import styles from "@/styles/components/DriveDropOverlay.module.scss";
import Dropzone from "../ui/dropzone";
import { Upload } from "lucide-react";

export default function DriveDropOverlay() {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      className={`${styles.overlay} ${isDragging ? styles.overlayActive : ""}`}
    >
      <div className={styles.inner}>
        <Dropzone onDraggingAction={setIsDragging} />
        <div className={styles.iconBox}>
          <Upload size={28} />
        </div>
        <div className={styles.title}>Drop to upload</div>
        <div className={styles.subtitle}>
          3 files · ~14 MB · into Engineering
        </div>
      </div>
    </div>
  );
}
