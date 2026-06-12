import DashFolder from "@/components/dashboard/DashFolder";
import { decrypt } from "@/lib/utils";
import { FunctionComponent } from "react";

export default async function FolderPage({
  params,
}: {
  params: { folderId: string };
}) {
  const { folderId } = await params;

  console.log(decrypt(folderId));
  return <DashFolder />;
}
