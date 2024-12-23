import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, Button, ActivityIndicator, Dimensions, TouchableOpacity, TextInput, StyleSheet, Alert, AppState, FlatList, Animated, Image,  } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatTime, formatDate, getDistance } from './utils'; // Otros imports
import { Geolocation } from '@react-native-community/geolocation';
import { ScrollView, Keyboard, } from 'react-native';
import { useTheme } from "../context/ThemeContext";
import { FontAwesome } from "@expo/vector-icons";
import axios from 'axios';

const HomeScreen = () => {
const { isDarkMode } = useTheme(); // Obtener el estado del modo oscuro
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
  const [isTripStarted, setIsTripStarted] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState(null);
  

  
   // Configurar la barra superior según el modo claro/oscuro
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: isDarkMode ? '#1d2637' : '#fff', // Cambia el fondo de la barra superior
      },
      headerTintColor: isDarkMode ? '#FFB85A' : '#1d2637', // Cambia el color del texto de la barra superior
    });
  }, [navigation, isDarkMode]);
  
  const toggleTrip = () => {
    setIsTripStarted((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: isTripStarted ? 0 : -150, // Ajusta -150 según cuánto quieras moverlo
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  
  
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
Keyboard.dismiss();
  if (!price) {
    alert("Por favor, ingrese el monto cobrado antes de iniciar el viaje.");
    return;
  }

  setIsTracking(true);
  setDistance(10); // Establecer distancia inicial a 0
  setTime(3600); // Establecer tiempo inicial a 0
  setTripEnded(false);

  const currentTime = new Date();
  setStartTime(formatTime(currentTime)); // Hora de inicio con formato
  setEndTime(formatTime(currentTime)); // Hora de inicio con formato
  setEndDate(formatDate(currentTime)); // Fecha de inicio con formato

  // Iniciar seguimiento de la ubicación
  let watch = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000, // Actualiza cada 1 segundo
      distanceInterval: 1, // Actualiza cada 1 metro
    },
    (newLocation) => {
      if (lastLocation.current) {
        const dist = getDistance(lastLocation.current.coords, newLocation.coords);
        setDistance((prevDistance) => prevDistance + dist); // Actualizar distancia
      }
      lastLocation.current = newLocation;
      setLocation(newLocation); // Actualizar ubicación actual
    }
  );
  setWatchId(watch);
  startTimer(); // Iniciar contador de tiempo
};

const stopTracking = async () => {
  console.log("Deteniendo el seguimiento...");

  if (watchId) {
    watchId.remove(); // Detener el seguimiento de la ubicación
  }

  setIsTracking(false);
  setTripEnded(true);

  const currentTime = new Date();
  setEndTime(formatTime(currentTime)); // Hora de fin con formato
  setEndDate(formatDate(currentTime)); // Fecha de fin con formato

  console.log("Hora de fin:", currentTime.toLocaleTimeString());
  stopTimer(); // Detener el contador de tiempo
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
    setTime((prevTime) => prevTime + 1); // Incrementar el tiempo cada segundo
  }, 1000);
};

const stopTimer = () => {
  if (timerRef.current) {
    clearInterval(timerRef.current); // Detener el temporizador
    timerRef.current = null;
  }
};

const handlePriceChange = (value) => {
  setPrice(value); // Actualizar monto cobrado
};

const convertTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${minutes} min ${sec} seg`; // Convertir segundos a formato "minutos:segundos"
};

const startNewTrip = () => {
  setDistance(0); // Resetear distancia
  setTime(0); // Resetear tiempo
  setPrice(""); // Resetear monto
  setTripEnded(false); // Indicar que el viaje no ha terminado
  setIsTracking(false); // Detener el seguimiento
  setStartTime(null); // Resetear hora de inicio
  setEndTime(null); // Resetear hora de fin
  setEndDate(null); // Resetear fecha de fin
  lastLocation.current = null; // Resetear última ubicación
};

const calculateComision = () => {
  const comisiones = {
    UBER: 0.10, // 10% de comisión para UBER
    INDRIVE: 0.129, // 12.9% de comisión para INDRIVE
    LIBRE: 0, // 0% de comisión para LIBRE
  };
  return parseFloat(price) * comisiones[plataforma]; // Calcula la comisión en base al monto y plataforma
};

const generateId = () => {
  const platformInitials = plataforma === "UBER" ? "UB" : plataforma === "INDRIVE" ? "IN" : "LI";
  const timestamp = Date.now(); // Generar timestamp único
  return `${platformInitials}-${timestamp}`;
};

// Guardar la plataforma seleccionada en AsyncStorage
const savePlataforma = async (plataformaSeleccionada) => {
  try {
    await AsyncStorage.setItem('plataforma', plataformaSeleccionada); // Guardar en AsyncStorage
  } catch (error) {
    console.log('Error al guardar la plataforma', error); // Manejar errores
  }
};

const saveTrip = async () => {
  const nuevoViaje = {
    id: generateId(),
    horaInicio: startTime,
    horaFin: endTime,
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
    historial.unshift(nuevoViaje); // Agregar el nuevo viaje al inicio del historial
    await AsyncStorage.setItem('historialViajes', JSON.stringify(historial)); // Guardar el historial actualizado
    console.log('Viaje guardado exitosamente');
  } catch (error) {
    console.error('Error al guardar el viaje:', error); // Manejar errores
  }
};


// La fórmula de cálculo de cta parcial

const calculateCtaHora = (): number => {
  if (time <= 0) {
    console.log("La duración del viaje no es válida.");
    return 0; // O puedes mostrar un mensaje de error si es necesario
  }

  const hoursInMonth = 30 * 24; // Total de horas en un mes (30 días)
  const durationHours = time / 3600; // Convertir de segundos a horas
  const ctaPerHour = pagoCuentaSemana / hoursInMonth; // Costo por hora basado en mensual
  const result = ctaPerHour * durationHours;
  
  const formattedResult = result.toFixed(4); // Muestra 4 decimales, por ejemplo
  console.log("Cta/hora calculado: ", formattedResult); // Ver el valor con decimales
  console.log("Duración del viaje en horas: ", durationHours); // Ver cuántas horas son

  return parseFloat(formattedResult); // Retorna el valor como número
};




// La fórmula de cálculo de renta celular parcial

const calculateDatosHora = (): number => {
  const hoursInMonth = 30 * 24; // Total de horas en un mes (30 días)
  const durationHours = time / 3600; // Convierte el tiempo del viaje de segundos a horas

  // Si el usuario no ha definido "Renta Celular", asumimos 0
  if (!rentaCelular || durationHours <= 0) return 0;

  const rentaPorHora = rentaCelular / hoursInMonth; // Costo por hora
  const resultado = rentaPorHora * durationHours; // Calcula el costo proporcional al tiempo del viaje

  console.log(`Renta celular por hora: ${rentaPorHora}`);
  console.log(`Duración del viaje en horas: ${durationHours}`);
  console.log(`Costo de renta celular para el viaje: ${resultado}`);

  return resultado;
};




// La fórmula de cálculo del seguro

const calculateSeguroHora = (): number => {
  const hoursInMonth = 30 * 24; // Total de horas en un mes (30 días)
  const durationHours = time / 3600; // Convierte el tiempo del viaje de segundos a horas

  // Si el usuario no ha definido "Costo Seguro", asumimos 0
  if (!costoSeguro || durationHours <= 0) return 0;

  const seguroPorHora = costoSeguro / hoursInMonth; // Costo por hora basado en mensual
  const resultado = seguroPorHora * durationHours; // Calcula el costo proporcional al tiempo del viaje

  console.log(`Costo seguro por hora: ${seguroPorHora}`);
  console.log(`Duración del viaje en horas: ${durationHours}`);
  console.log(`Costo de seguro para el viaje: ${resultado}`);

  return resultado;
};


// La fórmula de cálculo de mantenimiento parcial
  const calcularMantenimientoParcial = (costoMantenimiento: string, distancia: number): number => {
  const costo = parseFloat(costoMantenimiento); // Convertimos el costo a número
  if (isNaN(costo) || distancia <= 0) {
    return 0; // Si el costo no es válido o la distancia es menor o igual a 0, devuelve 0
  }
  // La fórmula de cálculo del mantenimiento parcial
  const mantenimientoParcial = (costo / 5000) * distancia;
  return mantenimientoParcial; // Devuelve un número
};


useEffect(() => {
  if (costoMantenimiento && distance > 0) {
    const mantenimiento = calcularMantenimientoParcial(costoMantenimiento, distance);
    setmantenimientoParcial(mantenimiento); // Guardamos el resultado en el estado como número
  } else {
    setmantenimientoParcial(0); // Valor predeterminado
  }
}, [costoMantenimiento, distance]);



// Calculating cost of gasoline based on consumo, precioGasolina, and distance
  useEffect(() => {
    if (consumo > 0 && precioGasolina && distance > 0) {
      const calculatedCostoGasolina = ((consumo / 100) * distance * parseFloat(precioGasolina.replace('$', ''))).toFixed(4);
      setCostoGasolina(calculatedCostoGasolina);
    } else {
      setCostoGasolina("0.00");
    }
  }, [consumo, precioGasolina, distance]);  // Dependencies of the calculation
  
  
  
  
  // Obtener la ubicación actual
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    };
    getLocation();
  }, []);
  
  
  // Función de geocodificación inversa para obtener la dirección
  const reverseGeocode = async (lat, lon) => {
    const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    return result[0] ? result[0].formattedAddress : 'Dirección no encontrada';
  };

  // Función para buscar ubicaciones (geocodificación)
  const searchLocation = async (query) => {
    if (!query) return;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyB-hUb_4P77cc3EXmTLMLHCAO5qzi3I1FQ`
    );
    const location = response.data.results[0]?.geometry.location;
    if (location) {
      setSearchedLocation(location);
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: { latitude: location.lat, longitude: location.lng },
          zoom: 15,
        });
      }
    }
  };
  
  
  
  


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
        <TouchableOpacity onPress={() => navigation.navigate("Control")}>
          <Text style={{ fontSize: 16, paddingRight: 10, color: "#FFB85A" }}>
            {plataforma}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [plataforma]);







