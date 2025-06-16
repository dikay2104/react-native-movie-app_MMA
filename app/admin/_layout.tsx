import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function AdminLayout() {
    return (
        <>
            <StatusBar hidden />
            <Stack
                screenOptions={{
                    headerShown: false,
                    headerStyle: { backgroundColor: "#0F0D23" },
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
        </>
    );
}
