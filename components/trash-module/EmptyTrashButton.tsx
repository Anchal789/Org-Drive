"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import Icon from "../ui/icon";
import { iconsWithPaths } from "@/constants/common-constants";
import AlertModal from "../ui/alert-modal";
import { useRouter } from "next/navigation";
import { emptyTrash } from "@/services/trash-service";

export default function EmptyTrashButton({
  isDisabled,
}: {
  isDisabled: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEmptyTrash = async () => {
    setIsDeleting(true);
    const response = await emptyTrash();
    if (response?.success) {
      setIsDeleting(false);
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <AlertModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Empty Trash?"
        description="Are you absolutely sure? All files and folders in the trash will be permanently deleted from Telegram. This action cannot be undone."
        confirmText={isDeleting ? "Emptying..." : "Delete Permanently"}
        confirmVariant="destructive"
        cancelText="Cancel"
        onConfirm={handleEmptyTrash}
      />

      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={isDisabled || isDeleting}
      >
        <Icon d={iconsWithPaths.trash} size={14} />
        {isDeleting ? "Emptying..." : "Empty trash"}
      </Button>
    </>
  );
}
