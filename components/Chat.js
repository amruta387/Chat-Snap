import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Chat = ({ route }) => {
    const { name, bgColor } = route.params;

    // Determine the text color based on the background color
    const textColor = bgColor === '#090C08' ? '#D3D3D3' : '#000000';  
    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <Text style={[styles.text, { color: textColor }]}>Welcome, {name}!</Text>
        </View>
    );
};

// Styling for the Chat screen
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, fontWeight: 'bold' },
});

export default Chat;
