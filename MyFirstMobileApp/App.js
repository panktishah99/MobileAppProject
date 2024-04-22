import React, { useState, useEffect} from 'react';
import { Button, View, StyleSheet, Image, Switch, Text, TextInput,FlatList} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('AsyncStorage:', AsyncStorage); // Log the imported object

function HomeScreen({ navigation }) {
  const [userNumber, setUserNumber] = useState('');

  useEffect(() => {
    // Load the custom image size from AsyncStorage when the component mounts
    const loadStoredNumber = async () => {
      try {
          const storedNumber = await AsyncStorage.getItem('userNumber');

          if (storedNumber) {
            // Set custom width and height states with retrieved values
            setUserNumber(userNumber);
          }
          console.log('loaded the number',userNumber);
        
      } catch (error) {
        console.error('Error loading stored number:', error);
      }
    };

    loadStoredNumber();
  }, []);


  const storeNumber = async () => {
      try {
        if (userNumber){
          const num = parseInt(userNumber);
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
      <View style={{ height: 20 }} />
      <Button
        title="Go to Image Store Page"
        onPress={() => navigation.navigate('ImageStore')}
      />
      <View style={{ height: 20 }} />
      <Text>Enter the number to remember</Text>
      <TextInput
        style={styles.input}
        placeholder={userNumber}
        onChangeText={setUserNumber}
        keyboardType="numeric"
        value={userNumber}
      />
      <Button
        title="Save this number"
        onPress={() => storeNumber()}
      />
    </View>
  );
}


//Page to handle selecting image from user gallery and saving it in-app
function ImagePickerScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log(result);

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    }catch (error) {
      console.error("Error selecting image:", error);
    }

  };

  const handleSaveImage = async () => {
  if (image) {
    try {
      const theImage = {
        uri: image,
        name: `Image_${new Date().getTime()}`,
        createdAt: new Date(),
      };

      const existingImages = await AsyncStorage.getItem('savedImages');
      const images = existingImages ? JSON.parse(existingImages) : [];

      images.push(theImage);

      await AsyncStorage.setItem('savedImages', JSON.stringify(images));

      console.log('Image saved successfully:', theImage); // Add this line for debugging

    } catch (error) {
      console.error('Error saving image:', error);
    }
  }
};

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      <View style={{ height: 20 }} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <View style={{ height: 20 }} />
      <Button title="Save this Image" onPress={() => handleSaveImage()} />
      <View style={{ height: 20 }} />
      <Button
        title="Load saved image"
        onPress={() => navigation.navigate('ImageLoad')}
      />
    </View>
  );
}


//Page to load images stored by user in-app
function ImageLoaderScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [savedImages, setSavedImages] = useState([]);

const handleDeleteImage = async (image) => {
  try {
    // Retrieve saved images from AsyncStorage
    const imagesData = await AsyncStorage.getItem('savedImages');
    if (imagesData) {
      let images = JSON.parse(imagesData);
      // Filter out the image to be deleted
      images = images.filter((img) => img.uri !== image.uri || img.name !== image.name);
      // Update the saved images in AsyncStorage
      await AsyncStorage.setItem('savedImages', JSON.stringify(images));
      // Update state to reflect the changes
      setSavedImages(images);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};


useEffect(() => {
  const getSavedImages = async () => {
    try {
      const imagesData = await AsyncStorage.getItem('savedImages');
      console.log('Retrieved images data:', imagesData); // Add this line for debugging
      if (imagesData) {
        const images = JSON.parse(imagesData);
        setSavedImages(images);
      }
    } catch (error) {
      console.error('Error retrieving saved images:', error);
    }
  };

  getSavedImages();
}, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Images</Text>
      {savedImages.length > 0 ? (
        <FlatList
          data={savedImages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.imageItem}>
              <View style={styles.imageInfo}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                <Text style={styles.imageName}>{item.name}</Text>
              </View>
              <Button title="Delete" onPress={() => handleDeleteImage(item)} />
            </View>
          )}
        />
      ) : (
        <Text>No saved images found</Text>
      )}
    </View>
  );
}



const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ImageStore" component={ImagePickerScreen} />
        <Stack.Screen name="ImageLoad" component={ImageLoaderScreen} />
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
  image: {
    width: 200,
    height: 200,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },

    thumbnail: {
    width: 80, // Adjust as needed
    height: 80, // Adjust as needed
    resizeMode: 'cover', // or 'contain' based on your preference
    borderRadius: 5,
  },

  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageName: {
    marginTop: 5, // Adjust as needed
    textAlign: 'center', // Adjust as needed
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
