// services/apiService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const BASE_URL = "http://192.168.0.3:5000/api"; // Thay đổi theo địa chỉ máy chủ của bạn

if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in environment variables");
}

// Tạo axios instance
const api = axios.create({ baseURL: BASE_URL });

// Tự động đính kèm token vào header
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const DEFAULT_AVATAR_URL = "https://i.pravatar.cc/300?img=58";

// Đăng ký người dùng
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

// Đăng nhập người dùng
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

// Đăng xuất người dùng
export const logoutUser = async () => {
    await AsyncStorage.multiRemove(["currentUser", "token"]);
};

// ------------------ USER PROFILE ------------------
// Lấy danh sách phim đã xem
export const fetchWatchedMovies = async (userId: string) => {
    try {
        const { data } = await api.get(`/users/${userId}/watched`);
        return data || [];
    } catch (err: any) {
        Alert.alert(
            err.response?.data?.message || "Lỗi lấy danh sách phim đã xem"
        );
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Lấy danh sách phim yêu thích
export const fetchFavoriteMovies = async (userId: string) => {
    try {
        const { data } = await api.get(`/favorites/${userId}`);
        return data || [];
    } catch (err: any) {
        Alert.alert(
            err.response?.data?.message || "Lỗi lấy danh sách phim yêu thích"
        );
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Thêm phim đã xem
export const addWatchedMovie = async (userId: string, movieId: string) => {
    try {
        const { data } = await api.post(`/users/${userId}/watched/${movieId}`);
        Alert.alert(data.message || "Đã thêm vào danh sách phim đã xem");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi thêm phim đã xem");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Thêm phim yêu thích

export const addFavoriteMovie = async (userId: string, tmdbId: string, movieId?: string) => {
    try {
        const { data } = await api.post("/favorites", { userId, tmdbId, movieId });
        Alert.alert(data.message || "Đã thêm vào danh sách yêu thích");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi thêm phim yêu thích");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Xóa phim khỏi danh sách yêu thích
export const removeFavoriteMovie = async (userId: string, movieId: string) => {
    try {
        const { data } = await api.delete("/favorites", { data: { userId, movieId } });
        Alert.alert(data.message || "Đã xóa khỏi danh sách yêu thích");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi xóa phim yêu thích");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// ------------------ CRUD MOVIES ------------------
// Tạo phim mới
export const createMovie = async (movieData: {
  posterUrl: string;
  title: string;
  releaseDate: string; // ISO date string, e.g. "2025-01-01"
  runtime: number;
  rating: number;
  voteCount: number;
  overview: string;
  genres?: string[]; // optional
  budgetUSD?: number;
  revenueUSD?: number;
  productionCompany: string;
}) => {
  try {
    const { data } = await api.post("/movies", movieData);
    return data;
  } catch (err: any) {
    Alert.alert(err.response?.data?.message || "Lỗi tạo phim");
    console.log("🔥 err.response", err.response?.data);
    throw err;
  }
};


// Lấy tất cả phim
export const getAllMovies = async () => {
    try {
        const { data } = await api.get("/movies");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi lấy danh sách phim");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Lấy phim theo ID
export const getMovieById = async (movieId: string) => {
    try {
        const { data } = await api.get(`/movies/${movieId}`);
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi lấy thông tin phim");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Cập nhật phim
export const updateMovie = async (
    movieId: string,
    movieData: {
        title?: string;
        posterUrl?: string;
        rating?: number;
        releaseDate?: string;
        [key: string]: any;
    }
) => {
    try {
        const { data } = await api.put(`/movies/${movieId}`, movieData);
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi cập nhật phim");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Xóa phim
export const deleteMovie = async (movieId: string) => {
    try {
        const { data } = await api.delete(`/movies/${movieId}`);
        Alert.alert(data.message || "Đã xóa phim");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi xóa phim");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// ------------------ CRUD USER ------------------
// Lấy tất cả người dùng
export const getAllUsers = async () => {
    try {
        const { data } = await api.get("/users");
        return data;
    } catch (err: any) {
        Alert.alert(
            err.response?.data?.message || "Lỗi lấy danh sách người dùng"
        );
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Lấy thông tin user theo ID
export const getUserById = async (userId: string) => {
    try {
        const { data } = await api.get(`/users/${userId}`);
        return data;
    } catch (err: any) {
        Alert.alert(
            err.response?.data?.message || "Lỗi lấy thông tin người dùng"
        );
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Cập nhật thông tin user
export const updateUser = async (
    userId: string,
    userData: {
        email?: string;
        password?: string;
        avatarUrl?: string;
        role?: string;
        [key: string]: any;
    }
) => {
    try {
        const { data } = await api.put(`/users/${userId}`, userData);
        await AsyncStorage.setItem("currentUser", JSON.stringify(data)); // Cập nhật AsyncStorage
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi cập nhật người dùng");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};

// Xóa user
export const deleteUser = async (userId: string) => {
    try {
        const { data } = await api.delete(`/users/${userId}`);
        Alert.alert(data.message || "Đã xóa người dùng");
        return data;
    } catch (err: any) {
        Alert.alert(err.response?.data?.message || "Lỗi xóa người dùng");
        console.log("🔥 err.response", err.response?.data);
        throw err;
    }
};
