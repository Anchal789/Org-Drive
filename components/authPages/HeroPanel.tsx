import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { iconsWithPaths, TG_BLUE } from "@/constants/common-constants";

export default function HeroPanel() {
  return (
    <div
      style={{
        flex: 1,
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background: `linear-gradient(to bottom right, ${TG_BLUE}1A, ${TG_BLUE}0D)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--foreground)",
            color: "var(--background)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          OD
        </div>

        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          Org Drive
        </span>
      </div>

      <div
        style={{
          maxWidth: 380,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Badge
          style={{
            marginBottom: 14,
            background: "#fff",
            boxShadow: "var(--shadow-sm)",
            border: `1px solid ${TG_BLUE}33`,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: TG_BLUE,
              display: "inline-block",
            }}
          />
          <span
            style={{
              color: "#004260",
            }}
          >
            Powered by Telegram
          </span>
        </Badge>

        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 14,
            color: "var(--foreground)",
          }}
        >
          Your team's files,
          <br />
          on infinite storage.
        </h1>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--muted-foreground)",
            margin: 0,
          }}
        >
          A Drive-style workspace backed by your own Telegram channel. No seats,
          no per-GB fees. Optional AI when you want it.
        </p>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            "Unlimited file storage via your channel",
            "Folder organization & quick share links",
            "Optional AI chat & semantic search",
          ].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--foreground)",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: TG_BLUE,
                }}
              >
                <Icon
                  d={iconsWithPaths.check}
                  size={11}
                  stroke={2.5}
                  className="text-white"
                />
              </span>

              {t}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--muted-foreground)",
          position: "relative",
          zIndex: 10,
        }}
      >
        © Org Drive 2026 ·{" "}
        <span
          style={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Privacy
        </span>{" "}
        ·{" "}
        <span
          style={{
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Terms
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          right: -80,
          top: 64,
          width: 280,
          height: 280,
          borderRadius: "50%",
          pointerEvents: "none",
          border: `1px solid ${TG_BLUE}22`,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -40,
          top: 128,
          width: 160,
          height: 160,
          borderRadius: "50%",
          pointerEvents: "none",
          border: `1px solid ${TG_BLUE}33`,
        }}
      />
    </div>
  );
}
