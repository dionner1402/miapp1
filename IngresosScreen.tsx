import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect  } from "@react-navigation/native"; // Navegación
import { Ionicons } from '@expo/vector-icons'; // Iconos


const IngresosScreen = () => {
  const [historialViajes, setHistorialViajes] = useState([]);
  const [filtro, setFiltro] = useState('TODO');
  const navigation = useNavigation(); // Hook para navegar
  const [mostrarViajes, setMostrarViajes] = useState(false);
  const [totalGastosDia, setTotalGastosDia] = useState<number>(0); // Valor inicial 0
  const [collapsedDates, setCollapsedDates] = useState<{ [key: string]: boolean }>({});
  const [totalesPorFecha, setTotalesPorFecha] = useState([]);



 //calcular totales del dia
 

	useEffect(() => {
	 const loadTotales = async () => {
     const totalesStored = await AsyncStorage.getItem("totalesDiarios");
    if (totalesStored) {
      setTotalesPorFecha(JSON.parse(totalesStored));
      console.log("Totales Cargados:", JSON.parse(totalesStored));  // Verifica los totales cargados
    }
  };
  loadTotales();
}, []);


 // Carga el historial de viajes
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const historialActual = await AsyncStorage.getItem('historialViajes');
        if (historialActual) {
          setHistorialViajes(JSON.parse(historialActual));
        }
      } catch (error) {
        console.error('Error al cargar el historial:', error);
      }
    };
    cargarHistorial();
  }, []);
   

  const filtrarViajes = () => {
    if (filtro === 'TODO') return historialViajes;
    return historialViajes.filter((viaje) => viaje.plataforma === filtro);
  };

  const calcularNeto = (item) => {
    return (
      item.montoCobrado -
      item.comision -
      item.costoMantPorViaje -
      item.costoCtaPorViaje -
      item.costoSeguroPorViaje -
      item.costoCelPorViaje -
      item.costoGasolina
    ).toFixed(2);
  };

  // Función para calcular los totales de los nuevos campos por fecha
  const calcularTotalesPorFecha = (viajes) => {
    return viajes.reduce(
      (totales, viaje) => {
        const neto = calcularNeto(viaje);
        totales.montoCobrado += parseFloat(viaje.montoCobrado);
        totales.kilometraje += parseFloat(viaje.distancia);
        totales.comision += parseFloat(viaje.comision);
        totales.gastosFijos +=
          parseFloat(viaje.costoMantPorViaje) +
          parseFloat(viaje.costoCtaPorViaje) +
          parseFloat(viaje.costoCelPorViaje) +
          parseFloat(viaje.costoGasolina);
        totales.neto += parseFloat(neto);
        totales.duracionTotal += convertirDuracionAMinutos(viaje.duracion);
        return totales;
      },
      {
        montoCobrado: 0,
        kilometraje: 0,
        comision: 0,
        gastosFijos: 0,
        neto: 0,
        duracionTotal: 0,
      }
    );
  };

// Función para calcular el costo por kilómetro
const calcularCostoPorKm = (totales) => {
  return totales.kilometraje ? (totales.neto / totales.kilometraje).toFixed(2) : '0.00'; // Evitar división por cero y formato correcto
};

// Convertir duración (en minutos)
const convertirDuracionAMinutos = (duracion) => {
  const regex = /(\d+)\s*(h|m|min|seg)/g;  // Expresión regular para horas, minutos y segundos
  let minutos = 0;
  
  let match;
  while ((match = regex.exec(duracion)) !== null) {
    const [ , valor, unidad ] = match;
    const cantidad = parseInt(valor);
    
    if (unidad === 'h') minutos += cantidad * 60;  // Convierte horas a minutos
    else if (unidad === 'm' || unidad === 'min') minutos += cantidad;
    else if (unidad === 'seg') minutos += Math.floor(cantidad / 60);  // Convierte segundos a minutos
  }
  
  return minutos;
};


