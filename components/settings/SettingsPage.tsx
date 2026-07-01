import { RefreshCw, Send, Settings, SquarePen, Trash2 } from "lucide-react";
import styles from "./Settings.module.scss";
import LayoutSettings from "./LayoutSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import Badge from "../ui/badge";

const SettingsPage = async () => {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.headings}>
          <div className={styles.iconBox}>
            <Settings size={20} />
          </div>
          <div>
            <div className={styles.title}>
              <span>Settings</span>
            </div>
            <div className={styles.subHeading}>
              Workspace, Telegram connection, and AI preferences.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.pageContent}>
        <div className={styles.content}>
          <div className={styles.contentSection}>
            <div className={styles.contentTitle}>General</div>
            <div className={styles.contentRowContainer}>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Organization name</h3>
                  <p className={styles.contentRowDescription}>
                    Shown across the workspace and on share links.
                  </p>
                </div>
                <Badge
                  outline
                  customTone={{
                    color: "var(--foreground)",
                    border: "var(--border)",
                  }}
                  className={styles.organizationNameEditable}
                >
                  Zuru Tech
                  <SquarePen size={12} color="var(--muted-foreground)" />
                </Badge>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Default View</h3>
                  <p className={styles.contentRowDescription}>
                    How My drive opens for you.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <LayoutSettings />
                </div>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Language</h3>
                  <p className={styles.contentRowDescription}>
                    Interface language.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue
                        placeholder="English (US)"
                        defaultValue="en"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentSection}>
            <div className={styles.contentTitle}>Telegram Connection</div>
            <div className={styles.contentRowContainer}>
              <div
                className={`${styles.contentRow} ${styles.telegramConnectionRow}`}
              >
                <div className={styles.tgCircle}>
                  <Send size={17} />
                </div>
                <div className={styles.contentRowLabel}>
                  <h3
                    className={`${styles.contentRowTitle} ${styles.tgUsername}`}
                  >
                    @zurutech_drive · node-eu-1
                  </h3>
                  <p className={styles.contentRowDescription}>
                    Connected · 128 GB streamed · last sync 14s ago
                  </p>
                </div>
                <div className={styles.connectionStatus}>
                  <div className={styles.dot}></div> Healthy
                </div>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Backup channel</h3>
                  <p className={styles.contentRowDescription}>
                    Mirror every upload to a second channel for redundancy.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <Switch defaultChecked={true} />
                </div>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Reconnect bot</h3>
                  <p className={styles.contentRowDescription}>
                    Re-authrize the Org Drive bot if uploads for redundancy.
                  </p>
                </div>
                <Badge
                  outline
                  customTone={{
                    color: "var(--foreground)",
                    border: "var(--border)",
                  }}
                  className={styles.organizationNameEditable}
                >
                  <RefreshCw size={14} /> Reconnect
                </Badge>
              </div>
            </div>
          </div>
          <div className={styles.contentSection}>
            <div className={styles.contentTitle}>AI features (optional)</div>
            <div className={styles.contentRowContainer}>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>AI chat</h3>
                  <p className={styles.contentRowDescription}>
                    Let members ask questions across indexed files.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <Switch defaultChecked={true} />
                </div>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Semantic search</h3>
                  <p className={styles.contentRowDescription}>
                    Build embeddings so search understands meaning, not just
                    keywords.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <Switch defaultChecked={true} />
                </div>
              </div>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>
                    Auto-index new uploads
                  </h3>
                  <p className={styles.contentRowDescription}>
                    Process files for AI as soon as they finish uploading.
                  </p>
                </div>
                <div className={styles.contentRowAction}>
                  <Switch defaultChecked={false} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentSection}>
            <div className={styles.contentTitle}>Danger zone</div>
            <div className={styles.contentRowContainer}>
              <div className={styles.contentRow}>
                <div className={styles.contentRowLabel}>
                  <h3 className={styles.contentRowTitle}>Delete workspace</h3>
                  <p className={styles.contentRowDescription}>
                    Removes Org Drive metadata. Your Telegram channel and its
                    files are left untouched.
                  </p>
                </div>
                <Badge
                  outline
                  customTone={{
                    color: "var(--destructive)",
                    border:
                      "color-mix(in oklch, var(--destructive) 40%, var(--border))",
                  }}
                  className={styles.organizationNameEditable}
                >
                  <Trash2 size={14} /> Delete
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
