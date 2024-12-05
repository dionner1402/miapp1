import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TextInput, SectionList, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const GastosScreen = () => {
  const [gastosFijos, setGastosFijos] = useState({ mantenimiento: "", cuenta: "", rentaCelular: "" });
  const [gastoDiario, setGastoDiario] = useState({ descripcion: "", monto: "" });
  const [gastosDiarios, setGastosDiarios] = useState([]);
  const [vehiculo, setVehiculo] = useState<any>({});
  const navigation = useNavigation();
  const [isGastosFijosVisible, setIsGastosFijosVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  
  
  
  

  // Cargar los datos de "Vehículo" y totales al inicio
  useEffect(() => {
    const loadData = async () => {
      const gastosFijosStored = await AsyncStorage.getItem("gastosFijos");
      const gastosDiariosStored = await AsyncStorage.getItem("gastosDiarios");
      const vehiculoStored = await AsyncStorage.getItem("vehiculo");
      const totalesStored = await AsyncStorage.getItem("totalesDiarios");

      if (gastosFijosStored) setGastosFijos(JSON.parse(gastosFijosStored));
      if (gastosDiariosStored) setGastosDiarios(JSON.parse(gastosDiariosStored));
      if (vehiculoStored) setVehiculo(JSON.parse(vehiculoStored));
      if (totalesStored) {
        setTotalesPorFecha(JSON.parse(totalesStored));
      } else {
        console.log("No hay totales almacenados.");
      }
    };
    loadData();
  }, []);

  const agregarGastoDiario = async () => {
    if (!gastoDiario.descripcion || !gastoDiario.monto) {
      Alert.alert("Error", "Debe completar tanto la descripción como el monto del gasto.");
      return;
    }

    const nuevoGasto = { ...gastoDiario, fecha: new Date().toISOString() };
    const updatedGastosDiarios = [...gastosDiarios, nuevoGasto];
    setGastosDiarios(updatedGastosDiarios);
    setGastoDiario({ descripcion: "", monto: "" });

    try {
      await AsyncStorage.setItem("gastosDiarios", JSON.stringify(updatedGastosDiarios));
      console.log("Gasto Diario Guardado:", nuevoGasto);

      // Guarda los totales actualizados
      guardarTotalesPorFecha(updatedGastosDiarios);
    } catch (error) {
      console.error("Error al guardar el gasto diario:", error);
    }
  };

  const eliminarGastoDiario = (index) => {
    Alert.alert("Confirmar eliminación", "¿Estás seguro de que deseas eliminar este gasto?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        onPress: async () => {
          const updatedGastosDiarios = gastosDiarios.filter((_, i) => i !== index);
          setGastosDiarios(updatedGastosDiarios);
          await AsyncStorage.setItem("gastosDiarios", JSON.stringify(updatedGastosDiarios));
          guardarTotalesPorFecha(updatedGastosDiarios); // Actualizar los totales al eliminar un gasto
        },
      },
    ]);
  };

  // Agrupar y ordenar los gastos por fecha de más reciente a más antiguo
const gastosAgrupadosPorFecha = gastosDiarios
  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  .reduce((result, gasto) => {
    // Cambiar el formato de la fecha a 'DD/MM/YYYY'
    const fecha = new Date(gasto.fecha).toLocaleDateString("es-ES", {
      day: "2-digit",   // Día con 2 dígitos
      month: "2-digit", // Mes con 2 dígitos
      year: "numeric",  // Año con 4 dígitos
    });

    if (!result[fecha]) {
      result[fecha] = [];
    }
    result[fecha].push(gasto);
    return result;
  }, {});

