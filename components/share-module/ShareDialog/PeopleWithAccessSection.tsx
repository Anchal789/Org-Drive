import UserAccessRow from "./UserAccessRow";
import styles from "./ShareDialog.module.scss";
import type { ShareWithMePerson } from "@/types/share-with-me";

type PeopleWithAccessSectionProps = {
  users: ShareWithMePerson[];
  currentUserId: number;
  isMultiShare: boolean;
  onPermissionChange: (
    index: number,
    permission: ShareWithMePerson["permission"],
  ) => void;
};

export default function PeopleWithAccessSection({
  users,
  currentUserId,
  isMultiShare,
  onPermissionChange,
}: PeopleWithAccessSectionProps) {
  if (users.length === 0) return null;

  return (
    <div>
      <div className={styles.sectionLabel}>People with access</div>
      <div className={styles.personsWithAccess}>
        {users.map((person, index) => (
          <UserAccessRow
            key={`access-${person.id}`}
            user={person}
            permission={person.permission}
            isOwner={person.permission?.toLowerCase() === "owner"}
            isCurrentUser={person.id === currentUserId}
            disabled={person.id === currentUserId}
            // Block transferring ownership when doing bulk multi-file changes
            hideOwnerOption={isMultiShare}
            onPermissionChange={(val) => onPermissionChange(index, val)}
            showSeparator={index < users.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
