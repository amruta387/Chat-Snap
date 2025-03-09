import React, { useState, useEffect, useCallback } from "react";
import { View, Platform, KeyboardAvoidingView, StyleSheet } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

const Chat = ({ route, db }) => {
    const { userId, name, bgColor } = route.params;
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 📡 Real-time listener for Firestore messages
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
        });
        // 📩 Add System Message when user enters chat
        setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [
                {
                    _id: "system-message",
                    text: "You have entered the chat",
                    createdAt: new Date(),
                    system: true,
                },
            ])
        );

        return () => unsubscribe(); // Cleanup listener
    }, []);

    // ✉️ Send messages to Firestore
    const onSend = useCallback((newMessages = []) => {
        const message = newMessages[0]; // Get the latest message

        // Send user message first
        addDoc(collection(db, "messages"), message).then(() => {
            // 📩 **Assistant replies AFTER user sends a message**
            const assistantReply = {
                _id: Math.random().toString(36).substring(7), // Generate random ID
                text: `Hello ${name}, How can i Help you?`,
                createdAt: new Date(),
                user: { _id: "assistant", name: "Chat Assistant" },
            };

            // Send assistant's message AFTER user's message
            addDoc(collection(db, "messages"), assistantReply);
        });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{ _id: userId, name }}
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
