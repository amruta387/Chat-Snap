import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";

const Start = ({ navigation, auth }) => {
    const [name, setName] = useState("");
    const [bgColor, setBgColor] = useState("#FFFFFF");

    // 🔐 Function to log in anonymously
    const handleStartChat = () => {
        signInAnonymously(auth)
            .then((userCredential) => {
                const user = userCredential.user;
                navigation.navigate("Chat", {
                    userId: user.uid, 
                    name: name || "Anonymous", 
                    bgColor,
                });
            })
            .catch((error) => {
                console.error("Authentication Error:", error.message);
            });
    };

    return (
        <ImageBackground
            source={require("../assets/Background.png")}
            style={styles.background}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to ChatSnap</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Choose Background Color:</Text>
                <View style={styles.colorContainer}>
                    {["#090C08", "#474056", "#8A95A5", "#B9C6AE"].map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[styles.colorOption, { backgroundColor: color }]}
                            onPress={() => setBgColor(color)}
                        />
                    ))}
                </View>

                <TouchableOpacity style={styles.button} onPress={handleStartChat}>
                    <Text style={styles.buttonText}>Start Chat</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

// Styling for the Start screen
const styles = StyleSheet.create({
    background: { flex: 1, justifyContent: "center" },
    container: { alignItems: "center", padding: 20 },
    title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
    input: { width: "80%", padding: 10, borderWidth: 1, marginBottom: 10 },
    label: { fontSize: 16, marginVertical: 10 },
    colorContainer: { flexDirection: "row", marginBottom: 20 },
    colorOption: { width: 40, height: 40, borderRadius: 20, margin: 5 },
    button: { backgroundColor: "#000", padding: 10, borderRadius: 5 },
    buttonText: { color: "#fff", fontSize: 16 },
});

export default Start;
