import { redirect } from 'next/navigation';
import TrashPage from '@/components/trash-module/TrashPage';
import { getSessionUser } from '@/lib/session';
import { trashedItemsRepository } from '@/repositories/trashed-items.repository';
import type { TrashInterface } from '@/types/trash';

const Trash = async () => {
  const user = await getSessionUser();
  if (!user?.userId) redirect('/login');
  const trashedItems = (await trashedItemsRepository.getTrashedItems(
    Number(user.userId),
  )) as Array<TrashInterface>;

  return <TrashPage trashedItems={trashedItems} />;
};

export default Trash;
