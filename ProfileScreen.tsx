import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons"; // Usando MaterialIcons
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }: any) => {
  const preciosGasolina = {
    "91": "$0.85",
    "95": "$0.88",
    "diésel": "$0.79",
  };

  const [plataforma, setPlataforma] = useState("UBER");
  const [tipoGasolina, setTipoGasolina] = useState("91");
  const [precioGasolina, setPrecioGasolina] = useState<string>("$0.85");
  const [vehiculo, setVehiculo] = useState<any>(null);
  const [lastTripDistance, setLastTripDistance] = useState<number>(0); // Inicializamos en 0
  const comisiones = {
    UBER: 10.0,
    INDRIVE: 12.99,
    Libre: 0.0,
  };


  // Función para cargar datos desde AsyncStorage
  const loadData = async () => {
    try {
      const storedTipoGasolina = await AsyncStorage.getItem("tipoGasolina");
      const storedPlataforma = await AsyncStorage.getItem("plataforma");
      const storedVehiculo = await AsyncStorage.getItem("vehiculo");
	  const storedLastTripDistance = await AsyncStorage.getItem("lastTripDistance")

      if (storedTipoGasolina) {
        setTipoGasolina(storedTipoGasolina);
        setPrecioGasolina(preciosGasolina[storedTipoGasolina]);
      } else {
        setTipoGasolina("91");
        setPrecioGasolina(preciosGasolina["91"]);
      }

      if (storedPlataforma) {
        setPlataforma(storedPlataforma);
      }

      if (storedVehiculo) {
        setVehiculo(JSON.parse(storedVehiculo));
      }
    } catch (error) {
      console.log("Error al recuperar datos:", error);
    }
  };
  
  const handleNavigateToVehiculo = () => {
    navigation.navigate('Vehiculo');  // Asegúrate de que 'Vehiculo' sea el nombre correcto de la pantalla
  };
  
// Manejar el cambio de tipo de gasolina
  const handleGasolinaChange = (tipo: string) => {
    setTipoGasolina(tipo);
    setPrecioGasolina(preciosGasolina[tipo]);

    // Guardar el tipo de gasolina seleccionado en AsyncStorage
    AsyncStorage.setItem("tipoGasolina", tipo);
    AsyncStorage.setItem("precioGasolina", preciosGasolina[tipo]);
  };
  
 

 // Función para manejar el cambio de plataforma
  const handlePlataformaChange = async (itemValue: string) => {
    setPlataforma(itemValue);
    try {
      await AsyncStorage.setItem("plataforma", itemValue);
    } catch (error) {
      console.log("Error al guardar la plataforma:", error);
    }
  };

  // Usar useFocusEffect para cargar los datos al enfocar la pantalla
  useFocusEffect(
    React.useCallback(() => {
      loadData();
      navigation.setOptions({
        title: `Plataforma: ${plataforma}`, // Mostrar la plataforma en el encabezado
      });
    }, [plataforma])  // Se actualizará cuando cambie 'plataforma'
  );


// Sumar los kilómetros del último viaje
  const totalKmRecorridos = vehiculo ? vehiculo.kmRecorridos + lastTripDistance : lastTripDistance;

  const displayValue = (value: any) => {
  if (typeof value === "string" && value.trim() !== "") {
    return value; // Devuelve la cadena si no está vacía
  } else if (typeof value === "number" && !isNaN(value)) {
    return value; // Devuelve el número si es válido
  } else {
    return "-"; // Valor predeterminado si no es válido
  }
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
	  <Text style={styles.title}>Perfil de Usuario</Text>

      <Text style={styles.userName}>Juan Pérez</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>
          <Icon name="business" size={18} color="#333" style={styles.icon} />
          Selecciona la Plataforma
        </Text>
        <Picker
          selectedValue={plataforma}
          style={styles.picker}
          onValueChange={handlePlataformaChange}
        >
          <Picker.Item label="Uber" value="UBER" />
          <Picker.Item label="InDrive" value="INDRIVE" />
          <Picker.Item label="Libre" value="LIBRE" />
        </Picker>

        <Text style={styles.text}>
          Comisión: <Text style={styles.value}>{comisiones[plataforma] ?? "0"}%</Text>
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>
          <Icon name="local-gas-station" size={18} color="#333" style={styles.icon} />
          Precios Promedio de Gasolina
        </Text>
        <Picker
          selectedValue={tipoGasolina}
          style={styles.picker}
          onValueChange={handleGasolinaChange}
        >
          <Picker.Item label="Gasolina | 91" value="91" />
          <Picker.Item label="Gasolina | 95" value="95" />
          <Picker.Item label="Diésel" value="diésel" />
        </Picker>

        <Text style={styles.text}>
          Precio: <Text style={styles.value}>{precioGasolina} por litro</Text>
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>
          <Icon name="directions-car" size={18} color="#333" style={styles.icon} />
          
		  
		  Características del Vehículo
        </Text>
        {vehiculo ? (
          <View>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Marca:</Text> {displayValue(vehiculo.marca)}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Modelo:</Text> {displayValue(vehiculo.modelo)}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Año:</Text> {displayValue(vehiculo.anio)}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Consumo:</Text> {displayValue(vehiculo.consumo)} L/100 km
            </Text>
            <Text style={styles.text}>
  <Text style={styles.boldText}>Kilómetros Recorridos:</Text> {displayValue(vehiculo.kmRecorridos)} km
</Text>

            <Text style={styles.text}>
              <Text style={styles.boldText}>Próximo Mantenimiento en:</Text> {displayValue(5000 - parseInt(vehiculo.kmRecorridos))} km
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Plataforma:</Text> {plataforma}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Tipo de Gasolina:</Text> {tipoGasolina}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.boldText}>Precio:</Text> {precioGasolina}
            </Text>
			
			
			
          </View>
        ) : (
          <View>
            <Text style={styles.text}>No tienes un vehículo guardado. ¡Añade uno!</Text>
            <Button title="Añadir Vehículo" onPress={handleNavigateToVehiculo} />
          </View>
        )}
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>
          <Icon name="money" size={18} color="#333" style={styles.icon} />
          Gastos del Vehículo
        </Text>
        {vehiculo ? (
          <View>
		  
            <Text style={styles.text}>
              <Text style={styles.boldText}>Costo de Mantenimiento:</Text> ${displayValue(vehiculo.costoMantenimiento)}
            </Text>
			
			<Text style={styles.text}>
              <Text style={styles.boldText}>Seguro:</Text> ${displayValue(vehiculo.costoSeguro)}
            </Text>
			
			
            <Text style={styles.text}>
              <Text style={styles.boldText}>Renta Celular:</Text> ${displayValue(vehiculo.rentaCelular)}
            </Text>
			
			
            <Text style={styles.text}>
			  <Text style={styles.boldText}>Cuenta/Letra:</Text> {vehiculo.pagaCuenta ? `$${displayValue(vehiculo.montoCuenta)}` : "No"}
		    </Text>

			  
			  
            )}
          </View>
        ) : (
          <Text style={styles.text}>No tienes gastos registrados. ¡Añádelos!</Text>
        )}
      </View>

      <View style={styles.section}>
        <Button title="Gestionar Vehículo" onPress={handleNavigateToVehiculo} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "gray",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "left",
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  cardContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5,
  },
  icon: {
    marginRight: 10,
  },
});

export default ProfileScreen;
