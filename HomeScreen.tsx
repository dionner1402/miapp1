import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, Button, ActivityIndicator, TouchableOpacity, TextInput, StyleSheet, Alert, AppState, FlatList,  } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatTime, formatDate, getDistance } from './utils'; // Otros imports
import { Geolocation } from '@react-native-community/geolocation';
import { ScrollView } from 'react-native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [price, setPrice] = useState<string>("");
  const [tripEnded, setTripEnded] = useState(false);
  const lastLocation = useRef(null);
  const timerRef = useRef(null);
  const [plataforma, setPlataforma] = useState("UBER");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [costoMantenimiento, setCostoMantenimiento] = useState("");
  const [mantenimientoParcial, setmantenimientoParcial] = useState("");
  const [pagoCuentaSemana, setPagoCuentaSemana] = useState("");
  const [rentaCelular, setRentaCelular] = useState("");
  const [precioGasolina, setPrecioGasolina] = useState<string>("0"); // Nuevo estado
  const [consumo, setConsumo] = useState<number>(0); // Valor inicial 0
  const [segurooParcial, setseguroParcial] = useState("");
  const [costoSeguro, setcostoSeguro] = useState<number>(0); // Valor inicial 0
  const [kmRecorridos, setkmRecorridos] = useState<number>(0); // Valor inicial 0
  const [lastTrip, setLastTrip] = useState(null);
  const [consumoL100km, setConsumoL100km] = useState<string>(''); // El valor original de consumo (L/100km)
  const [consumoLkm, setConsumoLkm] = useState<string>(''); // O, si prefieres numérico: useState<number>(0)
  const [rentaCelularSemana, setRentaCelularSemana] = useState<number>(0); // Valor inicial puede ser 0 o cargado desde AsyncStorage
  const [costoGasolina, setCostoGasolina] = useState<string>("0.00");
  const [totalGastosDia, setTotalGastosDia] = useState<number>(0); // Valor inicial 0
  const [userLocation, setUserLocation] = useState(null);
  
  
  // Función para cargar datos del último viaje
  const loadLastTrip = async () => {
    try {
      const storedHistorial = await AsyncStorage.getItem("historial");
      const historial = storedHistorial ? JSON.parse(storedHistorial) : [];

      if (historial.length > 0) {
        const lastTrip = historial[historial.length - 1]; // Último viaje registrado
        setLastTrip(lastTrip);

       
        }
      
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    }
  };

  // Cargar datos al enfocar la pantalla
useFocusEffect(
  React.useCallback(() => {
    const fetchLastTrip = async () => {
      await loadLastTrip(); // Llama a la función que carga el último viaje
    };

    fetchLastTrip(); // Ejecuta la función al enfocarse
  }, [])
);


const mapRef = useRef(null);

useFocusEffect(
  React.useCallback(() => {
const loadData = async () => {
  try {
    const storedPlataforma = await AsyncStorage.getItem("plataforma");
    const storedVehiculo = await AsyncStorage.getItem("vehiculo");
    const storedTipoGasolina = await AsyncStorage.getItem("tipoGasolina");
	const storedGastosDiarios = await AsyncStorage.getItem("gastosDiarios")
// Obtener la fecha de hoy en formato 'YYYY-MM-DD'
	const fechaHoy = new Date().toLocaleDateString();
   
// Procesar gastos diarios
if (storedGastosDiarios) {
  const gastosDiarios = JSON.parse(storedGastosDiarios);

  // Filtrar los gastos que corresponden al día de hoy
  const gastosHoy = gastosDiarios.filter((gasto) => {
    const fechaGasto = new Date(gasto.fecha).toLocaleDateString();
    return fechaGasto === fechaHoy; // Comparar solo la fecha (sin hora)
  });

  // Sumar los montos de los gastos de hoy
  const totalHoy = gastosHoy.reduce((acc, gasto) => acc + parseFloat(gasto.monto), 0);

  // Guardar el total de los gastos de hoy en el estado
  setTotalGastosDia(totalHoy.toFixed(2));
}
	  

   if (storedTipoGasolina) {
      const precio = preciosGasolina[storedTipoGasolina];
      setPrecioGasolina(`$${precio}`);
    } else {
      setPrecioGasolina("No seleccionada");
    }

    if (storedPlataforma) setPlataforma(storedPlataforma);

    if (storedVehiculo) {
      const vehiculo = JSON.parse(storedVehiculo);
      setCostoMantenimiento(vehiculo.costoMantenimiento || "0");
      setPagoCuentaSemana(vehiculo.montoCuenta || "0");
      setRentaCelular(vehiculo.rentaCelular || "0");
	  setcostoSeguro(vehiculo.costoSeguro || "0");
	 
      setConsumo(vehiculo.consumo || "No disponible");
	  setkmRecorridos(vehiculo.kmRecorridos || "No disponible");
      setConsumoL100km(vehiculo.consumo || "No disponible");  // Asegúrate de que este campo también se obtiene
	  
    }
  } catch (error) {
    console.log("Error al recuperar datos:", error);
  }
};


    loadData();

    // Solicitar permisos de ubicación
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      }
    })();
  }, [])  // Dependencias vacías
);

