import React, { useState, useEffect, useCallback } from "react";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo"; // to check network status
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ route, db }) => {
    const { userId, name, bgColor } = route.params;
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(true); // Track the connection status

    // Get network info
    const netInfo = useNetInfo();

    // Track connectivity changes
    useEffect(() => {
        setIsConnected(netInfo.isConnected);
    }, [netInfo.isConnected]);

    // 📡 Real-time listener for Firestore messages
    useEffect(() => {
        if (isConnected) {
            // When connected, get messages from Firestore
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        _id: doc.id,
                        text: data.text,
                        createdAt: data.createdAt.toDate(), // Convert Firestore timestamp to Date
                        user: data.user,
                    };
                });
                setMessages(fetchedMessages);
                // Cache messages in AsyncStorage
                AsyncStorage.setItem("messages", JSON.stringify(fetchedMessages));
            });

            return () => unsubscribe(); // Cleanup listener when component unmounts
        } else {
            // If offline, load cached messages from AsyncStorage
            AsyncStorage.getItem("messages").then((cachedMessages) => {
                if (cachedMessages) {
                    setMessages(JSON.parse(cachedMessages));
                }
            });
        }
    }, [isConnected]);

    // ✉️ Send messages to Firestore
    const onSend = useCallback((newMessages = []) => {
        const message = newMessages[0]; // Get the latest message

        if (isConnected) {
            // Send message to Firestore
            addDoc(collection(db, "messages"), message).then(() => {
                // 📩 Assistant replies after user's message
                const assistantReply = {
                    _id: Math.random().toString(36).substring(7), // Random ID for assistant's reply
                    text: `Hello ${name}, How can I help you?`,
                    createdAt: new Date(),
                    user: { _id: "assistant", name: "Chat Assistant" },
                };
                addDoc(collection(db, "messages"), assistantReply); // Send assistant's reply
            });
        } else {
            // If offline, store the message in AsyncStorage
            AsyncStorage.setItem("messages", JSON.stringify([...messages, message]));
        }
    }, [isConnected, messages]);

    // Function to render InputToolbar based on network status
    const renderInputToolbar = (props) => {
        if (isConnected) {
            // If connected, show the InputToolbar
            return <InputToolbar {...props} />;
        } else {
            // If offline, do not show InputToolbar (prevent sending messages)
            return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{ _id: userId, name }}
                renderInputToolbar={renderInputToolbar} // Use custom renderInputToolbar
            />

            {/* Adjust UI for keyboard on iOS and Android */}
            {(Platform.OS === "android" || Platform.OS === "ios") && (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default Chat;
