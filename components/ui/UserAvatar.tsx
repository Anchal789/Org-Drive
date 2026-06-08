import { TINTS } from "@/constants/common-constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatarProps } from "@/types/component-types";

export default function UserAvatar({
  initials,
  tone = "slate",
  size = "default",
  ring = false,
  className = "",
}: UserAvatarProps) {
  const t = TINTS[tone];

  return (
    <Avatar
      size={size}
      className={className}
      style={{
        boxShadow: ring
          ? `0 0 0 2px var(--background), 0 0 0 3px ${t.bd}`
          : undefined,
      }}
    >
      <AvatarFallback
        style={{
          background: t.bg,
          color: t.tx,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
