"use client";

import { Input } from "./input";
import styles from "./Component.module.scss";
import { postData } from "@/lib/api-fn";
import { useDragDropStore } from "@/store/store";
import { toast } from "sonner";
import { UploadFilesResponse } from "@/types/files";

const Dropzone = ({
  onDragging,
}: {
  onDragging?: (dragging: boolean) => void;
}) => {
  const { setIsDragging } = useDragDropStore();
  const handleDrag = (value: boolean) => {
    onDragging?.(value);
  };

  const handleFile = async (files: FileList | null) => {
    if (!files) return;

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append(`file`, file);
    });

    const response = await postData<Array<UploadFilesResponse>>({
      url: "/api/upload-files",
      payload: formData,
    });

    const data = response?.data;
    if (response.success) {
      toast.success(`${data?.length} files uploaded successfully`);
    }
  };

  return (
    <Input
      type="file"
      multiple
      className={styles.overlayInput}
      onChange={(e) => {
        const files = e.target.files;
        handleFile(files);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
        handleDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleDrag(false);
        const files = e.dataTransfer.files;
        handleFile(files);
      }}
    />
  );
};

export default Dropzone;
