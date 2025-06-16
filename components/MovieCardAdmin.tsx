import { Text, Image, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { icons } from "@/constants/icons";

type MovieCardAdminProps = {
  id: number;
  title: string;
  poster_path?: string;
  vote_average: number;
  release_date?: string;
};

const MovieCardAdmin = ({
                          id,
                          poster_path,
                          title,
                          vote_average,
                          release_date,
                        }: MovieCardAdminProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/admin/${id}`)}
      className="w-[30%]"
    >
      <Image
        source={{
          uri: poster_path
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
        }}
        className="w-full h-52 rounded-lg"
        resizeMode="cover"
      />

      <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>
        {title}
      </Text>

      <View className="flex-row items-center justify-start gap-x-1">
        <Image source={icons.star} className="size-4" />
        <Text className="text-xs text-white font-bold uppercase">
          {Math.round(vote_average / 2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-light-300 font-medium mt-1">
          {release_date?.split("-")[0] ?? "N/A"}
        </Text>
        <Text className="text-xs font-medium text-light-300 uppercase">
          Admin
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MovieCardAdmin;
