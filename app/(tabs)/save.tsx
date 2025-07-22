import { useEffect, useState, useCallback } from "react";
import { View, Text, Image, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchFavoriteMovies } from "@/services/apiService";
import { fetchMovieDetails } from "@/services/api";
import { icons } from "@/constants/icons";
import MovieCard from "@/components/MovieCard";
import { useFocusEffect } from "expo-router";
import { EventBus } from "@/services/eventBus";

const Save = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tmdbMovies, setTmdbMovies] = useState<{ [key: string]: any }>({});

  // Hàm loadFavorites
  const loadFavorites = async () => {
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem("currentUser");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const data = await fetchFavoriteMovies(user._id);
      setFavorites(
        [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) { }
    setLoading(false);
  };

  // Sử dụng useFocusEffect để load favorites, event bus để reload
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      const reload = () => loadFavorites();
      EventBus.on("reloadFavorites", reload);
      return () => {
        EventBus.off("reloadFavorites", reload);
      };
    }, [])
  );

  // Fetch TMDB info for favorites without movie
  useEffect(() => {
    const fetchMissingMovies = async () => {
      const missing = favorites.filter((item) => !item.movie && item.tmdbId && !tmdbMovies[item.tmdbId]);
      for (const item of missing) {
        try {
          const movieData = await fetchMovieDetails(String(item.tmdbId));
          setTmdbMovies((prev) => ({ ...prev, [item.tmdbId]: movieData }));
        } catch { }
      }
    };
    if (favorites.length > 0) fetchMissingMovies();
  }, [favorites]);

  return (
    <SafeAreaView className="bg-primary flex-1 px-4">
      <View className="flex-1">
        <View className="flex-row items-center my-5">
          <Image source={icons.save} className="size-8 mr-2" tintColor="#fff" />
          <Text className="text-white text-xl font-bold">Phim đã lưu</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : favorites.length === 0 ? (
          <Text className="text-gray-400 text-center mt-10">Bạn chưa lưu phim nào.</Text>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item._id}
            numColumns={3}
            renderItem={({ item }) => {
              if (item.movie) {
                return <MovieCard {...item.movie} />;
              }
              if (tmdbMovies[item.tmdbId]) {
                return <MovieCard {...tmdbMovies[item.tmdbId]} />;
              }
              // Đang fetch hoặc lỗi, hiển thị placeholder
              return (
                <View style={{ width: "30%", alignItems: "center", marginVertical: 10 }}>
                  <Image
                    source={{ uri: "https://placehold.co/600x400/1a1a1a/FFFFFF.png" }}
                    style={{ width: "100%", height: 150, borderRadius: 8 }}
                  />
                  <Text style={{ color: "#fff", marginTop: 8, textAlign: "center" }}>
                    TMDB #{item.tmdbId}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
            columnWrapperStyle={{ justifyContent: "flex-start", gap: 16, marginVertical: 8 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Save;
