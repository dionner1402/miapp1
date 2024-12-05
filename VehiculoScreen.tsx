import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Button, Switch, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome"; // Importar los íconos

const VehiculoScreen = ({ navigation, route }: any) => {
  const [vehiculo, setVehiculo] = useState<any>({
    marca: "",
    modelo: "",
    anio: "",
    consumo: "",
    costoMantenimiento: "",
	costoSeguro: "",
    kmRecorridos: "",
    pagaCuenta: false,
    montoCuenta: "",
    rentaCelular: "", // Nuevo campo para renta celular
  });

  const [isEditMode, setIsEditMode] = useState(true); // Controla si estamos en modo edición o visualización

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedVehiculo = await AsyncStorage.getItem("vehiculo");
        const storedEditMode = await AsyncStorage.getItem("isEditMode");

        if (storedVehiculo) setVehiculo(JSON.parse(storedVehiculo));
        if (storedEditMode !== null) setIsEditMode(JSON.parse(storedEditMode));
      } catch (error) {
        console.log("Error al cargar los datos:", error);
      }
    };
    loadData();
  }, []);

  // Guardar el vehículo y el estado de edición en AsyncStorage
  const handleSaveVehiculo = async () => {
    try {
      await AsyncStorage.setItem("vehiculo", JSON.stringify(vehiculo));
      await AsyncStorage.setItem("isEditMode", JSON.stringify(false)); // Cambiar a modo visualización
      setIsEditMode(false); // Cambiar a modo visualización
    } catch (error) {
      console.log("Error al guardar vehículo:", error);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true); // Cambiar a modo edición
    AsyncStorage.setItem("isEditMode", JSON.stringify(true)); // Guardar el estado en AsyncStorage
  };

  const handleDelete = async () => {
    try {
      await AsyncStorage.removeItem("vehiculo");
      await AsyncStorage.setItem("isEditMode", JSON.stringify(true)); // Cambiar a modo edición al eliminar
      setVehiculo({
        marca: "",
        modelo: "",
        anio: "",
        consumo: "",
        costoMantenimiento: "",
		costoSeguro: "",
        kmRecorridos: "",
        pagaCuenta: false,
        montoCuenta: "",
        rentaCelular: "", // Limpiar el campo de renta celular
      });
      setIsEditMode(true); // Cambiar a modo edición
    } catch (error) {
      console.log("Error al eliminar vehículo:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Título fuera del contenedor */}
      <Text style={styles.autoTitle}>Mi Auto</Text>

      {/* Modo visualización: Textos */}
      <View style={styles.card}>
        {/* Solo mostrar los botones en modo visualización */}
        {!isEditMode && (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Icon name="pencil" size={24} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
              <Icon name="times" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.text}>
          <Text style={styles.boldText}>Marca:</Text> {vehiculo.marca}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Modelo:</Text> {vehiculo.modelo}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Año:</Text> {vehiculo.anio}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Consumo:</Text> {vehiculo.consumo} L/100 km
        </Text>
        <Text style={styles.text}>
          <Text style={styles.boldText}>Kilómetros Recorridos:</Text> {vehiculo.kmRecorridos} km
        </Text>

        {/* Sección de Gastos Fijos */}
        <Text style={styles.sectionTitle}>Gastos Fijos:</Text>
        
		<Text style={styles.text}>
          <Text style={styles.boldText}>Costo de Mantenimiento:</Text> ${vehiculo.costoMantenimiento}
        </Text>
		
		<Text style={styles.text}>
          <Text style={styles.boldText}>Seguro:</Text> ${vehiculo.costoSeguro}
        </Text>
		
        <Text style={styles.text}>
          <Text style={styles.boldText}>Renta Celular:</Text> {vehiculo.rentaCelular ? `$${vehiculo.rentaCelular}` : "No disponible"}
        </Text>
		
        <Text style={styles.text}>
          <Text style={styles.boldText}>Paga Cuenta/Letra:</Text> {vehiculo.pagaCuenta ? "Sí" : "No"}
        </Text>
		
        {vehiculo.pagaCuenta && (
          <Text style={styles.text}>
            <Text style={styles.boldText}>Monto Semanal:</Text> ${vehiculo.montoCuenta}
          </Text>
		  
        )}
      </View>

      {isEditMode && (
        <>
          {/* Características del Vehículo */}
          <Text style={styles.sectionTitle}>Características del Vehículo:</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marca:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.marca}
              onChangeText={(text) => setVehiculo({ ...vehiculo, marca: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.modelo}
              onChangeText={(text) => setVehiculo({ ...vehiculo, modelo: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Año:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.anio}
              onChangeText={(text) => setVehiculo({ ...vehiculo, anio: text })}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Consumo (L/100 km):</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.consumo}
              onChangeText={(text) => setVehiculo({ ...vehiculo, consumo: text })}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kilómetros Recorridos:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.kmRecorridos}
              onChangeText={(text) => setVehiculo({ ...vehiculo, kmRecorridos: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Gastos Fijos */}
          
		  
		  <Text style={styles.sectionTitle}>Gastos Fijos:</Text>
          
		  
		  <View style={styles.inputGroup}>
            <Text style={styles.label}>Costo de Mantenimiento:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.costoMantenimiento}
              onChangeText={(text) => setVehiculo({ ...vehiculo, costoMantenimiento: text })}
              keyboardType="numeric"
            />
			
			</View>
			<View style={styles.inputGroup}>
            <Text style={styles.label}>Seguro:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.costoSeguro}
              onChangeText={(text) => setVehiculo({ ...vehiculo, costoSeguro: text })}
              keyboardType="numeric"
            />
			
			
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Renta Celular:</Text>
            <TextInput
              style={styles.input}
              value={vehiculo.rentaCelular}
              onChangeText={(text) => setVehiculo({ ...vehiculo, rentaCelular: text })}
              keyboardType="numeric"
            />
			
			
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Paga Cuenta:</Text>
            <Switch
              value={vehiculo.pagaCuenta}
              onValueChange={(value) => setVehiculo({ ...vehiculo, pagaCuenta: value })}
            />
			
			
          </View>
          {vehiculo.pagaCuenta && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto Semanal:</Text>
              <TextInput
                style={styles.input}
                value={vehiculo.montoCuenta}
                onChangeText={(text) => setVehiculo({ ...vehiculo, montoCuenta: text })}
                keyboardType="numeric"
              />
            </View>
          )}
          <Button title="Guardar Vehículo" onPress={handleSaveVehiculo} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  autoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center", // Título centrado en la parte superior
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Alinear los iconos a la derecha
    marginBottom: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default VehiculoScreen;
