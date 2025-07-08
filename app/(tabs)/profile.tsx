// ProfileServer.tsx – phiên bản dùng API backend (Express + MongoDB)

import React, { useEffect, useState, useReducer } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { authReducer, initialAuthState } from "@/services/authReducer";
import MovieCard from "@/components/MovieCard";
import AuthForm from "@/components/AuthForm";
import { useRouter } from "expo-router";

/**
 * =============================
 * axios instance
 * =============================
 * Thay đổi BASE_URL để trỏ tới server Node/Express của bạn.
 * Ví dụ: http://192.168.1.10:3000/api  (LAN)  hoặc  https://your-domain.com/api
 */
const BASE_URL = "http://192.168.1.6:5000/api";
const api = axios.create({ baseURL: BASE_URL });

// Tự đính kèm token vào header "Authorization: Bearer <token>"
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
  const [loadingWatched, setLoadingWatched] = useState(false);
  const [initializing, setInitializing] = useState(true); // kiểm tra token khi mở app

  // ------------------ LOAD TOKEN + USER LÚC KHỞI ĐỘNG ------------------
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("currentUser");
        if (savedUser) {
          dispatch({ type: "LOGIN", payload: JSON.parse(savedUser) });
        }
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  // ------------------ API CALLS ------------------
  const DEFAULT_AVATAR_URL = "https://i.pravatar.cc/300?img=58";

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert("Vui lòng nhập đầy đủ thông tin");
    try {
      const finalAvatar = avatarUrl.trim() || DEFAULT_AVATAR_URL;

      await api.post("/auth/register", { email, password, avatarUrl: finalAvatar, role });
      Alert.alert("Đăng ký thành công, đăng nhập ngay!");
      setMode("login");
      setPassword("");
    } catch (err: any) {
      Alert.alert(err.response?.data?.message || "Đăng ký thất bại");
      console.log("🔥 err.response", err.response?.data);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Nhập email & mật khẩu");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const { user, token } = data;
      await AsyncStorage.multiSet([
        ["currentUser", JSON.stringify(user)],
        ["token", token],
      ]);
      dispatch({ type: "LOGIN", payload: user });
    } catch (err: any) {
      Alert.alert(err.response?.data?.message || "Đăng nhập thất bại");
      console.log("🔥 err.response", err.response?.data)
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["currentUser", "token"]);
    dispatch({ type: "LOGOUT" });
  };

  // ------------------ FETCH WATCHED MOVIES ------------------
  const loadWatched = async () => {
    if (!state.user) return;
    setLoadingWatched(true);
    try {
      const { data } = await api.get(`/users/${state.user._id}`);
      setWatchedMovies(data.watchedMovies || []);
    } catch (err) {
      console.error("Lỗi load watched", err);
    } finally {
      setLoadingWatched(false);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) loadWatched();
  }, [state.isAuthenticated]);

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
    return (
      <AuthForm
        mode={mode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        role={role}
        setRole={setRole}
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        toggleMode={() => setMode(mode === "login" ? "register" : "login")}
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
        ) : (
          <FlatList
            data={watchedMovies}
            keyExtractor={(item) => `watched-${item._id || item.id}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "flex-start", gap: 20, paddingRight: 5, marginBottom: 10 }}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <MovieCard
                {...item}
                poster_path={item.posterUrl}
                vote_average={item.rating}
                release_date={item.releaseDate}
              />
            )}
          />
        )}
      </View>

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
