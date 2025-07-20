import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import { icons } from "@/constants/icons";
import useFetch from "@/services/usefetch";
import { fetchMovieDetails } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addFavoriteMovie, fetchFavoriteMovies, removeFavoriteMovie, addWatchedMovie, addWatchedHistory } from "@/services/apiService";
import heartIcon from "../../assets/icons/heart.png"; // Đảm bảo có icon này trong assets/icons
import { useEffect, useState } from "react";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  // Kiểm tra trạng thái favorite khi load trang
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const userStr = await AsyncStorage.getItem("currentUser");
        if (!userStr || !movie) return;
        const user = JSON.parse(userStr);
        const favorites = await fetchFavoriteMovies(user._id);
        // Tìm bản ghi favorite
        const found = favorites.find(
          (fav: any) =>
            (fav.tmdbId && String(fav.tmdbId) === String(movie.id)) ||
            (fav.movie && fav.movie._id && String(fav.movie._id) === String((movie as any)._id))
        );
        setIsFavorite(!!found);
        setFavoriteId(found ? found._id : null);
      } catch {}
    };
    checkFavorite();
  }, [movie]);

  // Hàm xử lý khi ấn trái tim
  const handleFavorite = async () => {
    try {
      const userStr = await AsyncStorage.getItem("currentUser");
      if (!userStr) {
        Alert.alert("Bạn cần đăng nhập để lưu yêu thích!");
        return;
      }
      const user = JSON.parse(userStr);
      if (!movie || !movie.id) {
        Alert.alert("Không tìm thấy thông tin phim hợp lệ!");
        return;
      }
      if (isFavorite && favoriteId) {
        // Nếu đã là favorite, xóa khỏi danh sách yêu thích theo _id
        await removeFavoriteMovie(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        // Nếu chưa là favorite, thêm vào danh sách yêu thích
        await addFavoriteMovie(user._id, String(movie.id), (movie as any)._id);
        setIsFavorite(true);
      }
    } catch (err) {
      Alert.alert("Lỗi xử lý phim yêu thích");
    }
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: movie?.poster_path?.includes("http")
                ? movie.poster_path
                : `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          {/* Nút trái tim và nút play cạnh nhau ở góc dưới poster */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              flexDirection: "row",
              gap: 16,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderRadius: 28,
                width: 56,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 8,
              }}
              onPress={handleFavorite}
            >
              <Image
                source={heartIcon}
                style={{
                  width: 28,
                  height: 28,
                  tintColor: isFavorite ? "red" : "gray",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderRadius: 28,
                width: 56,
                height: 56,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={async () => {
                try {
                  const userStr = await AsyncStorage.getItem("currentUser");
                  if (userStr && movie && movie.id) {
                    const user = JSON.parse(userStr);
                    await addWatchedHistory(user._id, String(movie.id), (movie as any)._id);
                  }
                } catch {}
                router.push({
                  pathname: '/movie/watch',
                  params: {
                    videoUrl: `https://vidsrc.xyz/embed/movie/${id}`,
                  },
                });
              }}
            >
              <Image
                source={icons.play}
                style={{ width: 24, height: 28, marginLeft: 2 }}
                resizeMode="stretch"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;
