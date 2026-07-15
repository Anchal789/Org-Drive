import { relations } from 'drizzle-orm/relations';
import { trashed, uploadedFiles, uploadFolders } from './schema';

export const uploadedFilesRelations = relations(
  uploadedFiles,
  ({ one, many }) => ({
    uploadFolder: one(uploadFolders, {
      fields: [uploadedFiles.folderId],
      references: [uploadFolders.id],
    }),
    trasheds: many(trashed),
  }),
);

export const uploadFoldersRelations = relations(uploadFolders, ({ many }) => ({
  uploadedFiles: many(uploadedFiles),
  trasheds: many(trashed),
}));

export const trashedRelations = relations(trashed, ({ one }) => ({
  uploadedFile: one(uploadedFiles, {
    fields: [trashed.fileId],
    references: [uploadedFiles.id],
  }),
  uploadFolder: one(uploadFolders, {
    fields: [trashed.folderId],
    references: [uploadFolders.id],
  }),
}));
