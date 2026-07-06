import UserAccessRow from "./UserAccessRow";
import styles from "./ShareDialog.module.scss";
import type { InviteUser } from "@/types/share";

type InvitePeopleSectionProps = {
  users: InviteUser[];
  onPermissionChange: (
    index: number,
    permission: InviteUser["permission"],
  ) => void;
};

export default function InvitePeopleSection({
  users,
  onPermissionChange,
}: InvitePeopleSectionProps) {
  if (users.length === 0) return null;

  return (
    <div>
      <div className={styles.sectionLabel}>Invite people</div>
      <div className={styles.personsWithAccess}>
        {users.map((person, index) => (
          <UserAccessRow
            key={`invite-${person.id}`}
            user={person}
            permission={person.permission}
            hideOwnerOption
            onPermissionChange={(val) => onPermissionChange(index, val)}
            showSeparator={index < users.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