const secciones = Object.keys(gastosAgrupadosPorFecha).map((fecha) => ({
  title: fecha,
  data: gastosAgrupadosPorFecha[fecha],
}));

  // Calcular el total de los gastos del día
  const calcularTotalGastos = (sectionData) => {
    return sectionData.reduce((total, gasto) => total + parseFloat(gasto.monto), 0).toFixed(2);
  };

  const [totalesPorFecha, setTotalesPorFecha] = useState([]);

  // Actualizar y guardar los totales en AsyncStorage
  const guardarTotalesPorFecha = async (gastosActualizados) => {
  const gastosAgrupados = gastosActualizados
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .reduce((result, gasto) => {
      const fecha = new Date(gasto.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",   // Día con 2 dígitos
        month: "2-digit", // Mes con 2 dígitos
        year: "numeric",  // Año con 4 dígitos
      });
      
      if (!result[fecha]) {
        result[fecha] = [];
      }
      result[fecha].push(gasto);
      return result;
    }, {});

  const totales = Object.keys(gastosAgrupados).map((fecha) => {
    const total = calcularTotalGastos(gastosAgrupados[fecha]);
    return { fecha, total };
  });

  setTotalesPorFecha(totales);
  console.log("Totales Calculados:", totales);

  try {
    await AsyncStorage.setItem("totalesDiarios", JSON.stringify(totales));
    console.log("Totales Guardados Correctamente:", totales);
  } catch (error) {
    console.error("Error al guardar los totales:", error);
  }
};


  const toggleSectionVisibility = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  return (
    <View style={styles.container}>
      {/* Gastos Fijos */}
<View style={styles.gastosFijosContainer}>
  <TouchableOpacity onPress={() => setIsGastosFijosVisible(!isGastosFijosVisible)}>
    <View style={styles.gastosFijosHeader}>
      <Text style={styles.title}>Detalles de Gastos Fijos</Text>
      <FontAwesome name={isGastosFijosVisible ? "caret-up" : "caret-down"} size={20} color="#007BFF" />
    </View>
  </TouchableOpacity>

  {isGastosFijosVisible && (
    <View style={styles.gastosFijosDetails}>
      {/* Costo Mantenimiento */}
      <View style={styles.gastoItem}>
        <FontAwesome name="car" size={20} color="#28a745" />
        {vehiculo.costoMantenimiento ? (
          <Text style={styles.text}>
            <Text style={styles.boldText}>    Costo Mant. 5000km:        ---          </Text>${vehiculo.costoMantenimiento}
          </Text>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Costo Mant. 5000km"
            keyboardType="numeric"
            onChangeText={(text) => setGastosFijos({ ...gastosFijos, mantenimiento: text })}
            value={gastosFijos.mantenimiento}
          />
        )}
      </View>

      <View style={styles.separator} />
      {/* Paga Cuenta/Letra */}
      <View style={styles.gastoItem}>
        <FontAwesome name="usd" size={20} color="#28a745" />
        <Text style={styles.text}>
          <Text style={styles.boldText}>   Cta./Letra Semana:</Text> {vehiculo.pagaCuenta ? "" : "NO"}
        </Text>

        {vehiculo.pagaCuenta && (
          <Text style={styles.text}>
            <Text style={styles.boldText}>             ---         </Text> ${vehiculo.montoCuenta}
          </Text>
        )}
      </View>

      <View style={styles.separator} />
      {/* Costo Seguro */}
      <View style={styles.gastoItem}>
        <FontAwesome name="shield" size={20} color="#28a745" />
        {vehiculo.costoSeguro ? (
          <Text style={styles.text}>
            <Text style={styles.boldText}>    Seguro/Semana:                   ---          </Text>${vehiculo.costoSeguro}
          </Text>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Pago Seguro por Semana"
            keyboardType="numeric"
            onChangeText={(text) => setGastosFijos({ ...gastosFijos, seguro: text })}
            value={gastosFijos.seguro}
          />
        )}
      </View>

      <View style={styles.separator} />
      {/* Renta Celular */}
      <View style={styles.gastoItem}>
        <FontAwesome name="mobile" size={20} color="#28a745" />
        {vehiculo.rentaCelular ? (
          <Text style={styles.text}>
            <Text style={styles.boldText}>    Renta Cel./Semana:               ---          </Text>${vehiculo.rentaCelular}
          </Text>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Pago Cel por Semana"
            keyboardType="numeric"
            onChangeText={(text) => setGastosFijos({ ...gastosFijos, celular: text })}
            value={gastosFijos.celular}
          />
        )}
      </View>
    </View>
  )}
</View>

      {/* Gastos del Día */}
      <Text style={styles.title}>Gastos del Día</Text>
      <View style={styles.gastosContainer}>
        <TextInput
          style={styles.input}
          placeholder="Descripción del Gasto"
          onChangeText={(text) => setGastoDiario({ ...gastoDiario, descripcion: text })}
          value={gastoDiario.descripcion}
        />
        <TextInput
          style={styles.input}
          placeholder="Monto del Gasto"
          keyboardType="numeric"
          onChangeText={(text) => setGastoDiario({ ...gastoDiario, monto: text })}
          value={gastoDiario.monto}
        />
        <Button title="Agregar Gasto" onPress={agregarGastoDiario} />
      </View>

      {/* Section List con los gastos del día */}
      <SectionList
        sections={secciones}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section }) => {
          const totalGastosDia = calcularTotalGastos(section.data);
          const isExpanded = expandedSections[section.title];

          return (
            <TouchableOpacity onPress={() => toggleSectionVisibility(section.title)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.totalGastosDia}>Total gastos: ${totalGastosDia}</Text>
              <FontAwesome name={isExpanded ? "caret-up" : "caret-down"} size={20} color="#007BFF" />
            </TouchableOpacity>
          );
        }}
        renderItem={({ item, index, section }) => {
          if (!expandedSections[section.title]) {
            return null;
          }
          return (
            <View style={styles.gastoItem}>
              <Text style={styles.hora}>
                {new Date(item.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Text style={styles.descripcion}>{item.descripcion}: ${item.monto}</Text>
              <TouchableOpacity onPress={() => eliminarGastoDiario(index)}>
                <Text style={styles.eliminar}>X</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Totales en la parte inferior */}
      <View style={styles.totalesContainer}>
        {totalesPorFecha.map(({ fecha, total }) => (
          <Text key={fecha} style={styles.totalPorFecha}>
            {fecha}: Total: ${total}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  gastosFijosContainer: {
    marginTop: 20,
    marginBottom: 50,
    borderWidth: 0.5,
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  gastosFijosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  gastosFijosDetails: {
    marginTop: 10,
  },
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },
  gastosContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  boldText: {
    fontWeight: "bold",
	
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalGastosDia: {
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 20,
  },
  hora: {
    fontSize: 14,
    color: "#888",
    marginLeft: 10,
  },
  descripcion: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
  },
  eliminar: {
    fontSize: 18,
    color: "red",
    paddingLeft: 20,
    marginRight: 10,
  },
  totalesContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  totalPorFecha: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default GastosScreen;
