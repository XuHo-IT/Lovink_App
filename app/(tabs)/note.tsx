import { api } from "@/convex/_generated/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, Platform, Text, TextInput, View } from "react-native";

// Move setNotificationHandler outside the component to avoid re-registering on every render
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // ✅ Android + iOS
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,  // ✅ iOS 14+ banner
    shouldShowList: true,    // ✅ iOS 14+ notification center list
  }),
});


export default function NotesScreen() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const createNote = useMutation(api.note.createNote);
  const notes = useQuery(api.note.getNotesByUser, {});

  // ✅ Setup notification channel (Android only)
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }, []);

  async function requestPermissions() {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        Alert.alert("Permission not granted for notifications");
        return false;
      }
    }
    return true;
  }

  async function scheduleNotification() {
    const granted = await requestPermissions();
    if (!granted) return;

    // 1. Save to DB
    await createNote({
      title,
      content,
      date: date.toISOString(),
    });

await Notifications.scheduleNotificationAsync({
  content: {
    title: title || "Reminder",
    body: content || "Don't forget your note!",
    sound: true,
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 👈 JS months are 0-based
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    channelId: "default", // Android channel
  },
});


    Alert.alert("Success", "Note created successfully!");

    // reset form
    setTitle("");
    setContent("");
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Create Note</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
        style={{ borderWidth: 1, marginBottom: 8, padding: 8, height: 100, borderRadius: 8 }}
      />

      <Button title="Pick Date & Time" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Button title="Save Note" onPress={scheduleNotification} />

      <Text style={{ fontSize: 18, marginVertical: 10 }}>Your Notes</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text style={{ color: "gray" }}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
