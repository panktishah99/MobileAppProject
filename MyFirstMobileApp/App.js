import React, { useState, useEffect, useRef} from 'react';
import { Button, View, StyleSheet, Text, TextInput, AppState} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('AsyncStorage:', AsyncStorage); 

function HomeScreen({ navigation }) {
  const [userNumber, setUserNumber] = useState('');
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
      const loadNumber = async () => {
      try {
          const storedNumber = await AsyncStorage.getItem('userNumber');
          if (storedNumber) {
            setUserNumber(userNumber);
          }
          console.log('loaded the number',userNumber); 
      } catch (error) {
        console.error('Error loading stored number:', error);
      }
    };
    

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        loadNumber();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, [userNumber]);

    const storeNumber = async () => {
      try {
        if (userNumber){
          await AsyncStorage.setItem('userNumber', userNumber.toString());
          console.log('saved the number',userNumber);
        }     
      } catch (error) {
        console.error('Error loading stored number:', error);
      }
    };



  return (
    <View style={styles.container}>
      <Text>Hello World! This is the App Home Screen</Text>
      <Text>Current state is: {appStateVisible}</Text>
      <View style={{ height: 20 }} />
      <Text>Enter the number to remember</Text>
      <TextInput
        style={styles.input}
        placeholder={userNumber}
        onChangeText={(newText) => {
        setUserNumber(newText);
        storeNumber();
      }}
        keyboardType="numeric"
        value={userNumber}
      />
      <Button
        title="This button does nothing"
      />
    </View>
  );
}



const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: 80,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});
