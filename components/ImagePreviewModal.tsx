import { MaterialIcons } from '@expo/vector-icons';
import { Image, Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  uri: string | null;
  visible: boolean;
  onClose: () => void;
};

// Full-screen image viewer: a dark backdrop with the image fitted (contain) so
// nothing is cropped. Tap anywhere — or the close button — to dismiss.
export const ImagePreviewModal = ({ uri, visible, onClose }: Props) => {
  return (
    <Modal
      visible={visible && !!uri}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}
        className="items-center justify-center"
      >
        {!!uri && (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        )}
        <SafeAreaView
          edges={['top']}
          style={{ position: 'absolute', top: 0, right: 0 }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close image preview"
            style={{
              margin: 16,
              width: 40,
              height: 40,
              borderRadius: 99,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            className="items-center justify-center"
          >
            <MaterialIcons name="close" size={24} color="#ffffff" />
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
};
