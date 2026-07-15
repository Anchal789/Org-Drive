import ShareWithMePage from '@/components/share-module/ShareWithMePage';
import { getSessionUser } from '@/lib/session';
import { sharedWithMeRepository } from '@/repositories/shared-with-me.repository';
import type { SharedWithMeItemsType } from '@/types/share-with-me';

const ShareWithMe = async () => {
  const user = await getSessionUser();
  const userId = Number(user?.userId);
  const sharedItems = (await sharedWithMeRepository.getSharedWithMeFiles(
    userId,
  )) as Array<SharedWithMeItemsType>;

  return <ShareWithMePage sharedItems={sharedItems} />;
};

export default ShareWithMe;
