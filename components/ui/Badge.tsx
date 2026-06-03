export default function Badge({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem", // gap-1
        padding: "0.125rem 0.5rem", // py-0.5 px-2
        borderRadius: "0.375rem", // rounded-md
        fontSize: "11px",
        fontWeight: 500,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