// Define precios de gasolina y demás lógica
const preciosGasolina = {
  91: 0.85,
  95: 0.88,
  diésel: 0.79,
};

const startTracking = async () => {
  if (!price) {
    alert("Por favor, ingrese el monto cobrado antes de iniciar el viaje.");
    return;
  }
  setIsTracking(true);
  setDistance(3);
  setTime(3600);
  setTripEnded(false);

  const currentTime = new Date();
  setStartTime(formatTime(currentTime)); // Hora de inicio con formato
  setEndTime(formatTime(currentTime)); // Hora de inicio con formato
  setEndDate(formatDate(currentTime)); // Fecha de inicio con formato

  let watch = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 1,
    },
    (newLocation) => {
      if (lastLocation.current) {
        const dist = getDistance(lastLocation.current.coords, newLocation.coords);
        setDistance((prevDistance) => prevDistance + dist);
      }
      lastLocation.current = newLocation;
      setLocation(newLocation);
    }
  );
  setWatchId(watch);
  startTimer();
};



  const stopTracking = async () => {
    console.log("Deteniendo el seguimiento...");

    if (watchId) {
      watchId.remove();
    }

    setIsTracking(false);
    setTripEnded(true);

    const currentTime = new Date();
    setEndTime(formatTime(currentTime)); // Hora de fin con formato
    setEndDate(formatDate(currentTime)); // Fecha de fin con formato

    console.log("Hora de fin:", currentTime.toLocaleTimeString());
    stopTimer();
    await saveTrip(); // Guardar el viaje al finalizar
  };

  const getDistance = (coords1, coords2) => {
    const rad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km
    const dLat = rad(coords2.latitude - coords1.latitude);
    const dLon = rad(coords2.longitude - coords1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(coords1.latitude)) *
        Math.cos(rad(coords2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1); // Aumentar el tiempo en 1 segundo
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePriceChange = (value) => {
    setPrice(value);
  };

  const convertTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes} min ${sec} seg`;
  };

  const startNewTrip = () => {
    setDistance(0);
    setTime(0);
    setPrice("");
    setTripEnded(false);
    setIsTracking(false);
    setStartTime(null);
    setEndTime(null);
    setEndDate(null); // Resetear la fecha
    lastLocation.current = null;
  };

  const calculateComision = () => {
    const comisiones = {
      UBER: 0.10, // 20% de comisión para UBER
      INDRIVE: 0.129, // 12% de comisión para INDRIVE
      LIBRE: 0, // 0% de comisión para LIBRE
    };
    return parseFloat(price) * comisiones[plataforma]; // Calcula la comisión
  };
  
  
  const generateId = () => {
  const platformInitials = plataforma === "UBER" ? "UB" : plataforma === "INDRIVE" ? "IN" : "LI";
  const timestamp = Date.now(); // Generar timestamp único
  return `${platformInitials}-${timestamp}`;
};




// Ejemplo de cómo guardar la plataforma seleccionada en AsyncStorage
const savePlataforma = async (plataformaSeleccionada) => {
  try {
    await AsyncStorage.setItem('plataforma', plataformaSeleccionada);
  } catch (error) {
    console.log('Error al guardar la plataforma', error);
  }
};
  
  

  const saveTrip = async () => {
  const nuevoViaje = {
    id: generateId(),
    horaInicio: startTime,
    HoraFin: endTime,
    endDate: endDate,
    distancia: distance.toFixed(2),
    montoCobrado: price,
    plataforma: plataforma,
    comision: calculateComision().toFixed(2),
    duracion: convertTime(time),
	
    costoMantenimiento: costoMantenimiento,
	costoMantPorViaje: mantenimientoParcial,
	
	costoSeguro: costoSeguro,
	costoSeguroPorViaje: calculateSeguroHora().toFixed(4),
    totalGastosDia: totalGastosDia,
	
    pagoCuentaSemana: pagoCuentaSemana,
    costoCtaPorViaje: calculateCtaHora().toFixed(4),
    
	rentaCelular: rentaCelular,
    costoCelPorViaje: calculateDatosHora().toFixed(4),
    
	consumo: (consumo / 100).toFixed(4),
    precioGasolina: precioGasolina,
    costoGasolina: costoGasolina,
	kmRecorridos: kmRecorridos,
  };

    try {
    const historialActual = await AsyncStorage.getItem('historialViajes');
    const historial = historialActual ? JSON.parse(historialActual) : [];
    historial.unshift(nuevoViaje); // Agrega el nuevo viaje al inicio
    await AsyncStorage.setItem('historialViajes', JSON.stringify(historial));
    console.log('Viaje guardado exitosamente');
  } catch (error) {
    console.error('Error al guardar el viaje:', error);
  }
};


// La fórmula de cálculo de cta parcial

const calculateCtaHora = (): number => {
  if (time <= 0) {
    console.log("La duración del viaje no es válida.");
    return 0; // O puedes mostrar un mensaje de error si es necesario
  }

  const hoursInWeek = 168; // Horas en una semana (7 * 24)
  const durationHours = time / 3600; // Convertir de segundos a horas
  const ctaPerHour = pagoCuentaSemana / hoursInWeek;
  const result = ctaPerHour * durationHours;
  
  const formattedResult = result.toFixed(4); // Muestra 4 decimales, por ejemplo
  console.log("Cta/hora calculado: ", formattedResult); // Ver el valor con decimales
  
  return parseFloat(formattedResult); // Retorna el valor como número
};



// La fórmula de cálculo de renta celular parcial

const calculateDatosHora = (): number => {
  const hoursInWeek = 168; // Total de horas en una semana
  const durationHours = time / 3600; // Convierte el tiempo del viaje de segundos a horas

  // Si el usuario no ha definido "Renta Celular", asumimos 0
  if (!rentaCelular || durationHours <= 0) return 0;

  const rentaPorHora = rentaCelular / hoursInWeek; // Costo por hora
  return rentaPorHora * durationHours; // Calcula el costo proporcional al tiempo del viaje
};



// La fórmula de cálculo del seguro

const calculateSeguroHora = (): number => {
  const hoursInWeek = 168; // Total de horas en una semana
  const durationHours = time / 3600; // Convierte el tiempo del viaje de segundos a horas

  // Si el usuario no ha definido "Renta Celular", asumimos 0
  if (!costoSeguro || durationHours <= 0) return 0;

  const seguroPorHora = costoSeguro / hoursInWeek; // Costo por hora
  return seguroPorHora * durationHours; // Calcula el costo proporcional al tiempo del viaje
};



// La fórmula de cálculo de mantenimiento parcial
  const calcularMantenimientoParcial = (costoMantenimiento: string, distancia: number): string => {
  const costo = parseFloat(costoMantenimiento); // Asegúrate de que sea un número
  if (!costo || distancia <= 0) {
    return "0"; // Si el costo no es válido o la distancia es 0, devuelve 0
  }
  // La fórmula de cálculo del mantenimiento parcial
  const mantenimientoParcial = (costo / 5000) * distancia;
  return mantenimientoParcial.toFixed(4); // Devolvemos el resultado con dos decimales
};



useEffect(() => {
  // Calcula el mantenimiento parcial solo si la distancia está disponible y el costo de mantenimiento está definido
  if (costoMantenimiento && distance > 0) {
    const mantenimiento = calcularMantenimientoParcial(costoMantenimiento, distance);
    setmantenimientoParcial(mantenimiento); // Guardamos el resultado en el estado
  }
}, [costoMantenimiento, distance]); // Dependencias para que se actualice cuando la distancia o el costo cambien



// Calculating cost of gasoline based on consumo, precioGasolina, and distance
  useEffect(() => {
    if (consumo > 0 && precioGasolina && distance > 0) {
      const calculatedCostoGasolina = ((consumo / 100) * distance * parseFloat(precioGasolina.replace('$', ''))).toFixed(4);
      setCostoGasolina(calculatedCostoGasolina);
    } else {
      setCostoGasolina("0.00");
    }
  }, [consumo, precioGasolina, distance]);  // Dependencies of the calculation
  
  
  

useEffect(() => {
  if (location && isTracking) {
    mapRef.current?.animateCamera({
      center: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      zoom: 15,
    });
  }
}, [location, isTracking]);


  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

    useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Text style={{ fontSize: 16, paddingRight: 10, color: "blue" }}>
            {plataforma}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [plataforma]);

  return (
  <View style={{ flex: 1 }}>
    <View style={styles.topMenu}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate("Perfil")}
      >
        <Text style={styles.menuButtonText}>Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate("Historial")}
      >
        <Text style={styles.menuButtonText}>Historial</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate("Gastos")}
      >
        <Text style={styles.menuButtonText}>Gastos</Text>
      </TouchableOpacity>

      

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.navigate("Ingresos")}
      >
        <Text style={styles.menuButtonText}>Ingresos</Text>
      </TouchableOpacity>
    </View>

{location ? (
  <>
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      customMapStyle={mapStyle} // Estilo nocturno
     
onMapReady={() => {
  if (location && mapRef.current) {
    mapRef.current.setCamera({
      center: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      pitch: 60, // Vista inclinada (3D)
      heading: 0,
      zoom: 15,
      altitude: 500,
    });
  }
}}
    >
      <Marker
  coordinate={{
    latitude: location?.coords.latitude || 0,
    longitude: location?.coords.longitude || 0,
  }}
  title="Ubicación Actual"
/>
	  
    </MapView>
    
	

  </>
) : (
  <ActivityIndicator size="large" color="#0000ff" />
)}


<View style={styles.bottomContainer}>
  {!tripEnded ? (
    <>
      <Text style={styles.sectionTitle}>Registrar Monto del Viaje</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa el monto cobrado"
        keyboardType="numeric"
        onChangeText={setPrice}
        value={price}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={isTracking ? "Finalizar Viaje" : "Iniciar Viaje"}
          onPress={
            isTracking
              ? () =>
                  Alert.alert(
                    "Finalizar Viaje",
                    `¿El monto final sigue igual?\n\nMonto final cobrado: $${parseFloat(price || "0").toFixed(2)}`,
                    [
                      {
                        text: "Modificar",
                        style: "cancel",
                        onPress: () => console.log("Edición del monto permitida."),
                      },
                      {
                        text: "Sí, finalizar",
                        onPress: stopTracking, // Llama a la función para finalizar el viaje
                      },
                    ]
                  )
              : startTracking
          }
          color={isTracking ? "#FF5733" : "#007BFF"}
        />
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Distancia:</Text>
          <Text style={styles.infoValue}>{distance.toFixed(2)} km</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Tiempo:</Text>
          <Text style={styles.infoValue}>{convertTime(time)}</Text>
        </View>
      </View>
    </>
  ) : (
    <>
	
	
	
            
<Text style={styles.tripStatus}>ÚLTIMO VIAJE REGISTRADO</Text>
            <View style={styles.lastTripContainer}>
   {/*Contenedor de 70% para los detalles del viaje*/} 
  <View style={styles.detailsContainer}>
    <Text style={styles.infoText}>ID: {generateId()}</Text>
    <Text style={styles.infoText}>Fecha: {endDate}</Text>
    <Text style={styles.infoText}>Hora de inicio: {startTime}</Text>
    <Text style={styles.infoText}>Hora de fin: {endTime}</Text>
    <Text style={styles.infoText}>Duración: {convertTime(time)}</Text>
    <Text style={styles.infoText}>Distancia: {distance.toFixed(2)} km</Text>
	<Text style={styles.infoText}>Monto cobrado: ${parseFloat(price || '0').toFixed(2)}</Text>
    <Text style={styles.restaText}>Comisión: ${calculateComision().toFixed(2)}</Text>
   <Text style={styles.infoText}>Mant.|5000km: ${costoMantenimiento}</Text>
    <Text style={styles.restaText}>Costo Mant./Viaje: ${mantenimientoParcial}</Text>
    <Text style={styles.infoText}>Cta./Semana: ${pagoCuentaSemana}</Text>
    <Text style={styles.restaText}>Costo Cta./Viaje: ${calculateCtaHora().toFixed(4)}</Text>
    <Text style={styles.infoText}>Renta celular: ${rentaCelular}</Text>
    <Text style={styles.restaText}>Costo Cel/Viaje: ${calculateDatosHora().toFixed(4)}</Text>
    <Text style={styles.infoText}>Consumo (L/km): {(consumo / 100).toFixed(4)}</Text>
    <Text style={styles.infoText}>Gasolina: {precioGasolina}</Text>
    <Text style={styles.restaText}>Costo Gas/Viaje: ${costoGasolina}</Text>
	<Text style={styles.infoText}>Seguro: ${costoSeguro}</Text>
	
	<Text style={styles.restaText}>Costo Seguro/Viaje: ${calculateSeguroHora().toFixed(4)}</Text>
	<Text style={styles.text}>Total Gastos del Día: ${totalGastosDia}</Text>
	
	<Text style={styles.text}>
          <Text style={styles.boldText}> Recorridos:</Text> {kmRecorridos} km}</Text>
        
 
 </View>
 
  

  {/* Contenedor de 30% para Monto cobrado y Neto */}
  <View style={styles.summaryContainer}>
    <View style={styles.montoContainer}>
      <Text style={styles.montoLabel}>Cobrado $</Text>
      <Text style={styles.montoValue}>${parseFloat(price || '0').toFixed(2)}</Text>
    </View>
    <View style={styles.montoContainer}>
      <Text style={styles.montoLabel}>Neto $</Text>
      <Text style={styles.montoValue}>
        {(price - calculateComision() - mantenimientoParcial - calculateCtaHora() - calculateDatosHora() - calculateSeguroHora() - costoGasolina).toFixed(2)}
      </Text>
    </View>
  </View>
</View>

            <Button title="Iniciar Nuevo Viaje" onPress={startNewTrip} color="#28a745" />
          </>
        )}
      </View>
    </View>
  );
};



const mapStyle = [
  {
    elementType: "geometry", stylers: [{ color: "#212121" }],},
  {
    elementType: "labels.icon", stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill", stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke", stylers: [{ color: "#212121" }],
  },
  {
    featureType: "road",
    elementType: "geometry", stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke", stylers: [{ color: "#212121" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "water",
    elementType: "geometry", stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }],
  },
];


const styles = StyleSheet.create({
  // Estilos principales
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  
  // Menú superior
  topMenu: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 2,
    borderBottomColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderRadius: 8,
  },
  menuButton: {
    flex: 1,
    marginHorizontal: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },

  // Texto plataforma
  plataformaText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
    alignSelf: "center",
  },

  // Contenedor inferior
  bottomContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  // Botones
  buttonContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Entrada de texto
  input: {
    height: 50,
    borderColor: "#007BFF",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },

  // Información y contenedores
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  infoBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },

  // Contenedores de viaje
  lastTripContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  detailsContainer: {
    width: "60%",
    paddingRight: 10,
  },
  summaryContainer: {
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  montoContainer: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    width: "110%",
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  montoLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  montoValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
  restaText: {
    fontSize: 14,
    color: "red",
    marginBottom: 5,
  },

  // Contadores
  counterContainer: {
    alignItems: "center",
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    letterSpacing: 1.1,
  },
  mediumText: {
    color: "#007BFF",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
  },

  // Estado del viaje
  tripStatus: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#007BFF",
  },

  // Títulos de sección
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
});




export default HomeScreen;
