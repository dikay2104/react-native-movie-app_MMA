import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateMovie() {
    const [title, setTitle] = useState("");
    const router = useRouter();

    const handleCreate = () => {
        console.log("New movie:", title);
        // TODO: Gọi API tạo
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-primary p-4">
            <Text className="text-white text-xl font-bold mb-4">➕ Tạo phim mới</Text>

            <TextInput
                placeholder="Tên phim"
                value={title}
                onChangeText={setTitle}
                className="bg-gray-800 text-white p-3 rounded mb-4"
                placeholderTextColor="#aaa"
            />

            <Button title="Lưu phim" onPress={handleCreate} />
        </SafeAreaView>
    );
}
