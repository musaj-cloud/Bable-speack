// hooks/useDocumentCamera.ts
// Owns the Document-mode camera: permission, the CameraView ref, torch state,
// and the two ways to get a photo (shutter capture or gallery pick). The image
// stays on device — it is only ever handed to on-device OCR.
import { useCallback, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export const useDocumentCamera = () => {
  const ref = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);

  // Take a photo from the live preview. Returns the file uri (or null).
  const capture = useCallback(async (): Promise<string | null> => {
    const photo = await ref.current?.takePictureAsync({ quality: 0.7 });
    return photo?.uri ?? null;
  }, []);

  // Pick an existing photo from the device gallery. Returns the uri (or null).
  const pick = useCallback(async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled) return null;
    return result.assets[0]?.uri ?? null;
  }, []);

  const toggleTorch = useCallback(() => setTorch((t) => !t), []);

  return { ref, permission, requestPermission, torch, toggleTorch, capture, pick };
};
