import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { config } from './config';
import globalStyles from './globalstyles';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

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
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const router = useRouter();

  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 8) {
        setErrors((prev) => ({ ...prev, username: 'Must be at least 8 characters' }));
        return;
      }
      if (!/^[a-z0-9]+$/.test(username)) {
        setErrors((prev) => ({
          ...prev,
          username: 'Must contain only small letters and numbers (no special characters)',
        }));
        return;
      }
      try {
        const response = await axios.post(`${config.API_URL}/check-username`, { username });
        console.log('Username check response:', response.data);
        setErrors((prev) => ({
          ...prev,
          username: response.data.exists ? 'Username is already taken' : '',
        }));
      } catch (error) {
        console.error('Username check failed:', error.response?.data || error.message);
        setErrors((prev) => ({ ...prev, username: 'Error checking username, try again later' }));
      }
    };

    const timer = setTimeout(() => {
      if (username) checkUsername();
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const capitalizeWords = (str) =>
    str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const validateSurname = (value) => {
    const capitalized = capitalizeWords(value);
    return value === capitalized ? '' : 'Each word should start with a capital letter';
  };

  const validateFirstname = (value) => {
    const capitalized = capitalizeWords(value);
    return value === capitalized ? '' : 'Each word should start with a capital letter';
  };

  const validateMiddleInitial = (value) => {
    return /^[A-Z]?$/.test(value) ? '' : 'Must be a single capital letter';
  };

  const validateAge = (value) => {
    const num = parseInt(value, 10);
    return /^\d*$/.test(value) && num >= 1 && num <= 120 ? '' : 'Must be a number between 1 and 120';
  };

  const validateGender = (value) => {
    const validGenders = ['male', 'female', 'other'];
    return validGenders.includes(value.toLowerCase()) ? '' : 'Must be Male, Female, or Other';
  };

  const validatePhoneNumber = (value) => {
    return /^\d{11}$/.test(value) ? '' : 'Must be exactly 11 digits';
  };

  const validatePassword = (value) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongPasswordRegex.test(value)
      ? ''
      : 'Must be at least 8 characters with uppercase, lowercase, number, and special character';
  };

  const handleInputChange = (field, value, setter) => {
    setter(value);
    let error = '';
    switch (field) {
      case 'surname':
        error = validateSurname(value);
        break;
      case 'firstname':
        error = validateFirstname(value);
        break;
      case 'middleinitial':
        error = validateMiddleInitial(value);
        break;
      case 'age':
        error = validateAge(value);
        break;
      case 'gender':
        error = validateGender(value);
        break;
      case 'phonenumber':
        error = validatePhoneNumber(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const isFormValid = () => {
    return (
      !errors.surname &&
      !errors.firstname &&
      !errors.middleinitial &&
      !errors.age &&
      !errors.gender &&
      !errors.phonenumber &&
      !errors.username &&
      !errors.password &&
      surname &&
      firstname &&
      middleinitial &&
      age &&
      gender &&
      phonenumber &&
      username &&
      password &&
      password === confirmPassword
    );
  };

  const handleSignup = async () => {
    if (!isFormValid()) {
      alert('Please correct the errors in the form');
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
        confirmPassword,
      });
      console.log(response.data);
      router.push('/');
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.message || error.message);
      alert('Signup failed: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#FFF' }}>
      <View style={styles.container}>
        <TextInput
          style={[
            globalStyles.listItem,
            errors.surname && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Surname"
          value={surname}
          onChangeText={(text) => handleInputChange('surname', text, setSurname)}
          onFocus={() => setFocusedField('surname')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.surname && focusedField === 'surname' && (
          <Text style={styles.errorText}>{errors.surname}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.firstname && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="First Name"
          value={firstname}
          onChangeText={(text) => handleInputChange('firstname', text, setFirstname)}
          onFocus={() => setFocusedField('firstname')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.firstname && focusedField === 'firstname' && (
          <Text style={styles.errorText}>{errors.firstname}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.middleinitial && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Middle Initial"
          value={middleinitial}
          onChangeText={(text) => handleInputChange('middleinitial', text, setMiddleInitial)}
          onFocus={() => setFocusedField('middleinitial')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.middleinitial && focusedField === 'middleinitial' && (
          <Text style={styles.errorText}>{errors.middleinitial}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.age && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Age"
          keyboardType="numeric"
          value={age}
          onChangeText={(text) => handleInputChange('age', text, setAge)}
          onFocus={() => setFocusedField('age')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.age && focusedField === 'age' && (
          <Text style={styles.errorText}>{errors.age}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.gender && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Gender"
          value={gender}
          onChangeText={(text) => handleInputChange('gender', text, setGender)}
          onFocus={() => setFocusedField('gender')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.gender && focusedField === 'gender' && (
          <Text style={styles.errorText}>{errors.gender}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.phonenumber && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phonenumber}
          onChangeText={(text) => handleInputChange('phonenumber', text, setPhoneNumber)}
          onFocus={() => setFocusedField('phonenumber')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.phonenumber && focusedField === 'phonenumber' && (
          <Text style={styles.errorText}>{errors.phonenumber}</Text>
        )}

        <TextInput
          style={[
            globalStyles.listItem,
            errors.username && { borderColor: 'red', borderWidth: 1 },
          ]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField(null)}
        />
        {errors.username && focusedField === 'username' && (
          <Text style={styles.errorText}>{errors.username}</Text>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              globalStyles.listItem,
              styles.passwordInput,
              errors.password && { borderColor: 'red', borderWidth: 1 },
            ]}
            placeholder="Password"
            secureTextEntry={!showPassword} // Toggle visibility
            value={password}
            onChangeText={(text) => handleInputChange('password', text, setPassword)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={errors.password ? 'red' : '#666'}
            />
          </TouchableOpacity>
        </View>
        {errors.password && focusedField === 'password' && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <TextInput
          style={globalStyles.listItem}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setFocusedField('confirmPassword')}
          onBlur={() => setFocusedField(null)}
        />
        {password !== confirmPassword && focusedField === 'confirmPassword' && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}

        <TouchableOpacity
          style={[globalStyles.button, !isFormValid() && styles.disabledButton]}
          onPress={handleSignup}
          disabled={!isFormValid()}
        >
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  inputContainer: {
    position: 'relative', // For absolute positioning of the icon
    width: '100%',
  },
  passwordInput: {
    paddingRight: 40, // Space for the icon
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }], // Center vertically (half of icon size)
  },
});

export default SignUp;