const screenWidth = Dimensions.get('window').width; // Ancho de la pantalla
  const imageWidth = screenWidth; // Las imágenes ocuparán todo el ancho del contenedor
  const containerHeight = 135; // Altura del contenedor del slider
    // Estado para controlar la imagen visible
  const [currentIndex, setCurrentIndex] = useState(0);
  
  
  // Cambiar la imagen automáticamente cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length); // Cambiar al siguiente índice, reiniciar si llegamos al final
    }, 5000); // Cambiar cada 3 segundos

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);


// Función para ir al siguiente índice
const goToNext = () => {
  setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
};


// Función para manejar el desplazamiento manual
const handleScroll = (event) => {
  const contentOffsetX = event.nativeEvent.contentOffset.x;
  const index = Math.floor(contentOffsetX / imageWidth); // Calcular el índice basado en el desplazamiento
  setCurrentIndex(index);
};

// Función para ir al índice anterior
const goToPrevious = () => {
  setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
};

// Asegúrate de que el FlatList se desplace al índice actual
const flatListRef = useRef(null); // Necesitas declarar esto

useEffect(() => {
  if (flatListRef.current) {
    flatListRef.current.scrollToIndex({ index: currentIndex, animated: true });
  }
}, [currentIndex]);

  
  
  // Imagenes slider
