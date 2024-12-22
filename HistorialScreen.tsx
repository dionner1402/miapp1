import React, { useState, useEffect, useCallback, } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect, } from "@react-navigation/native"; // Navegación
import { Ionicons } from '@expo/vector-icons'; // Iconos
import { useTheme } from "../context/ThemeContext";
import { format, isSameDay, isSameWeek, isSameMonth, parse, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
import moment from 'moment';
import { es } from 'date-fns/locale';
import { groupBy } from 'lodash'; // Importa la función groupBy de lodash

const HistorialScreen = () => {
  const [historialViajes, setHistorialViajes] = useState([]);
  const [filtro, setFiltro] = useState('TODO');
  const [expandedDates, setExpandedDates] = useState({}); // Estado para manejar las fechas expandidas
  const navigation = useNavigation(); // Hook para navegar
  const { isDarkMode } = useTheme(); // Obtener el estado del modo oscuro
	const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
	const [filtroFecha, setFiltroFecha] = useState('s'); // Definir el estado para el filtro de fecha
	const [collapsedGroups, setCollapsedGroups] = useState({});
	

 // Configurar la barra superior según el modo claro/oscuro
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: isDarkMode ? '#1d2637' : '#fff', // Cambia el fondo de la barra superior
      },
      headerTintColor: isDarkMode ? '#fff' : '#333', // Cambia el color del texto de la barra superior
    });
  }, [navigation, isDarkMode]);


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

    // Función para cargar historial desde AsyncStorage
  const cargarHistorial = async () => {
    try {
      const historialActual = await AsyncStorage.getItem('historialViajes');
      if (historialActual) {
        setHistorialViajes(JSON.parse(historialActual));
      } else {
        setHistorialViajes([]); // Si no hay historial, asegura que sea un array vacío
      }
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    }
  };

  // Recargar historial cada vez que la pantalla esté en foco
  useFocusEffect(
    React.useCallback(() => {
      cargarHistorial(); // Cargar historial cuando la pantalla recibe el foco
    }, []) // Se ejecuta cada vez que la pantalla recibe el foco
  );



const filtrarViajes = () => {
  if (filtro === 'TODO') return historialViajes;
  return historialViajes.filter((viaje) => viaje.plataforma === filtro);
};

const calcularNeto = (item) => {
  // Asegúrate de que los valores sean números antes de hacer el cálculo
  const montoCobrado = parseFloat(item.montoCobrado) || 0;
  const comision = parseFloat(item.comision) || 0;
  const costoMantPorViaje = parseFloat(item.costoMantPorViaje) || 0;
  const costoCtaPorViaje = parseFloat(item.costoCtaPorViaje) || 0;
  const costoSeguroPorViaje = parseFloat(item.costoSeguroPorViaje) || 0;
  const costoCelPorViaje = parseFloat(item.costoCelPorViaje) || 0;
  const costoGasolina = parseFloat(item.costoGasolina) || 0;

  return (
    montoCobrado -
    comision -
    costoMantPorViaje -
    costoCtaPorViaje -
    costoSeguroPorViaje -
    costoCelPorViaje -
    costoGasolina
  ).toFixed(2); // Devuelve el neto con dos decimales
};