// Función para organizar los viajes por fecha (incluyendo los gastos del día)
const organizarPorFecha = (viajes) => {
  const viajesPorFecha = viajes.reduce((grupos, viaje) => {
    const fecha = viaje.endDate ? viaje.endDate.split(' ')[0] : 'Fecha desconocida';
    if (!grupos[fecha]) {
      grupos[fecha] = {
        viajes: [],
        totalGastosDia: 0,  // Aquí almacenamos el total de los gastos del día
      };
    }
    grupos[fecha].viajes.push(viaje);
    return grupos;
  }, {});
	

  return Object.keys(viajesPorFecha)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((fecha) => ({
      fecha,
      viajes: viajesPorFecha[fecha].viajes,
      totales: calcularTotalesPorFecha(viajesPorFecha[fecha].viajes),
      totalGastosDia: viajesPorFecha[fecha].totalGastosDia, // Mostrar el total de los gastos del día
    }));
};

  const renderItem = ({ item }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('DetailScreen', { viaje: item })}
  >
    {/* Solo mostrar el viaje si mostrarViajes es true */}
    {mostrarViajes && (
      <View style={styles.viajeContainer}>
        <View style={styles.viajeHeader}>
          <Text style={styles.infoTitle}>Viaje ID: {item?.id}</Text>
          <Text style={styles.infoDate}>{item?.endDate}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.viajeBody}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {/* Contenedor izquierdo (60%) */}
            <View style={{ width: '60%' }}>
              <Text style={styles.infoText}>Hora Inicio: {item?.horaInicio}</Text>
              <Text style={styles.infoText}>Hora Fin: {item?.HoraFin}</Text>
              <Text style={styles.infoText}>Duración: {item?.duracion}</Text>
              <Text style={styles.infoText}>Distancia: {item?.distancia} km</Text>
              <Text style={styles.montoText}>Monto Cobrado: ${parseFloat(item?.montoCobrado || '0').toFixed(2)}</Text>
              <Text style={styles.infoText}>Plataforma: {item?.plataforma}</Text>
              <Text style={styles.restaText}>Comisión: ${item?.comision}</Text>
              <Text style={styles.infoText}>Costo Mantenimiento: ${item?.costoMantenimiento}</Text>
              <Text style={styles.restaText}>Costo Mant./Viaje: ${item?.costoMantPorViaje}</Text>
              <Text style={styles.infoText}>Pago Cuenta/Semana: ${item?.pagoCuentaSemana}</Text>
              <Text style={styles.restaText}>Costo Cta./Viaje: ${item?.costoCtaPorViaje}</Text>
              <Text style={styles.infoText}>Renta Celular: ${item?.rentaCelular}</Text>
              <Text style={styles.restaText}>Costo Cel./Viaje: ${item?.costoCelPorViaje}</Text>
              <Text style={styles.infoText}>Consumo (L/km): {item?.consumo}</Text>
              <Text style={styles.infoText}>Gasolina: {item?.precioGasolina}</Text>
              <Text style={styles.restaText}>Costo Gas./Viaje: ${item?.costoGasolina}</Text>
              <Text style={styles.infoText}>Seguro: {item?.costoSeguro}</Text>
              <Text style={styles.restaText}>Costo Seguro/Viaje: ${item?.costoSeguroPorViaje}</Text>
			  <Text style={styles.restaText}>Costo Seguro/Viaje: ${item?.costoSeguroPorViaje}</Text>
            </View>

            {/* Contenedor derecho (40%) */}
            <View style={{ width: '40%', paddingLeft: 10 }}>
              <Text style={styles.netoText}>Neto:</Text>
              <Text style={styles.netoValue}>${calcularNeto(item)}</Text>
              <Text style={styles.infoText}>Plataforma: {item?.plataforma}</Text>
            </View>
          </View>
        </View>
      </View>
    )}
  </TouchableOpacity>
);



 return (
  <View style={styles.container}>
    <Text style={styles.title}>Ingresos</Text>

    {organizarPorFecha(filtrarViajes()).length === 0 ? (
      <Text style={styles.noTrips}>No hay viajes registrados.</Text>
    ) : (
      <FlatList
        data={organizarPorFecha(filtrarViajes())}
        renderItem={({ item }) => {
          // Buscar el total de gastos para la fecha de este item
          const totalGastosDia = totalesPorFecha.find(
            (total) => total.fecha === item.fecha
          )?.total || 0;

          return (
      <View style={styles.fechaContainer}>
        <Text style={styles.fechaTitle}>
          {item.fecha} - Viajes: {item.viajes.length} - Neto: ${item.totales.neto.toFixed(2)}
        </Text>

              {/* Contenedor de totales */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Monto Cobrado: ${item.totales.montoCobrado.toFixed(2)}</Text>
				<Text style={styles.summaryText}>Comisión: ${item.totales.comision.toFixed(2)}</Text>                
				<Text style={styles.summaryText}>Kilometraje: {item.totales.kilometraje.toFixed(2)} km</Text>
                <Text style={styles.summaryText}>Costo por Km: ${calcularCostoPorKm(item.totales)}</Text>
                <Text style={styles.summaryText}>Gastos Fijos: ${item.totales.gastosFijos.toFixed(2)}</Text>
                <Text style={styles.summaryText}>Tiempo Total: {Math.floor(item.totales.duracionTotal / 60)}h {item.totales.duracionTotal % 60}m</Text>
				<Text style={styles.summaryText}>Gastos del Día: ${totalesPorFecha.find(total => total.fecha === item.fecha)?.total || 0}</Text>              
				</View>

              {/* Lista de Detalles del Viaje */}
              <FlatList
                data={item.viajes}
                renderItem={renderItem}
                keyExtractor={(viaje) => viaje.id}
                initialNumToRender={10}
                maxToRenderPerBatch={20}
                contentContainerStyle={styles.listContainer}
              />
            </View>
          );
        }}
        keyExtractor={(item) => item.fecha}
      />
    )}
  </View>
);

};


const styles = StyleSheet.create({


newContainer: {
    marginTop: 10,
	marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  newContainerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newContainerValue: {
    fontSize: 14,
    color: '#555',
  },
  
  
  
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#555',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fechaContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',  // Fondo blanco
    borderRadius: 10,  // Bordes redondeados
    shadowColor: '#000',  // Sombra para dar profundidad
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,  // Baja opacidad para la sombra
    shadowRadius: 8,  // Radio de la sombra
    elevation: 3,  // Sombra para Android
  },
  fechaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',  // Fondo gris claro
    borderRadius: 8,  // Bordes redondeados
    shadowColor: '#000',  // Sombra suave
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,  // Sombra para Android
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  listContainer: {
    marginTop: 10,
  },
  noTrips: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  // Contenedores para los viajes
  viajeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  viajeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoDate: {
    fontSize: 14,
    color: '#888',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  viajeBody: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  montoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  restaText: {
    fontSize: 14,
    color: '#e74c3c',
  },
  netoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  netoValue: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
  },
});


export default IngresosScreen;