import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DetailScreen = ({ route }) => {
  const { viaje } = route.params;



// Validación y cálculo seguro del neto
  const neto =
    parseFloat(viaje?.montoCobrado || 0) -
    parseFloat(viaje?.comision || 0) -
    parseFloat(viaje?.costoGasolina || 0) -
    parseFloat(viaje?.costoMantPorViaje || 0) -
    parseFloat(viaje?.costoCtaPorViaje || 0) -
    parseFloat(viaje?.costoCelPorViaje || 0) -
    parseFloat(viaje?.costoSeguroPorViaje || 0);
	
	
	
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen del Viaje</Text>
     

	 {/* ScrollView para hacer desplazable el contenido */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.receiptContainer}>
          <View style={styles.section}>
           

		   <Text style={styles.sectionTitle}>Información General</Text>
            <Text style={styles.infoText}>Viaje ID: {viaje.id}</Text>
            <Text style={styles.infoText}>Plataforma: {viaje.plataforma}</Text>
            <Text style={styles.infoText}>Fecha: {viaje.endDate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiempo y Distancia</Text>
            <Text style={styles.infoText}>Hora Inicio: {viaje.horaInicio}</Text>
            <Text style={styles.infoText}>Hora Fin: {viaje.HoraFin}</Text>
            <Text style={styles.infoText}>Duración: {viaje.duracion}</Text>
            <Text style={styles.infoText}>Distancia: {viaje.distancia} km</Text>
          </View>
		  
		  
			//Costos

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Costos</Text>
            <Text style={styles.montoText}>
              Monto Cobrado: ${parseFloat(viaje.montoCobrado).toFixed(2)}
            </Text>
            <Text style={styles.restaText}>Comisión: -${viaje.comision}</Text>
            <Text style={styles.restaText}>
              Costo Gasolina: -${viaje.costoGasolina}
            </Text>
            <Text style={styles.restaText}>
              Costo Mant./Viaje: -${viaje.costoMantPorViaje}
            </Text>
			<Text style={styles.restaText}>
              Costo Cuenta: -${viaje.costoCtaPorViaje}
            </Text>
            <Text style={styles.restaText}>
              Costo Cel./Viaje: -${viaje.costoCelPorViaje}
            </Text>
            <Text style={styles.restaText}>
              Costo Seguro/Viaje: -${viaje.costoSeguroPorViaje}
            </Text>
			
			
			<Text style={styles.netoText}>Neto: ${neto.toFixed(2)}</Text>
            
			
			
          </View>


			//Otros Detalles

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Otros Detalles</Text>
            
			
			<Text style={styles.infoText}>
              Precio Gasolina: ${viaje.precioGasolina}
            </Text>
			<Text style={styles.infoText}>
              Consumo (L/km): {viaje.consumo}
            </Text>
            
            <Text style={styles.infoText}>
              Costo Mantenimiento: ${viaje.costoMantenimiento}
            </Text>
			
			<Text style={styles.infoText}>
              Pago Cuenta: ${viaje.pagoCuentaSemana}
            </Text>
			
            <Text style={styles.infoText}>
              Renta Celular: ${viaje.rentaCelular}
            </Text>
            <Text style={styles.infoText}>
              Costo Seguro: ${viaje.costoSeguro}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  scrollContent: {
    flexGrow: 1,
  },
  receiptContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  restaText: {
    fontSize: 16,
    color: '#ff4d4d',
    marginBottom: 4,
  },
  montoText: {
  fontWeight: 'bold',
    fontSize: 26,
    color: '#008000', // Texto verde
    marginBottom: 8,
	textAlign: 'center',
  },
  netoText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#008000', // Verde para resaltar
    marginTop: 8,
	textAlign: 'center',
  },
});

export default DetailScreen;
