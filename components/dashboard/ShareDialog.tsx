import Btn from "@/components/ui/Btn";
import FileType from "@/components/ui/FileType";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/ui/UserAvatar";
import { iconsWithPaths } from "@/constants/common-constants";
import type { Tone } from "@/types/dashboard";
import styles from "@/styles/components/ShareDialog.module.scss";

type Person = {
  name: string;
  initials: string;
  tone: Tone;
  role: "Owner" | "Editor" | "Viewer";
  email: string;
  me?: boolean;
};

const PEOPLE: Person[] = [
  {
    name: "Marcus Kim",
    initials: "MK",
    tone: "violet",
    role: "Owner",
    email: "marcus.kim@zuru.com",
    me: true,
  },
  {
    name: "Alia Lopez",
    initials: "AL",
    tone: "blue",
    role: "Editor",
    email: "alia.lopez@zuru.com",
  },
  {
    name: "Ravi Shah",
    initials: "RS",
    tone: "green",
    role: "Viewer",
    email: "ravi.shah@zuru.com",
  },
];

export default function ShareDialog() {
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        {/* Header */}
        <div className={styles.header}>
          <FileType kind="pdf" />
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              Share &quot;Q3_Investor_Update.pdf&quot;
            </div>
            <div className={styles.headerSubtitle}>
              Stored in Engineering · 4.2 MB
            </div>
          </div>
          <button type="button" className={styles.closeButton}>
            <Icon d={iconsWithPaths.x} size={16} />
          </button>
        </div>

        {/* Add people input */}
        <div className={styles.invite}>
          <Icon
            d={iconsWithPaths.users}
            size={14}
            style={{ color: "var(--muted-foreground)" }}
          />
          <span className={styles.invitePlaceholder}>
            Add people, groups, or @telegram-handles
          </span>
          <Btn size="sm">Invite</Btn>
        </div>

        {/* People with access */}
        <div>
          <div className={styles.sectionLabel}>People with access</div>
          {PEOPLE.map((person) => (
            <div key={person.name} className={styles.personRow}>
              <UserAvatar
                initials={person.initials}
                tone={person.tone}
                size="default"
              />
              <div className={styles.personInfo}>
                <div className={styles.personName}>
                  {person.name}
                  {person.me && <span className={styles.youTag}>(you)</span>}
                </div>
                <div className={styles.personEmail}>{person.email}</div>
              </div>
              <div className={styles.roleSelector}>
                {person.role}
                <Icon d={iconsWithPaths.chevDown} size={11} />
              </div>
            </div>
          ))}
        </div>

        {/* General access */}
        <div className={styles.generalAccess}>
          <div className={styles.sectionLabel}>General access</div>
          <div className={styles.generalRow}>
            <div className={styles.generalIcon}>
              <Icon d={iconsWithPaths.users} size={16} />
            </div>
            <div className={styles.generalInfo}>
              <div className={styles.generalTitle}>
                Zuru Tech members
                <Icon
                  d={iconsWithPaths.chevDown}
                  size={12}
                  style={{ color: "var(--muted-foreground)" }}
                />
              </div>
              <div className={styles.generalSubtitle}>
                Anyone in the org can view via the link.
              </div>
            </div>
            <div className={styles.roleSelector}>
              Viewer
              <Icon d={iconsWithPaths.chevDown} size={11} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Btn variant="outline" size="sm" icon={iconsWithPaths.link}>
            Copy link
          </Btn>
          <div className={styles.footerSpacer} />
          <Btn variant="ghost" size="sm">
            Cancel
          </Btn>
          <Btn size="sm">Done</Btn>
        </div>
      </div>
    </div>
  );
}
