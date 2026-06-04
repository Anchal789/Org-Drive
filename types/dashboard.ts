export type Tone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "teal"
  | "sky"
  | "pink"
  | "slate";

export type FileKind =
  | "pdf"
  | "doc"
  | "xls"
  | "img"
  | "ppt"
  | "txt"
  | "csv"
  | "md";

export type FileStatus = "indexed" | "processing" | "failed" | "queued";

export type UploadState = "queued" | "uploading" | "indexing" | "done";

export type Owner = [initials: string, tone: Tone];

export type DriveFile = {
  id: number;
  name: string;
  kind: FileKind;
  size: string;
  mod: string;
  owner: Owner;
  status: FileStatus;
  starred?: boolean;
};

export type DriveFolder = {
  name: string;
  count: number;
  owner: Owner;
  tone: Tone;
};

export type UploadItem = {
  name: string;
  size: string;
  pct: number;
  state: UploadState;
};

export type BtnVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type BtnSize = "sm" | "md" | "lg" | "icon";

export type AvatarSize = number;
