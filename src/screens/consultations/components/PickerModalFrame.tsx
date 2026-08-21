import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { consultationStyles } from "./styles";

type PickerModalFrameProps = {
  children: ReactNode;
  title: string;
  visible: boolean;
  onClose: () => void;
};

export function PickerModalFrame({ children, title, visible, onClose }: PickerModalFrameProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={consultationStyles.modalBackdrop}>
        <View className="max-h-[76%] rounded-t-[28px] bg-white px-5 pb-5 pt-4">
          <View className="mb-4 flex-row items-center justify-between gap-3">
            <Text className="text-lg text-slate-950" style={consultationStyles.textBold}>
              {title}
            </Text>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100" onPress={onClose}>
              <FontAwesome color="#334155" name="times" size={15} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={consultationStyles.modalContent} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
