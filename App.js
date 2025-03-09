import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Start from "./components/Start";
import Chat from "./components/Chat";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// 🔥 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlDMGPTPHJ_BksxGzJ-_nU0fYcgHbtn_U",
  authDomain: "chatsnap-e9072.firebaseapp.com",
  projectId: "chatsnap-e9072",
  storageBucket: "chatsnap-e9072.firebasestorage.app",
  messagingSenderId: "373817032765",
  appId: "1:373817032765:web:f88f88832ed23cd1b6ea54",
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔐 Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔥 Initialize Firestore database
const db = getFirestore(app);

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" options={{ headerShown: false }}>
          {(props) => <Start {...props} auth={auth} />}
        </Stack.Screen>
        <Stack.Screen
          name="Chat"
          options={({ route }) => ({ title: route.params.name })}
        >
          {(props) => <Chat {...props} db={db} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
