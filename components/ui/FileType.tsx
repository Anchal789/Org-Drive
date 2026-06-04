import Badge from "./Badge";
import type { FileKind, Tone } from "@/types/dashboard";

const FILE_TYPE_MAP: Record<FileKind, { tone: Tone; label: string }> = {
  pdf: { tone: "red", label: "PDF" },
  doc: { tone: "blue", label: "DOC" },
  xls: { tone: "green", label: "XLS" },
  img: { tone: "violet", label: "IMG" },
  ppt: { tone: "amber", label: "PPT" },
  txt: { tone: "slate", label: "TXT" },
  csv: { tone: "teal", label: "CSV" },
  md: { tone: "sky", label: "MD" },
};

export default function FileType({ kind }: { kind: FileKind }) {
  const c = FILE_TYPE_MAP[kind] ?? FILE_TYPE_MAP.pdf;
  return <Badge tone={c.tone}>{c.label}</Badge>;
}
