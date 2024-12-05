import { React, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native"; // Navegación
import { Ionicons } from '@expo/vector-icons'; // Iconos

const HistorialScreen = () => {
  const [historialViajes, setHistorialViajes] = useState([]);
  const [filtro, setFiltro] = useState('TODO');
  const [expandedDates, setExpandedDates] = useState({}); // Estado para manejar las fechas expandidas
  const navigation = useNavigation(); // Hook para navegar


//Boton borrar historial

  const eliminarHistorial = async () => {
    try {
      await AsyncStorage.removeItem('historialViajes');
      setHistorialViajes([]); // Limpia el estado local también
      console.log('Historial eliminado');
    } catch (error) {
      console.error('Error al eliminar el historial:', error);
    }
  };




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
    ).toFixed(2); // Devuelve el neto con dos decimales
  };

  const organizarPorFecha = (viajes) => {
    const viajesPorFecha = viajes.reduce((grupos, viaje) => {
      const fecha = viaje.endDate ? viaje.endDate.split(' ')[0] : 'Fecha desconocida'; 
      if (!grupos[fecha]) {
        grupos[fecha] = {
          viajes: [],
          netoTotal: 0,
        };
      }
      
      // Calcular el neto para el viaje y agregarlo al neto total de esa fecha
      const netoViaje = calcularNeto(viaje);
      grupos[fecha].viajes.push(viaje);
      grupos[fecha].netoTotal += parseFloat(netoViaje);
      return grupos;
    }, {});

    // Convertir el objeto en un array para poder ordenarlo por fecha
    return Object.keys(viajesPorFecha)
      .sort((a, b) => new Date(b) - new Date(a))
      .map((fecha) => ({
        fecha,
        viajes: viajesPorFecha[fecha].viajes,
        netoTotal: viajesPorFecha[fecha].netoTotal.toFixed(2),
      }));
  };

  const toggleDateVisibility = (fecha) => {
    setExpandedDates((prev) => ({
      ...prev,
      [fecha]: !prev[fecha], // Cambiar la visibilidad de la fecha seleccionada
    }));
  };

  const renderItem = ({ item }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('DetailScreen', { viaje: item })}
  >
    <View style={styles.viajeContainer}>
      <View style={styles.viajeHeader}>
        <Text style={styles.infoTitle}>Viaje ID: {item.id}</Text>
        <Text style={styles.infoDate}>{item.endDate}</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.viajeBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {/* Contenedor izquierdo (60%) */}
          <View style={{ width: '60%' }}>
            <Text style={styles.infoText}>Hora Inicio: {item.horaInicio}</Text>
            <Text style={styles.infoText}>Hora Fin: {item.HoraFin}</Text>
            <Text style={styles.infoText}>Duración: {item.duracion}</Text>
            <Text style={styles.infoText}>Distancia: {item.distancia} km</Text>
            <Text style={styles.montoText}>Monto Cobrado: ${parseFloat(item.montoCobrado).toFixed(2)}</Text>
            <Text style={styles.infoText}>Plataforma: {item.plataforma}</Text>
            <Text style={styles.restaText}>Comisión: ${item.comision}</Text>
            <Text style={styles.infoText}>Costo Mantenimiento: ${item.costoMantenimiento}</Text>
            <Text style={styles.restaText}>Costo Mant./Viaje: ${item.costoMantPorViaje}</Text>
            <Text style={styles.infoText}>Pago Cuenta/Semana: ${item.pagoCuentaSemana}</Text>
            <Text style={styles.restaText}>Costo Cta./Viaje: ${item.costoCtaPorViaje}</Text>
            <Text style={styles.infoText}>Renta Celular: ${item.rentaCelular}</Text>
            <Text style={styles.restaText}>Costo Cel./Viaje: ${item.costoCelPorViaje}</Text>
            <Text style={styles.infoText}>Consumo (L/km): {item.consumo}</Text>
            <Text style={styles.infoText}>Gasolina: {item.precioGasolina}</Text>
            <Text style={styles.restaText}>Costo Gas./Viaje: ${item.costoGasolina}</Text>
			<Text style={styles.infoText}>Seguro: {item.costoSeguro}</Text>
			<Text style={styles.restaText}>Costo Seguro/Viaje: ${item.costoSeguroPorViaje}</Text>
          </View>

          {/* Contenedor derecho (40%) */}
          <View style={{ width: '40%', paddingLeft: 10 }}>
            <Text style={styles.netoText}>Neto:</Text>
            <Text style={styles.netoValue}>${calcularNeto(item)}</Text>
            <Text style={styles.infoText}>Plataforma: {item.plataforma}</Text>
          </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Viajes</Text>
	  
	  
	  
	  {/* Botón para eliminar historial */}
<View style={{ marginBottom: 16 }}>
  <TouchableOpacity
    onPress={eliminarHistorial}
    style={{
      backgroundColor: '#e74c3c',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Eliminar Historial (TODO)</Text>
  </TouchableOpacity>
</View>





      {/* Botones de filtro */}
      <View style={styles.filterContainer}>
        {['TODO', 'UBER', 'INDRIVE', 'LIBRE'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filterButton,
              filtro === tipo && styles.filterButtonActive,
            ]}
            onPress={() => setFiltro(tipo)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filtro === tipo && styles.filterButtonTextActive,
              ]}
            >
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de viajes agrupados por fecha */}
      {organizarPorFecha(filtrarViajes()).length === 0 ? (
        <Text style={styles.noTrips}>No hay viajes registrados.</Text>
      ) : (
        <FlatList
          data={organizarPorFecha(filtrarViajes())}
          renderItem={({ item }) => (
            <View style={styles.fechaContainer}>
              <TouchableOpacity onPress={() => toggleDateVisibility(item.fecha)} style={styles.fechaButton}>
  <Text style={styles.fechaTitle}>
    {item.fecha}      -      Viajes: {item.viajes.length}      -      Neto: ${item.netoTotal}
  </Text>
  <Ionicons
    name={expandedDates[item.fecha] ? 'chevron-up' : 'chevron-down'}
    size={18}
    color="#007bff"
    style={styles.icon}
  />
</TouchableOpacity>

              {expandedDates[item.fecha] && (
                <FlatList
                  data={item.viajes}
                  renderItem={renderItem}
                  keyExtractor={(viaje) => viaje.id}
                  contentContainerStyle={styles.listContainer}
                />
              )}
            </View>
          )}
          keyExtractor={(item) => item.fecha}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  fechaButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  fechaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
	alignItems: 'center',
  },
  icon: {
    marginLeft: 8,
  },
  viajeContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  viajeInfoContainer: {
    marginBottom: 10,
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
  viajeNetContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  noTrips: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  listContainer: {
    marginTop: 10,
  },
});

export default HistorialScreen;