// Función para obtener el número de la semana de una fecha
const organizarPorFecha = (viajes) => {
  const getWeekNumber = (date) => {
    const d = new Date(date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
  };

  const viajesPorFecha = viajes.reduce((grupos, viaje) => {
    const fecha = viaje.endDate ? viaje.endDate.split(' ')[0] : 'Fecha desconocida';
    const semana = getWeekNumber(new Date(fecha)); // Aseguramos que se convierta en un objeto Date
    if (!grupos[fecha]) {
      grupos[fecha] = {
        viajes: [],
        netoTotal: 0,
        semana,
      };
    }
      // Calcular el neto para el viaje y agregarlo al neto total de esa fecha
      const netoViaje = calcularNeto(viaje); // Asegúrate de que calcularNeto esté funcionando correctamente
    grupos[fecha].viajes.push(viaje);
    grupos[fecha].netoTotal += parseFloat(netoViaje);
    return grupos;
  }, {});

    // Calcular viajes por semana
    const agrupadoPorSemana = {};
  Object.keys(viajesPorFecha).forEach((fecha) => {
    const { semana, viajes } = viajesPorFecha[fecha];
    if (!agrupadoPorSemana[semana]) {
      agrupadoPorSemana[semana] = {
        viajes: 0,
        netoTotalSemana: 0,
      };
    }
    agrupadoPorSemana[semana].viajes += viajes.length;
    agrupadoPorSemana[semana].netoTotalSemana += viajesPorFecha[fecha].netoTotal;
  });

    // Convertir a un array ordenado por fecha
   return Object.keys(viajesPorFecha)
    .sort((a, b) => new Date(b) - new Date(a))
    .map((fecha) => {
      const { semana, viajes, netoTotal } = viajesPorFecha[fecha];
      return {
        fecha,
        viajes,
        netoTotal: netoTotal.toFixed(2),
        viajesPorSemana: agrupadoPorSemana[semana].viajes,
        netoTotalSemana: agrupadoPorSemana[semana].netoTotalSemana.toFixed(2),
      };
    });
};

// Función para alternar la visibilidad de la fecha seleccionada
  const toggleDateVisibility = (fecha) => {
  setExpandedDates((prev) => ({
    ...prev,
    [fecha]: !prev[fecha],
  }));
};
  
  
 
 

  // Renderizado de cada item en la lista
  const renderItem = ({ item }) => (
  <TouchableOpacity onPress={() => navigation.navigate('DetailScreen', { viaje: item })}>
    <View style={[styles.viajeContainer, { backgroundColor: isDarkMode ? '#FFB85A' : '#fff' }]}>
      {/* Encabezado */}
      <View style={styles.viajeHeader}>
        <Text style={[styles.infoTitle, { color: isDarkMode ? '#1d2637' : '#333' }]}>
          <Text style={[styles.valorGrande, { color: isDarkMode ? '#1d2637' : '#28a745' }]}>
            {item.id}
          </Text>
        </Text>
        <Text style={[styles.infoDate, { color: isDarkMode ? '#1d2637' : '#888' }]}>
          Fecha: <Text style={styles.valorGrande}>{item.endDate}</Text>
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: isDarkMode ? '#1d2637' : '#ddd' }]} />

      {/* Cuerpo */}
      <View style={styles.viajeBody}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ width: '45%', alignItems: 'center' }}>
            <Text style={[styles.infoSmall, { color: isDarkMode ? '#fff' : '#555' }]}>Monto Cobrado:</Text>
            <Text style={[styles.montoText, { color: isDarkMode ? '#1d2637' : '#28a745' }]}>
              ${parseFloat(item.montoCobrado).toFixed(2)}
            </Text>
          </View>

          <View style={{ width: '45%', alignItems: 'center' }}>
            <Text style={[styles.infoSmall, { color: isDarkMode ? '#fff' : '#555' }]}>Neto:</Text>
            <Text style={[styles.netoValue, { color: isDarkMode ? '#1d2637' : '#28a745' }]}>
              ${calcularNeto(item)}
            </Text>
 </View>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);



 // Función para formatear la fecha según el filtro
const obtenerTituloFiltro = () => {
  switch (filtroFecha) {
    case 'dia':
      return ` ${format(new Date(), 'dd/MM/yyyy')} `; // Formato de día
    case 'semana':
      const inicioSemana = startOfWeek(new Date(), { weekStartsOn: 1 }); // Lunes como inicio de semana
      const finSemana = endOfWeek(new Date(), { weekStartsOn: 1 });

      return ` ${format(inicioSemana, 'dd/MM/yyyy')} - ${format(finSemana, 'dd/MM/yyyy')} `; // Formato de semana
    case 'mes':
      return ` ${format(new Date(), 'MMMM yyyy')} `; // Formato de mes
    default:
      return '';
  }
};



// Función para agrupar viajes por fecha (formato: dd/MM/yyyy)
const agruparPorFecha = (viajes) => {
  return viajes.reduce((acc, viaje) => {
    const fechaFormateada = format(parse(viaje.endDate, 'dd/MM/yyyy', new Date()), 'dd/MM/yyyy'); // Formato de la fecha

    // Si no existe el grupo de esta fecha, lo creamos
    if (!acc[fechaFormateada]) {
      acc[fechaFormateada] = [];
    }

    // Agregar el viaje al grupo correspondiente
    acc[fechaFormateada].push(viaje);

    return acc;
  }, {});
};



