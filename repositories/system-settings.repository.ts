import { db } from '@/db';
import { systemSettingsTable } from '@/db/schema';

export const systemSettingsRepository = {
  async getBotSessionString() {
    const [settings] = await db.select().from(systemSettingsTable).limit(1);
    return settings?.botSessionString || null;
  },
};
