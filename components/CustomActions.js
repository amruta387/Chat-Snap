import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({ onSend }) => {
    const { showActionSheetWithOptions } = useActionSheet();

    const handleActionPress = () => {
        showActionSheetWithOptions(
            {
                options: ["Select an image from library", "Take a photo", "Share location", "Cancel"],
                cancelButtonIndex: 3,
            },
            (buttonIndex) => {
                if (buttonIndex === 0) pickImage();
                else if (buttonIndex === 1) takePhoto();
                else if (buttonIndex === 2) shareLocation();
            }
        );
    };

    // 📸 Pick an image from the gallery
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission required to access photo library.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, 
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUrl = await uploadImage(result.assets[0].uri);
            sendMessage({ image: imageUrl });
        }
    };

    // 📷 Take a photo using the camera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            alert("Permission required to use camera.");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUrl = await uploadImage(result.assets[0].uri);
            sendMessage({ image: imageUrl });
        }
    };

    // 📍 Share the user's location
    const shareLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Permission required to access location.");
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        if (location) {
            sendMessage({
                location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                },
            });
        }
    };

    // ☁️ Upload an image to Firebase Storage
    const uploadImage = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        const storage = getStorage();
        const fileName = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    // 📨 Send a message with media or location
    const sendMessage = (messageContent) => {
        const message = {
            _id: Math.random().toString(36).substring(7),
            createdAt: new Date(),
            user: { _id: "user", name: "User" },
            ...messageContent,
        };

        onSend([message]);
    };

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handleActionPress}
            accessibilityLabel="More actions"
            accessibilityHint="Open menu to send image or location"
        >
            <FontAwesome name="plus" size={24} color="black" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        marginHorizontal: 10,
        marginBottom: 5,
    },
});

export default CustomActions;
