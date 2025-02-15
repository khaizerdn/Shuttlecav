import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { config } from './config';
import globalStyles from './globalstyles';

const SignUp = () => {
  const [surname, setSurname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middleinitial, setMiddleInitial] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
  
    try {
      const response = await axios.post(`${config.API_URL}/signup`, {
        surname,
        firstname,
        middleinitial,
        age,
        gender,
        phonenumber,
        username,
        password,
        confirmPassword, // Include confirmPassword in the request body
      });
      console.log(response.data);
      router.push('/');
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.message || error.message);
      alert('Signup failed, please try again');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FFF'}}>
      <View style={styles.container}>
        <TextInput style={globalStyles.listItem} placeholder="Surname" value={surname} onChangeText={setSurname} />
        <TextInput style={globalStyles.listItem} placeholder="First Name" value={firstname} onChangeText={setFirstname} />
        <TextInput style={globalStyles.listItem} placeholder="Middle Initial" value={middleinitial} onChangeText={setMiddleInitial} />
        <TextInput style={globalStyles.listItem} placeholder="Age" keyboardType="numeric" value={age} onChangeText={setAge} />
        <TextInput style={globalStyles.listItem} placeholder="Gender" value={gender} onChangeText={setGender} />
        <TextInput style={globalStyles.listItem} placeholder="Phone Number" keyboardType="phone-pad" value={phonenumber} onChangeText={setPhoneNumber} />
        <TextInput style={globalStyles.listItem} placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput style={globalStyles.listItem} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={globalStyles.listItem} placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity style={globalStyles.button} onPress={handleSignup}>
          <Text style={globalStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
});

export default SignUp;
