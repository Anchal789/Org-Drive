"use client";

import { Input } from "./input";
import styles from "./Component.module.scss";
import { useDragDropStore, useUploadStore } from "@/store/store";

const Dropzone = ({
  onDragging,
}: {
  onDragging?: (dragging: boolean) => void;
}) => {
  const { setIsDragging } = useDragDropStore();
  const startUploads = useUploadStore((state) => state.startUploads);

  const handleDrag = (value: boolean) => {
    setIsDragging(value);
    onDragging?.(value);
  };

  return (
    <Input
      type="file"
      multiple
      className={styles.overlayInput}
      onChange={(e) => {
        if (e.target.files && e.target.files.length > 0) {
          startUploads(Array.from(e.target.files));
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        handleDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        handleDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        handleDrag(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          startUploads(Array.from(e.dataTransfer.files));
        }
      }}
    />
  );
};

export default Dropzone;

// "use client";

// import { Input } from "./input";
// import styles from "./Component.module.scss";
// import { useDragDropStore, useUploadStore } from "@/store/store";
// import { toast } from "sonner"; // Assuming you are using sonner for toasts based on previous code

// const Dropzone = ({
//   onDragging,
// }: {
//   onDragging?: (dragging: boolean) => void;
// }) => {
//   const { setIsDragging } = useDragDropStore();
//   const startUploads = useUploadStore((state) => state.startUploads);

//   const handleDrag = (value: boolean) => {
//     setIsDragging(value);
//     onDragging?.(value);
//   };

//   const processAndValidateFiles = (files: File[]) => {
//     // 1. Check for nested folders
//     const hasNestedFolders = files.some((file) => {
//       if (file.webkitRelativePath) {
//         // Count how many slashes are in the path
//         const slashCount = (file.webkitRelativePath.match(/\//g) || []).length;

//         // If there is more than 1 slash, it means there is a sub-folder
//         return slashCount > 1;
//       }
//       return false;
//     });

//     if (hasNestedFolders) {
//       toast.error("Nested folders are not allowed. Please upload a single-level folder.");
//       return; // Instantly abort the upload process
//     }

//     // 2. Optional: If you want to prevent EMPTY folders from crashing things
//     if (files.length === 0) {
//       toast.error("This folder is empty.");
//       return;
//     }

//     // 3. If validation passes, send them to the Zustand queue
//     startUploads(files);
//   };

//   return (
//     <Input
//       type="file"
//       multiple
//       // Note: If you want users to be able to CLICK to select a folder instead of just drag-and-drop,
//       // you need to add the webkitdirectory attribute. Otherwise, leave it as is for just files/drag-and-drop.
//       // @ts-expect-error - React types don't officially support webkitdirectory yet, but browsers do
//       webkitdirectory="true"
//       className={styles.overlayInput}
//       onChange={(e) => {
//         if (e.target.files && e.target.files.length > 0) {
//           processAndValidateFiles(Array.from(e.target.files));
//         }
//       }}
//       onDragOver={(e) => {
//         e.preventDefault();
//         handleDrag(true);
//       }}
//       onDragLeave={(e) => {
//         e.preventDefault();
//         handleDrag(false);
//       }}
//       onDrop={(e) => {
//         e.preventDefault();
//         handleDrag(false);

//         if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//           processAndValidateFiles(Array.from(e.dataTransfer.files));
//         }
//       }}
//     />
//   );
// };

// export default Dropzone;
