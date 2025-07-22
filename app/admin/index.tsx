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
import { getAllMovies } from "@/services/apiService";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";


const dummyMovies = [
  { id: 1, title: "Inception", poster_path: "", vote_average: 8.8 },
  { id: 2, title: "Interstellar", poster_path: "", vote_average: 8.6 },
  { id: 3, title: "Tenet", poster_path: "", vote_average: 7.4 },
];

type Movie = {
  _id?: string;
  id?: number;
  title: string;
  poster_path?: string;   // TMDB
  posterUrl?: string;     // Admin
  vote_average?: number;  // TMDB
  rating?: number;        // Admin
  release_date?: string;  // TMDB
  releaseDate?: string;   // Admin
};


export default function AdminHome() {
  const router = useRouter();
  const [adminMovies, setAdminMovies] = useState<Movie[]>([]);
  const [loadingAdminMovies, setLoadingAdminMovies] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAdminMovies = async () => {
        setLoadingAdminMovies(true);
        try {
          const data = await getAllMovies();
          setAdminMovies(data || []);
        } catch (err) {
          console.error("Lỗi khi fetch getAllMovies:", err);
        } finally {
          setLoadingAdminMovies(false);
        }
      };

      fetchAdminMovies();
    }, [])
  );

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

        <TouchableOpacity
          onPress={() => router.push("/admin/users")}
          className="bg-green-500 py-3 px-4 rounded-md mb-5 self-center"
        >
          <Text className="text-white font-semibold text-base">👤 Quản lý Users</Text>
        </TouchableOpacity>

        <Text className="text-lg text-white font-bold mt-6 mb-3">
          Admin phim ({adminMovies.length})
        </Text>

        {loadingAdminMovies ? (
          <ActivityIndicator size="large" color="#00f" className="self-center mt-4" />
        ) : (
          <FlatList
            data={adminMovies}
            renderItem={({ item }) => (
              <MovieCardAdmin
                _id={item._id}
                // id={item._id}
                title={item.title}
                poster_path={item.posterUrl}
                vote_average={Number(item.rating)}
                release_date={item.releaseDate ?? ""}
              />
            )}
            keyExtractor={(item) => `admin2-${item._id}`}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 20,
              paddingRight: 5,
              marginBottom: 10,
            }}
            scrollEnabled={false}
          />
        )}

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

