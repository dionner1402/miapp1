// src/screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

const SplashScreen: React.FC<any> = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login"); // Navegar a la pantalla de login después de 2 segundos
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF7043",
  },
  title: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
});

export default SplashScreen;