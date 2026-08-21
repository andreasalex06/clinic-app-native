import { StyleSheet } from "react-native";

export const PRIMARY_600 = "#059669";

export const consultationStyles = StyleSheet.create({
  activeOption: {
    backgroundColor: "#ecfdf5",
    borderColor: PRIMARY_600,
  },
  activeText: {
    color: "#047857",
  },
  checkbox: {
    borderColor: "#94a3b8",
  },
  checkedBox: {
    backgroundColor: PRIMARY_600,
    borderColor: PRIMARY_600,
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  modalContent: {
    gap: 10,
    paddingBottom: 16,
  },
  option: {
    backgroundColor: "#ffffff",
    borderColor: "#e2e8f0",
  },
  optionTitle: {
    color: "#020617",
  },
  textBold: {
    fontFamily: "Poppins_700Bold",
    includeFontPadding: true,
  },
  textRegular: {
    fontFamily: "Poppins_400Regular",
    includeFontPadding: true,
  },
  textSemiBold: {
    fontFamily: "Poppins_600SemiBold",
    includeFontPadding: true,
  },
});
