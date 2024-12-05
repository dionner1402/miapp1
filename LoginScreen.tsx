import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Credenciales de ejemplo
  const correctUsername = '';
  const correctPassword = '';

  // Manejar el inicio de sesión
  const handleLogin = () => {
    if (username === correctUsername && password === correctPassword) {
      Alert.alert('Bienvenido', `Hola ${username}`);
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    }
  };

  // Manejar "Olvidaste tu contraseña"
  const handleForgotPassword = () => {
    Alert.alert('Recuperar contraseña', 'Funcionalidad aún no implementada.');
  };

  // Manejar "Registrarse"
  const handleRegister = () => {
    navigation.navigate('Register'); // Asume que existe una pantalla "Register"
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={{ uri: 'https://via.placeholder.com/150' }} // Reemplaza con tu logo real
        style={styles.logo}
      />

      {/* Título */}
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Input de Usuario */}
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />

      {/* Input de Contraseña con el ícono de ojo */}
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

      {/* Checkbox manual */}
      <View style={styles.rememberMeContainer}>
        <TouchableOpacity
          style={[styles.checkbox, rememberMe ? styles.checkboxSelected : styles.checkboxUnselected]}
          onPress={() => setRememberMe(!rememberMe)}
        />
        <Text style={styles.rememberMeText}>Recuérdame</Text>
      </View>
	  
	  {/* Olvidaste tu contraseña */}
      <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Botón de Inicio de Sesión Mejorado */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      

      {/* Botón de Registrarse */}
      <TouchableOpacity onPress={handleRegister} style={styles.registerButton}>
        <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  checkboxUnselected: {
    backgroundColor: '#fff',
  },
  rememberMeText: {
    fontSize: 16,
    color: '#555',
  },
  loginButton: {
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  loginButtonText: {

    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 0,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#007BFF',
  },
  registerButton: {
   
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  registerText: {
  marginTop: 40,
    fontSize: 16,
    color: '#FF0000',
  },
});

export default LoginScreen