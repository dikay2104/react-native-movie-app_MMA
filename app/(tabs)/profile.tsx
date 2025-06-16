import { icons } from "@/constants/icons";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Profile = () => {
    const router = useRouter();
  return (
    <SafeAreaView className="bg-primary flex-1 px-10">
      <View className="flex justify-center items-center flex-1 flex-col gap-5">
        <Image source={icons.person} className="size-10" tintColor="#fff" />
        <Text className="text-gray-500 text-base">Profile</Text>
      </View>

        <View className="flex justify-center items-center flex-1 flex-col gap-5">
            <TouchableOpacity onPress={() => router.push("/admin")}>
                <Text className="text-blue-400 mt-4">🛠 Trang Admin</Text>
            </TouchableOpacity>
        </View>

    </SafeAreaView>
  );
};

export default Profile;
