import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import useFetch from "@/services/usefetch";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import MovieCardAdmin from "@/components/MovieCardAdmin";

const dummyMovies = [
  { id: 1, title: "Inception", poster_path: "", vote_average: 8.8 },
  { id: 2, title: "Interstellar", poster_path: "", vote_average: 8.6 },
  { id: 3, title: "Tenet", poster_path: "", vote_average: 7.4 },
];

export default function AdminHome() {
  const router = useRouter();

  const {
    data: movies,
    loading,
    error,
  } = useFetch(() => fetchMovies({ query: "" }));

  const movieList = error || !movies?.length ? dummyMovies : movies;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-10 mb-5 mx-auto" />
        <Text className="text-white text-2xl font-bold mb-3 text-center">🎬 Quản lý phim</Text>

        <TouchableOpacity
          onPress={() => router.push("/admin/create")}
          className="bg-blue-500 py-3 px-4 rounded-md mb-5 self-center"
        >
          <Text className="text-white font-semibold text-base">➕ Tạo phim mới</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#00f" className="mt-10 self-center" />
        ) : (
          <>
            <Text className="text-lg text-white font-bold mt-2 mb-3">
              Danh sách phim ({movieList.length})
            </Text>

            <FlatList
              data={movieList}
              renderItem={({ item }) => <MovieCardAdmin {...item} />}
              keyExtractor={(item) => `admin-${item.id}`}
              numColumns={3}
              columnWrapperStyle={{
                justifyContent: "flex-start",
                gap: 20,
                paddingRight: 5,
                marginBottom: 10,
              }}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

