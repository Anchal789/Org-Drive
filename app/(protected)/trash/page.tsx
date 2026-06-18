import TrashPage from "@/components/trash-module/TrashPage";
import { getSessionUser } from "@/lib/session";
import { trashedItemsRepository } from "@/repositories/trashed-items.repository";
import { TrashInterface } from "@/types/trash";

const Trash = async () => {
  const user = await getSessionUser();
  const trashedItems = (await trashedItemsRepository.getTrashedItems(
    Number(user?.userId),
  )) as Array<TrashInterface>;

  return <TrashPage trashedItems={trashedItems} />;
};

export default Trash;
