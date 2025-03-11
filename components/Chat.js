import React, { useState, useEffect, useCallback } from "react";
import { View, Platform, KeyboardAvoidingView, StyleSheet, Text, Image } from "react-native";
import { GiftedChat, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo"; // for network connectivity
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions"; // Import CustomActions component
import MapView from "react-native-maps";

const Chat = ({ route, db }) => {
    const { userId, name, bgColor } = route.params;
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(true); // Track network connection status
    const [offlineMessage, setOfflineMessage] = useState(""); // State to store offline message

    const netInfo = useNetInfo(); // Get network info

    // Monitor network status changes
    useEffect(() => {
        setIsConnected(netInfo.isConnected);
        if (!netInfo.isConnected) {
            setOfflineMessage("You are offline. Messages will be stored locally.");
        } else {
            setOfflineMessage("");
        }
    }, [netInfo.isConnected]);

    // 📡 Real-time listener for Firestore messages when connected
    useEffect(() => {
        if (isConnected) {
            const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedMessages = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        _id: doc.id,
                        text: data.text,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        user: data.user,
                        image: data.image,
                        location: data.location,
                    };
                });
                setMessages(fetchedMessages);
                AsyncStorage.setItem("messages", JSON.stringify(fetchedMessages));
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
            return () => unsubscribe();
        } else {
            AsyncStorage.getItem("messages").then((cachedMessages) => {
                if (cachedMessages) {
                    setMessages(JSON.parse(cachedMessages));
                }
            });
        }
    }, [isConnected]);

    // ✉️ Send messages to Firestore when online
    const onSend = useCallback((newMessages = []) => {
        const message = newMessages[0];

        if (isConnected) {
            addDoc(collection(db, "messages"), message).then(() => {
                const assistantReply = {
                    _id: Math.random().toString(36).substring(7),
                    text: `Hello ${name}, How can I help you?`,
                    createdAt: new Date(),
                    user: { _id: "assistant", name: "Chat Assistant" },
                };
                addDoc(collection(db, "messages"), assistantReply);
            });
        } else {
            AsyncStorage.setItem("messages", JSON.stringify([...messages, message]));
        }
    }, [isConnected, messages]);

    // 📍 Render custom messages (Images & Location)
    const renderCustomView = (props) => {
        const { currentMessage } = props;
        if (currentMessage.image) {
            return (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: currentMessage.image }} style={styles.image} />
                </View>
            );
        } else if (currentMessage.location) {
            return (
                <MapView
                    style={styles.map}
                    region={{
                        latitude: currentMessage.location.latitude,
                        longitude: currentMessage.location.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                />
            );
        }
        return null;
    };

    // Function to render InputToolbar based on connection status
    const renderInputToolbar = (props) => {
        if (isConnected) {
            return <InputToolbar {...props} />;
        } else {
            return null;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            {offlineMessage ? (
                <View style={styles.offlineMessageContainer}>
                    <Text style={styles.offlineMessageText}>{offlineMessage}</Text>
                </View>
            ) : null}

            <GiftedChat
                messages={messages}
                onSend={(messages) => onSend(messages)}
                user={{ _id: userId, name }}
                renderInputToolbar={renderInputToolbar}
                renderActions={(props) => <CustomActions {...props} onSend={onSend} />}
                renderCustomView={renderCustomView}
            />

            {(Platform.OS === "android" || Platform.OS === "ios") && (
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    offlineMessageContainer: {
        padding: 10,
        backgroundColor: "#FF0000",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    offlineMessageText: {
        color: "#FFFFFF",
        fontSize: 16,
        textAlign: "center",
    },
    imageContainer: {
        borderRadius: 10,
        overflow: "hidden",
        marginVertical: 5,
    },
    image: {
        width: 200,
        height: 150,
        resizeMode: "cover",
    },
    map: {
        width: 200,
        height: 150,
        borderRadius: 10,
    },
});

export default Chat;
