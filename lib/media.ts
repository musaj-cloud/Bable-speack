// lib/media.ts
// Persist captured/picked images into the app's document directory so a saved
// Document scan can still show its photo after the OS clears the camera/picker
// cache. Everything stays on device — images never leave the phone.
import { Directory, File, Paths } from 'expo-file-system';

const DIR_NAME = 'history-images';

// The folder that holds saved scan images, created on first use.
const historyDir = (): Directory => {
  const dir = new Directory(Paths.document, DIR_NAME);
  if (!dir.exists) dir.create();
  return dir;
};

// Copy an image into permanent storage and return its new on-device uri. Falls
// back to the original uri if the copy fails — a maybe-stale preview beats
// losing the history entry.
export const persistImage = (uri: string, id: string): string => {
  try {
    const ext = uri.split('?')[0].split('.').pop() || 'jpg';
    const dest = new File(historyDir(), `${id}.${ext}`);
    if (dest.exists) dest.delete();
    new File(uri).copy(dest);
    return dest.uri;
  } catch {
    return uri;
  }
};

// Best-effort cleanup when a history entry's image is deleted. Only touches
// files we persisted (inside DIR_NAME) so we never delete an original photo.
export const deleteImage = (uri?: string): void => {
  if (!uri || !uri.includes(DIR_NAME)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // A missing file is fine — nothing to clean up.
  }
};
