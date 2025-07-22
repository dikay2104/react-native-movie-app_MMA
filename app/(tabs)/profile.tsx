// ProfileServer.tsx
import React, { useEffect, useState, useReducer } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authReducer, initialAuthState } from "@/services/authReducer";
import MovieCard from "@/components/MovieCard";
import AuthForm from "@/components/AuthForm";
import { useRouter } from "expo-router";
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchWatchedHistory,
  fetchFavoriteMovies,
  addFavoriteMovie,
  removeFavoriteMovie,
} from "@/services/apiService";
import { fetchMovieDetails } from "@/services/api";
import { EventBus } from "@/services/eventBus";
import ForgotPasswordScreen from "@/components/ForgotPasswordScreen";

const Profile = () => {
  const router = useRouter();

  // ------------------ STATE ------------------
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState("user");
  const [watchedMovies, setWatchedMovies] = useState<any[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [loadingWatched, setLoadingWatched] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [tmdbMovies, setTmdbMovies] = useState<{ [key: string]: any }>({});
  const [reloadWatched, setReloadWatched] = useState(0);
  const [showForgot, setShowForgot] = useState(false);

  // ------------------ LOAD TOKEN + USER LÚC KHỞI ĐỘNG ------------------
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("currentUser");
        if (savedUser) {
          dispatch({ type: "LOGIN", payload: JSON.parse(savedUser) });
        }
      } catch (err) {
        console.error("Lỗi khi khởi tạo user:", err);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  // ------------------ FETCH USER DATA ------------------
  const loadUserData = async () => {
    if (!state.user) return;
    setLoadingWatched(true);
    setLoadingFavorites(true);
    try {
      const watched = await fetchWatchedHistory(state.user._id);
      const favorites = await fetchFavoriteMovies(state.user._id);
      setWatchedMovies(watched);
      setFavoriteMovies(favorites);
    } catch (err) {
      // Lỗi đã được xử lý trong apiService
    } finally {
      setLoadingWatched(false);
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) loadUserData();
  }, [state.isAuthenticated]);

  // Reload watched and favorite movies when user logs in
  useEffect(() => {
    const reload = () => loadUserData();
    EventBus.on("reloadWatched", reload);
    EventBus.on("reloadFavorites", reload);
    return () => {
      EventBus.off("reloadWatched", reload);
      EventBus.off("reloadFavorites", reload);
    };
  }, [state.isAuthenticated]);

  // Fetch TMDB info for watched movies without movie
  useEffect(() => {
    const fetchMissingMovies = async () => {
      const missing = watchedMovies.filter(
        (item) => !item.movie && item.tmdbId && !tmdbMovies[item.tmdbId]
      );
      for (const item of missing) {
        try {
          const movieData = await fetchMovieDetails(String(item.tmdbId));
          setTmdbMovies((prev) => ({ ...prev, [item.tmdbId]: movieData }));
        } catch { }
      }
    };
    if (watchedMovies.length > 0) fetchMissingMovies();
  }, [watchedMovies]);

  // ------------------ API CALLS ------------------
  const handleRegister = async () => {
    try {
      await registerUser(email, password, avatarUrl, role);
      setMode("login");
      setPassword("");
    } catch (err) {
      // Lỗi đã được xử lý trong apiService
    }
  };

  const handleLogin = async () => {
    try {
      const user = await loginUser(email, password);
      dispatch({ type: "LOGIN", payload: user });
    } catch (err) {
      // Lỗi đã được xử lý trong apiService
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch({ type: "LOGOUT" });
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  const handleAddFavorite = async (movieId: string) => {
    try {
      await addFavoriteMovie(state.user!._id, movieId);
      await loadUserData(); // Cập nhật lại danh sách
    } catch (err) {
      // Lỗi đã được xử lý trong apiService
    }
  };

  const handleRemoveFavorite = async (movieId: string) => {
    try {
      await removeFavoriteMovie(state.user!._id, movieId);
      await loadUserData(); // Cập nhật lại danh sách
    } catch (err) {
      // Lỗi đã được xử lý trong apiService
    }
  };

  // ------------------ RENDER ------------------
  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ====== Chưa đăng nhập ======
  if (!state.isAuthenticated) {
    if (showForgot) {
      return (
        <ForgotPasswordScreen onBack={() => setShowForgot(false)} />
      );
    }
    return (
      <AuthForm
        mode={mode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        toggleMode={() => setMode(mode === "login" ? "register" : "login")}
        onForgotPassword={() => setShowForgot(true)} // Thêm prop này
      />
    );
  }

  // ====== Đã đăng nhập ======
  const { email: userEmail, avatarUrl: userAvatar, createdAt, role: userRole } = state.user!;

  return (
    <ScrollView className="flex-1 bg-primary px-6 py-8 pb-20">
      {/* ---------- HEADER ---------- */}
      <View className="items-center mb-8">
        <Image source={{ uri: userAvatar }} className="w-32 h-32 rounded-full border-4 border-accent mb-4" />
        <Text className="text-light-100 text-xl font-bold">{userEmail}</Text>
        <Text className="text-light-300 text-sm mt-1">Ngày tạo: {new Date(createdAt).toLocaleDateString()}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-red-400 text-sm mt-3 underline">Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- ADMIN NAV ---------- */}
      {userRole === "admin" && (
        <TouchableOpacity className="bg-accent rounded-xl p-4 mb-4" onPress={() => router.push("/admin")}>
          <Text className="text-light-100 text-xl font-bold">🛠 Trang Admin</Text>
        </TouchableOpacity>
      )}

      {/* ---------- WATCHED MOVIES ---------- */}
      <View className="mt-10">
        <Text className="text-lg text-light-100 font-bold mb-3">Phim đã xem</Text>
        {loadingWatched ? (
          <ActivityIndicator />
        ) : watchedMovies.length === 0 ? (
          <Text className="text-light-300 text-center mb-6">
            Bạn chưa xem phim nào!
          </Text>
        ) : (
          <FlatList
            data={watchedMovies}
            keyExtractor={(item) => `watched-${item._id || item.id}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "flex-start", gap: 20, paddingRight: 5, marginBottom: 10 }}
            scrollEnabled={false}
            renderItem={({ item }) => {
              if (item.movie) {
                return (
                  <MovieCard
                    {...item.movie}
                    poster_path={item.movie.posterUrl}
                    vote_average={item.movie.rating}
                    release_date={item.movie.releaseDate}
                  />
                );
              }
              if (tmdbMovies[item.tmdbId]) {
                return <MovieCard {...tmdbMovies[item.tmdbId]} />;
              }
              // Đang fetch hoặc lỗi, hiển thị placeholder
              return (
                <View style={{ width: 100, height: 150, backgroundColor: "#222", borderRadius: 8, margin: 8 }} />
              );
            }}
          />
        )}
      </View>

      {/* ---------- FAVORITE MOVIES ---------- */}
      {/* <View className="mt-10">
        <Text className="text-lg text-light-100 font-bold mb-3">Phim yêu thích</Text>
        {loadingFavorites ? (
          <ActivityIndicator />
        ) : (
          <>
            <TouchableOpacity
              className="bg-accent rounded-xl p-4 mb-4"
              onPress={() => handleAddFavorite("movie_id_here")} // Thay bằng movieId thực tế
            >
              <Text className="text-light-100 text-xl font-bold">Thêm phim yêu thích</Text>
            </TouchableOpacity>
            <FlatList
              data={favoriteMovies}
              keyExtractor={(item) => `favorite-${item._id || item.id}`}
              numColumns={3}
              columnWrapperStyle={{ justifyContent: "flex-start", gap: 20, paddingRight: 5, marginBottom: 10 }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View>
                  <MovieCard
                    {...item}
                    poster_path={item.posterUrl}
                    vote_average={item.rating}
                    release_date={item.releaseDate}
                  />
                  <TouchableOpacity
                    className="bg-red-400 rounded-xl p-2 mt-2"
                    onPress={() => handleRemoveFavorite(item._id)}
                  >
                    <Text className="text-light-100 text-center">Xóa khỏi yêu thích</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </>
        )}
      </View> */}

      {/* ---------- FOOTER ---------- */}
      <View className="border-t border-light-300 pt-6 mt-10 pb-36">
        <Text className="text-light-200 font-bold mb-2">Liên hệ đội ngũ phát triển:</Text>
        <Text className="text-light-300">📧 Email: dev@reactnative.com</Text>
        <Text className="text-light-300">📞 Hotline: 0123 456 789</Text>
      </View>
    </ScrollView>
  );
};

export default Profile;