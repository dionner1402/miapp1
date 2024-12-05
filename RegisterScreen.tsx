import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [registerOption, setRegisterOption] = useState<'phone' | 'email'>('phone');
  const [countryCode, setCountryCode] = useState('US');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Manejando el registro
  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const method = registerOption === 'phone' ? `Teléfono: ${phoneNumber}` : `Correo: ${email}`;
    Alert.alert('Éxito', `Usuario registrado con éxito usando ${method}`);
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Reemplaza con tu logo real
        style={styles.logo}
      />

      {/* Título */}
      <Text style={styles.title}>Registro</Text>

      {/* Opciones de registro */}
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            registerOption === 'phone' && styles.optionButtonSelected,
          ]}
          onPress={() => setRegisterOption('phone')}
        >
          <Text style={styles.optionText}>Registro por Teléfono</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            registerOption === 'email' && styles.optionButtonSelected,
          ]}
          onPress={() => setRegisterOption('email')}
        >
          <Text style={styles.optionText}>Registro por Correo</Text>
        </TouchableOpacity>
      </View>

      {registerOption === 'phone' ? (
        <>
          {/* Selección de País */}
          <Text style={styles.label}>Selecciona tu país</Text>
          <Picker
            selectedValue={countryCode}
            onValueChange={(itemValue) => setCountryCode(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Panamá (+507)" value="PA" />
            <Picker.Item label="Estados Unidos (+1)" value="US" />
            <Picker.Item label="México (+52)" value="MX" />
            <Picker.Item label="España (+34)" value="ES" />
            <Picker.Item label="Venezuela (+58)" value="VE" />
          </Picker>

          {/* Número de Teléfono */}
          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </>
      ) : (
        <>
          {/* Correo Electrónico */}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </>
      )}

      {/* Contraseña */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeText}>{isPasswordVisible ? '🙉️' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmar Contraseña */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirmar Contraseña"
          secureTextEntry={!isConfirmPasswordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeText}>{isConfirmPasswordVisible ? '🙉️' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de Registro */}
      <Button title="Registrar" onPress={handleRegister} color="#007BFF" />

      {/* Botón de Login (si ya tienes cuenta) */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginButton}>
        <Text style={styles.loginText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  optionText: {
    color: '#333',
	fontSize: 14,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingLeft: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 10,
  },
  eyeText: {
    fontSize: 18,
  },
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#007BFF',
  },
});