// Función para filtrar los viajes según la fecha
	const filtrarPorFecha = (viajes) => {
  return viajes.filter((viaje) => {
    const fechaViaje = parse(viaje.endDate, 'dd/MM/yyyy', new Date()); // Parsear la fecha del viaje
    const today = new Date();

    switch (filtroFecha) {
      case 'dia':
        // Comparar solo las fechas (sin hora)
        return fechaViaje.toDateString() === today.toDateString(); // Filtro por día
      case 'semana':
        const inicioSemana = startOfWeek(today, { weekStartsOn: 1 });
        const finSemana = endOfWeek(today, { weekStartsOn: 1 });
        return fechaViaje >= inicioSemana && fechaViaje <= finSemana; // Filtro por semana
      case 'mes':
        // Filtro por mes
        return fechaViaje.getMonth() === today.getMonth() && fechaViaje.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });
};


// Renderizado de cada grupo de viajes por fecha
const renderGroup = (fecha, viajesDelDia, index) => {
  const cantidadViajes = viajesDelDia.length; // Contar la cantidad de viajes en el grupo

  // Sumar todos los montos cobrados
  const sumaMontos = viajesDelDia.reduce((total, viaje) => total + parseFloat(viaje.montoCobrado || 0), 0);

  // Sumar todos los montos netos (asegurarse de que calcularNeto devuelve un número)
  const sumaNetos = viajesDelDia.reduce((total, viaje) => total + (isNaN(calcularNeto(viaje)) ? 0 : parseFloat(calcularNeto(viaje))), 0);

  // Sumar las distancias totales
  const kTotales = viajesDelDia.reduce((total, viaje) => total + parseFloat(viaje.distancia || 0), 0);

  // Sumar las duraciones totales
  const tTotales = viajesDelDia.reduce((total, viaje) => total + parseFloat(viaje.duracion || 0), 0);
  
  

  // Función para mostrar '+0' en lugar de '0' y asegurarse de que el valor sea un número
  const formatoSuma = (valor) => {
  if (isNaN(valor)) {
    valor = 0; // Si el valor es NaN, asignamos 0
  }
  const valorFormateado = valor.toFixed(2); // Aseguramos que es un número válido antes de llamar a toFixed()
  return valor === 0 ? `+${valorFormateado}` : valorFormateado;
};

// Sumar los netos
const ntTotal = formatoSuma(sumaNetos);

const toggleCollapse = (groupIndex) => {
  setCollapsedGroups((prevState) => ({
    ...prevState,
    [groupIndex]: !prevState[groupIndex], // Alterna el estado de colapso para el grupo específico
  }));
};

const isCollapsed = collapsedGroups[index]; // Determina si el grupo está colapsado

return (
  <View key={index} style={[styles.groupContainer, isDarkMode && styles.darkGroupContainer]}>
    {/* Contenedor con elevación para la barra */}
    <TouchableOpacity
      style={[
        styles.headerContainer,
        {
          backgroundColor: isDarkMode ? '#323e54' : '#f1f1f1',
          elevation: 5, // Sombra en Android
          shadowColor: '#000', // Sombra en iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
      ]}
      onPress={() => toggleCollapse(index)} // Cambia el estado de colapso solo para este grupo
    >
      <View style={styles.dateAndTrips}>
        <Text style={[styles.dateText, isDarkMode && styles.darkText]}>
          {fecha}
        </Text>
        <Text style={[styles.tripCount, isDarkMode && styles.darkText]}>
          ({cantidadViajes} {cantidadViajes === 1 ? 'viaje' : 'viajes'})
        </Text>
      </View>
      <View style={styles.amountsContainer}>
        <Text style={[styles.amountText, styles.boldText, isDarkMode && styles.darkText]}>
          Cobrado: ${formatoSuma(sumaMontos)}
        </Text>
        <Text style={[styles.amountText, styles.boldText, isDarkMode && styles.darkText]}>
          Neto total: ${ntTotal}
        </Text>
      </View>

      {/* Ícono de flecha indicando si la lista está colapsada o expandida */}
      <Ionicons
        name={isCollapsed ? 'chevron-down' : 'chevron-up'} // Cambia el ícono según el estado
        size={24}
        color={isDarkMode ? '#FFF' : '#000'} // Asegura que el ícono sea visible según el modo
        style={styles.arrowIcon} // Agrega estilo si es necesario
      />
    </TouchableOpacity>

    {/* Lista de viajes, solo se renderiza si no está colapsada */}
    {!isCollapsed && (
      <FlatList
        data={viajesDelDia}
        renderItem={({ item }) => renderItem({ item })}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    )}
  </View>
);

// Componente principal envuelto en un contenedor único
return (
  <>
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1d2637' : '#f9f9f9' }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#333' }]}>Historial de Viajes</Text>

      {/* Filtro por plataforma */}
      <View style={styles.filterContainer}>
        {['TODO', 'UBER', 'INDRIVE', 'LIBRE'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filterButton,
              filtro === tipo && styles.filterButtonActive, // Aplica un estilo cuando está activo
              { backgroundColor: filtro === tipo ? (isDarkMode ? '#FF8C42' : '#d8d8d8') : (isDarkMode ? '#FFB85A' : '#e3e3e3') }, // Color de fondo según si está seleccionado
            ]}
            onPress={() => setFiltro(tipo)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filtro === tipo && styles.filterButtonTextActive, // Aplica un estilo al texto cuando está activo
                { color: filtro === tipo ? (isDarkMode ? '#1d2637' : '#333') : (isDarkMode ? '#1d2637' : '#333') }, // Color del texto si está activo o no
              ]}
            >
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de viajes agrupados por fecha */}
      <FlatList
        data={filtroFecha === 'semana' ? Object.keys(agruparPorFecha(filtrarViajes())) : filtrarPorFecha(filtrarViajes())}
        renderItem={({ item, index }) => {
          if (filtroFecha === 'semana') {
            // Si es "semana", renderizamos los grupos
            const viajesDelDia = agruparPorFecha(filtrarViajes())[item];
            return renderGroup(item, viajesDelDia, index);
          } else {
            // Si no estamos agrupando, simplemente renderizamos el item
            return renderItem({ item });
          }
        }}
        keyExtractor={(item, index) => index.toString()} // Usa el índice como clave para cada grupo o viaje
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>

    {/* Filtros de fecha */}
    <View style={styles.filterContainer}>
      {['semana'].map((filtroItem) => (
        <TouchableOpacity
          key={filtroItem}
          style={[
            styles.filterButton,
            filtroFecha === filtroItem && styles.filterButtonActive,
            { backgroundColor: isDarkMode ? '#323e54' : '#e3e3e3' },
          ]}
          onPress={() => setFiltroFecha(filtroItem)} // Cambiar filtro de fecha
        >
          <Text
            style={[
              styles.filterButtonText,
              filtroFecha === filtroItem && styles.filterButtonTextActive,
              { color: isDarkMode ? '#FFB85A' : '#333' },
            ]}
          >
            {filtroItem === 'dia' ? 'Día' : filtroItem === 'semana' ? 'Viajes' : 'Mes'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Lista de viajes agrupados por fecha */}
    <FlatList
      data={filtroFecha === 'semana' ? Object.keys(agruparPorFecha(filtrarViajes())) : filtrarPorFecha(filtrarViajes())}
      renderItem={({ item, index }) => {
        if (filtroFecha === 'semana') {
          // Si es "semana", renderizamos los grupos
          const viajesDelDia = agruparPorFecha(filtrarViajes())[item];
          return renderGroup(item, viajesDelDia, index);
        } else {
          // Si no estamos agrupando, simplemente renderizamos el item
          return renderItem({ item });
        }
      }}
      keyExtractor={(item, index) => index.toString()} // Usa el índice como clave para cada grupo o viaje
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  </>
);
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  fechaContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
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
    marginBottom: 0,
	marginTop: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    padding: 10,
    borderRadius: 10,
  },
  viajeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    maxWidth: '50%',
  },
  infoDate: {
    fontSize: 10,
    fontWeight: '400',
    color: '#888',
    maxWidth: '50%',
    textAlign: 'right',
  },
  separator: {
    height: 3,
    backgroundColor: '#ddd',
    marginVertical: 3,
  },
  viajeBody: {
    marginTop: 10,
    paddingTop: 5,
  },
  viajeInfoContainer: {
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
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
  
  noTrips: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
  },
  listContainer: {
    marginTop: 10,
  },
  infoSmall: {
    fontSize: 12,
    fontWeight: '400',
	marginTop: -15,
  },
  valorGrande: {
    fontSize: 12,
    fontWeight: '600',
  },
  netoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
  },
  montoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
  },
  
  
  //barra
  groupContainer: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#00ffff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  darkGroupContainer: {
    backgroundColor: '#323e54', //contenedor del contenedor
  },
  headerContainer: {
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
	borderRadius: 8,
    padding: 12,
   
  },
  dateAndTrips: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tripCount: {
    fontSize: 14,
    color: '#666',
  },
  amountsContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  listContainer: {
    marginTop: 8,
  },
});


export default HistorialScreen;
