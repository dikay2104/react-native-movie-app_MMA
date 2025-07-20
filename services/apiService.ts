// services/apiService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const BASE_URL = 'http://172.16.0.217:5000/api';

// Tạo axios instance
const api = axios.create({ baseURL: BASE_URL });

// Tự động đính kèm token vào header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const DEFAULT_AVATAR_URL = "https://i.pravatar.cc/300?img=58";

export const registerUser = async (
  email: string,
  password: string,
  avatarUrl: string,
  role: string
) => {
  if (!email || !password) {
    Alert.alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }
  try {
    const finalAvatar = avatarUrl.trim() || DEFAULT_AVATAR_URL;
    const response = await api.post("/auth/register", {
      email,
      password,
      avatarUrl: finalAvatar,
      role,
    });
    Alert.alert("Đăng ký thành công, đăng nhập ngay!");
    return response.data;
  } catch (err: any) {
    Alert.alert(err.response?.data?.message || "Đăng ký thất bại");
    console.log("🔥 err.response", err.response?.data);
    throw err;
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    Alert.alert("Nhập email & mật khẩu");
    return;
  }
  try {
    const { data } = await api.post("/auth/login", { email, password });
    const { user, token } = data;
    await AsyncStorage.multiSet([
      ["currentUser", JSON.stringify(user)],
      ["token", token],
    ]);
    return user;
  } catch (err: any) {
    Alert.alert(err.response?.data?.message || "Đăng nhập thất bại");
    console.log("🔥 err.response", err.response?.data);
    throw err;
  }
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove(["currentUser", "token"]);
};

export const fetchWatchedMovies = async (userId: string) => {
  try {
    const { data } = await api.get(`/users/${userId}`);
    return data.watchedMovies || [];
  } catch (err) {
    console.error("Lỗi load watched", err);
    throw err;
  }
};