const images = [
  { id: '1', src: require('../../assets/ad1.png') },
  { id: '2', src: require('../../assets/ad2.png') },
  { id: '3', src: require('../../assets/ad3.png') },
];


  return (
  <View style={[{ flex: 1 }, { backgroundColor: isDarkMode ? '#1d2637' : '#fff' }]}>
    {location ? (
      <>
        {/* Contenedor que muestra el slider de imágenes encima del mapa */}
        <View
          style={{
            position: 'absolute',
            
			marginBottom: 50, 
            left: 0,
            right: 0,
            height: containerHeight,
            zIndex: 10,
            backgroundColor: '#1d2637',
            padding: 0,
            alignItems: 'center',
          }}>
          <FlatList
            ref={flatListRef}
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={{ width: imageWidth, height: containerHeight, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={item.src}
                  style={{
                    width: imageWidth,
                    height: containerHeight,
                    borderRadius: 20,
                  }}
                  resizeMode="contain"
                />
              </View>
            )}
            snapToInterval={imageWidth} // Para hacer el scroll con efecto de "snap"
            decelerationRate="fast"
          />
        </View>

        {/* Contenedor del mapa */}
<View style={{
  position: 'absolute',
  bottom: 190,
  left: 0,
  right: 0,
  width: '100%',
  height: 400,
}}>
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
    {/* Muestra el Polyline solo si hay un viaje activo */}
    {isTracking && (
      <Polyline
        coordinates={routeCoordinates}
        strokeColor="#FFB85A" // Color de la línea del viaje
        strokeWidth={5}
      />
    )}
  </MapView>
</View>
      </>
    ) : (
      <ActivityIndicator size="large" color="#FFB85A" />
    )}

    {/* Contenedor fijado en la parte inferior */}
    <View
      style={[
        styles.bottomContainer,
        {
          backgroundColor: isDarkMode ? '#1d2637' : '#f9f9f9',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20, // Puedes ajustar el padding según sea necesario
        },
      ]}>
      {!tripEnded ? (
        <>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFB85A' : '#FFB85A' }]}>Registrar Monto del Viaje</Text>

          <TextInput
            style={[styles.input, { backgroundColor: isDarkMode ? '#323e54' : '#fff', color: isDarkMode ? '#fff' : '#000' }]}
            placeholder="Ingresa el monto cobrado"
            placeholderTextColor={isDarkMode ? '#FFB85A' : '#666'}
            keyboardType="numeric"
            onChangeText={setPrice}
            value={price}
          />

          <View style={[styles.buttonContainer, { backgroundColor: isTracking ? "#323e54" : "#FFB85A" }]}>
            <TouchableOpacity
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
                  : startTracking // Llama a la función para iniciar el seguimiento del viaje
              }
            >
              <Text style={styles.buttonText}>
                {String(isTracking ? "Finalizar Viaje" : "Iniciar Viaje")}
              </Text>
            </TouchableOpacity>
      </View>


    {/* Contadores de distancia y tiempo */}
      {isTracking && (
        <View style={[styles.infoContainer, { backgroundColor: isDarkMode ? '#FFB85A' : '#FFB85A' }]}>
          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#323e54' : '#fff' }]}>
            <Text style={[styles.infoLabel, { color: isDarkMode ? '#FFB85A' : '#333' }]}>Distancia:</Text>
            <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#FFB85A' }]}>
              {distance.toFixed(2)} km
            </Text>
          </View>
          <View style={[styles.infoBox, { backgroundColor: isDarkMode ? '#323e54' : '#fff' }]}>
            <Text style={[styles.infoLabel, { color: isDarkMode ? '#FFB85A' : '#333' }]}>Tiempo:</Text>
            <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#FFB85A' }]}>
              {convertTime(time)}
            </Text>
          </View>
        </View>
    )}
  </>
) : (
  <>
  
  
  


<Text style={[styles.tripStatus, { color: isDarkMode ? '#FFB85A' : '#000' }]}>
  ÚLTIMO VIAJE REGISTRADO
</Text>

<TouchableOpacity 
  style={[styles.lastTripContainer, { backgroundColor: isDarkMode ? '#323e54' : '#f9f9f9' }]} 
>
  {/* Contenedor principal */}
  <View style={[styles.mainContainer, { backgroundColor: isDarkMode ? '#323e54' : '#fff' }]}>
    
    {/* Botón "Ver Detalles" centrado */}
    <View style={[styles.centeredView, { backgroundColor: isDarkMode ? '#1d2637' : '#e9e9e9' }]}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('Historial')} 
        style={[styles.idContainer, { backgroundColor: isDarkMode ? '#1d2637' : '#e9e9e9' }]}
      >
        <Text style={[styles.infoText, { color: isDarkMode ? '#FFB85A' : '#000' }]}>
          Ver Detalles
        </Text>
      </TouchableOpacity>
    </View>

    {/* Contenedor para el monto cobrado */}
    <View style={[styles.amountWrapper, { backgroundColor: isDarkMode ? '#1d2637' : '#e9e9e9' }]}>
      <Text style={[styles.infoTextvalue, { color: isDarkMode ? '#fff' : '#000' }]}>
        Cobrado: ${parseFloat(price || '0').toFixed(2)}
      </Text>
    </View>

    {/* Contenedor para el monto neto */}
    <View style={[styles.amountWrapper, { backgroundColor: isDarkMode ? '#1d2637' : '#e9e9e9' }]}>
      <Text style={[styles.infoTextvalue, { color: isDarkMode ? '#fff' : '#000' }]}>
        Neto: ${(price - calculateComision() - mantenimientoParcial - calculateCtaHora() - calculateDatosHora() - calculateSeguroHora() - costoGasolina).toFixed(2)}
      </Text>
    </View>

    {/* Contenedor para duración y distancia */}
    <View style={[styles.detailsContainer, { backgroundColor: isDarkMode ? '#1d2637' : '#e9e9e9' }]}>
      <Text style={[styles.infoTextcons, { color: isDarkMode ? '#fff' : '#000' }]}>
        Duración: {convertTime(time)}
      </Text>
      <Text style={[styles.infoTextcons, { color: isDarkMode ? '#fff' : '#000' }]}>
        Distancia: {distance.toFixed(2)} km
      </Text>
    </View>

  </View>
</TouchableOpacity>

<TouchableOpacity
  onPress={startNewTrip}
  style={[
    styles.buttonN,
    { backgroundColor: isDarkMode ? '#FFB85A' : '#FFB85A' },
  ]}
>
  <Text style={[styles.buttonText, { color: isDarkMode ? '#fff' : '#fff' }]}>
    Iniciar Nuevo Viaje
  </Text>
</TouchableOpacity>

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
    elementType: "labels.icon", stylers: [{ visibility: "on" }],
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



centeredView: {
    flexDirection: 'row', // Hacemos que el contenido se apile de forma horizontal
    justifyContent: 'center', // Centrado horizontal
    alignItems: 'center', // Centrado vertical
    marginVertical: 10, // Opcional, para un pequeño espacio vertical
	borderRadius: 10,
	
  },
  
  
 // Estilo general para el contenedor principal
  lastTripContainer: {
    flexDirection: "column",
    width: "100%",
    marginTop: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },

  // Contenedor principal único
  mainContainer: {
    flexDirection: "column",
    justifyContent: "space-between", // Para distribuir el espacio
    marginBottom: 20,
  },

  // Contenedor que agrupa los montos Cobrado y Neto
  amountWrapper: {
  width: "100%",  // Asegura que el contenedor ocupe el ancho completo
  marginBottom: 15,
  padding: 10,
  backgroundColor: "#000", // Fondo blanco para diferenciar
  borderRadius: 10,
  borderWidth: 2,
  borderColor: "#FFB85A", // Borde azul para resaltar
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
},

  // Contenedor para los montos (Cobrado y Neto)
  amountContainer: {
    marginBottom: 0,
	alignItems: "center",
  },

  // Fila para alinear icono y texto
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },

  // Estilo para los contenedores individuales
  idContainer: {
    marginBottom: 5,
	padding: 10,
	borderRadius: 8,
  },

 
  // Contenedor inferior
  bottomContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },

  
  // Botones
  buttonContainer: {
  marginVertical: 10,
  borderRadius: 8,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 4,
},

buttonN: {
  marginVertical: 10,
  borderRadius: 8,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 4,
},
buttonText: {
  color: "#fff", // Texto blanco para mejor contraste
  textAlign: "center",
  paddingVertical: 12,
  fontSize: 16,
  fontWeight: "bold",
  
},

  
  
  
  // Entrada de texto
  input: {
    height: 50,
    borderColor: "#ffb85a",
    borderWidth: 1,
    borderRadius: 20,
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
    padding: 15,
    width: "100%", // Asegura que el contenedor ocupe todo el ancho disponible
    borderRadius: 20,
    elevation: 5,
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
	marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFB85A",
    borderRadius: 10,
    backgroundColor: "#f1f1f1",
  },
  detailsContainer: {
    width: "100%",
    paddingRight: 0,
	textAlign: "center",
	borderRadius: 10,
	
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
    width: "100%", // Ajuste para ocupar el 100% del contenedor
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  
  infoText: {
    fontSize: 20,
    marginBottom: 0,
	
	
  },
  
  infoTextvalue: {
    fontSize: 20,
    marginBottom: 0,
  },
  
  infoTextcons: {
    fontSize: 14,
    marginBottom: 5,
	alignItems: "center",
	textAlign: "center",
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
