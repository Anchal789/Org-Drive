export type Tone =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "violet"
  | "teal"
  | "sky"
  | "pink"
  | "slate"
  | "indigo"
  | "purple"
  | "orange"
  | "gray"
  | "rose"
  | "violet"
  | "yellow"
  | "cyan";

export type FileKind =
  | "pdf"
  | "doc"
  | "docx"
  | "xls"
  | "xlsx"
  | "csv"
  | "tsv"
  | "ppt"
  | "txt"
  | "rtf"
  | "md"
  | "json"
  | "xml"
  | "yaml"
  | "sql"
  | "php"
  | "bat"
  | "zip"
  | "rar"
  | "7z"
  | "gzip"
  | "bzip2"
  | "tar"
  | "exe"
  | "iso"
  | "png"
  | "jpg"
  | "webp"
  | "svg"
  | "bmp"
  | "mp4"
  | "webm"
  | "mp3"
  | "img"
  | "unknown"
  | "jpeg"
  | "gif"
  | "heic"
  | "avif"
  | "mov"
  | "avi"
  | "mkv"
  | "wav"
  | "aac"
  | "flac"
  | "ogg"
  | "js"
  | "ts"
  | "tsx"
  | "jsx"
  | "css"
  | "scss"
  | "html"
  | "py"
  | "java"
  | "c"
  | "cpp"
  | "cs"
  | "go"
  | "rs"
  | "sh"
  | "apk"
  | "odt"
  | "ods"
  | "odp";

export type FileStatus = "indexed" | "processing" | "failed" | "queued";

export type UploadState =
  | "queued"
  | "uploading"
  | "indexing"
  | "done"
  | "error"
  | "aborted";

export type Owner = [initials: string, tone: Tone];

export type DriveFile = {
  id: number;
  name: string;
  kind: FileKind;
  size: string;
  mod: string;
  owner: Owner;
  status: FileStatus;
  bookmark?: boolean;
};

export type DriveFolder = {
  name: string;
  count: number;
  owner: Owner;
  tone: Tone;
};

export interface UploadItem {
  id: string;
  name: string;
  size: string;
  state: UploadState;
  pct: number;
  eta?: number;
  folderName?: string;
  rawSize?: number;
  isFolderGroup?: false;
}

export interface FolderGroupItem {
  id: string;
  name: string;
  isFolderGroup: true;
  originalFiles: UploadItem[];
  size: string;
  state: UploadState;
  pct: number;
  eta?: number;
}

export type BtnVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type BtnSize = "sm" | "md" | "lg" | "icon";

export type AvatarSize = number;

export type DisplayItem = UploadItem | FolderGroupItem;
