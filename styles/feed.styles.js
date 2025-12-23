import { COLORS } from "../constants/theme";
import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
    searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    backgroundColor: 'white', 
    borderRadius: 30, 
    alignSelf:"center",
    marginTop:12,
    marginLeft:15,
    marginBottom:-6,
    width:270
  },
  menuButton: {
    marginRight: 12,
    marginLeft:12,
    color:COLORS.primary
  },

  header: {
    position: "fixed",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: COLORS.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  text: {
    color: "white",
    fontWeight: "slim",
    fontSize: 15,
    marginBottom: 0,
    fontFamily: "JetBrainsMono-Medium",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginVertical: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
    fontFamily: "JetBrainsMono-Medium",
    flex: 1,
  },
  appName: {
    color: COLORS.text,
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "JetBrainsMono-Medium",
    alignContent: "center",
    flex: 1,
  },

  phone: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  button: {
    backgroundColor: COLORS.green,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.text,
  },
  prefixRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 2,
  },
  prefixText: {
    color: COLORS.text,
    fontSize: 15,
  },
  removeText: {
    color: COLORS.heart,
    marginLeft: 12,
    fontWeight: "bold",
    fontSize: 15,
  },
});