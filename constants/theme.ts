<<<<<<< HEAD
=======
// constants/theme.ts
>>>>>>> 7a580322cee3a3599f949a01a96fbd488559301e
export const COLORS = {
  heart: "#FF5E7E",
  grey: "#a3a4a8ff",
  white: "#ffffffff",
  primary: "#091556cc",
  secondary: "#7c3aed",
  tertiary: "#1940bd",
};

export const LIGHT_COLORS = {
  primary: "#091556cc",
  secondary: "#7c3aed",
  background: "#ecececff",
  surface: "#ffffffff",
  text: "#1b3872ff",
  text2:"#1b3872ff",
  textSecondary: "#4A5568",
  border: "#E2E8F0",
  input: "#ffffffff",
  placeholder: "#A0AEC0",
  buttonText: "#FFFFFF",
  overlay: "rgba(0,0,0,0.5)",
  error: "#F56565",
  success: "#48BB78",
  white: "#FFFFFF",
  subtext: "#718096",
  surfaceLight: "#E6F0FF",
  green: "#00C89E",
  diagonalGradient: {
    background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.tertiary})`,
  },
};

export const DARK_COLORS = {
  primary: "#170957",
  secondary: "#1940bd",
  background: "#0A0F2C",
  surface: "#192046",
  text: "#F5F7FB",
  text2:"#170957",
  textSecondary: "#A0AEC0",
  border: "#404564ff",
  input: "#ffffffff",
  placeholder: "#4A5568",
  buttonText: "#FFFFFF",
  overlay: "rgba(0,0,0,0.7)",
  error: "#F56565",
  success: "#48BB78",
  white: "#FFFFFF",
  subtext: "#CBD5E0",
  surfaceLight: "#2D3748",
  green: "#00C89E",

  diagonalGradient: {
    background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.tertiary})`,
  },
};

export type ThemeColors = typeof LIGHT_COLORS | typeof DARK_COLORS;
