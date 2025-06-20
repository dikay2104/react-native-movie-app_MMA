// Profile.tsx (không dùng bcrypt, lưu mật khẩu thuần, có nút đến trang Admin nếu là admin)
import React, { useEffect, useState, useReducer } from "react"
import {
  View, Text, Image, TouchableOpacity, ScrollView, FlatList,
  Alert, Modal
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authReducer, initialAuthState } from "@/services/authReducer"
import MovieCard from "@/components/MovieCard"
import AuthForm from "@/components/AuthForm"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();
  const navigation = useNavigation()
  const [state, dispatch] = useReducer(authReducer, initialAuthState)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [role, setRole] = useState("user")
  const [users, setUsers] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)

  const loadUsers = async () => {
    const usersStr = await AsyncStorage.getItem("users")
    setUsers(usersStr ? JSON.parse(usersStr) : [])
  }

  useEffect(() => {
    const loadUser = async () => {
      const userJson = await AsyncStorage.getItem("currentUser")
      if (userJson) {
        const parsed = JSON.parse(userJson)
        dispatch({ type: "LOGIN", payload: parsed })
      }
      await loadUsers()
    }
    loadUser()
  }, [])

  const handleRegister = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Vui lòng nhập đầy đủ thông tin")
        return
      }

      const usersStr = await AsyncStorage.getItem("users")
      const users = usersStr ? JSON.parse(usersStr) : []

      const existing = users.find((u: any) => u.email === email)
      if (existing) {
        Alert.alert("Email đã tồn tại")
        return
      }

      const newUser = {
        email,
        avatarUrl: avatarUrl || "https://example.com/default.jpg",
        createdAt: new Date().toISOString(),
        role,
        password,
      }

      const updatedUsers = [...users, newUser]
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers))

      Alert.alert("Đăng ký thành công")
      setMode("login")
      setPassword("")
      await loadUsers()
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err)
      Alert.alert("Có lỗi xảy ra khi đăng ký")
    }
  }

  const handleLogin = async () => {
    try {
      const usersStr = await AsyncStorage.getItem("users")
      const users = usersStr ? JSON.parse(usersStr) : []

      const foundUser = users.find((u: any) => u.email === email)
      if (!foundUser) {
        Alert.alert("Không tìm thấy email")
        return
      }

      if (foundUser.password !== password) {
        Alert.alert("Sai mật khẩu")
        return
      }

      await AsyncStorage.setItem("currentUser", JSON.stringify(foundUser))
      dispatch({ type: "LOGIN", payload: foundUser })
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err)
      Alert.alert("Có lỗi xảy ra khi đăng nhập")
    }
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem("currentUser")
    dispatch({ type: "LOGOUT" })
  }

  const deleteUser = async (targetEmail: string) => {
    const filtered = users.filter((u) => u.email !== targetEmail)
    await AsyncStorage.setItem("users", JSON.stringify(filtered))
    setUsers(filtered)
    Alert.alert("Đã xoá tài khoản")
  }

  type WatchedMovie = {
    id: number
    title: string
    poster_path: string
    vote_average: number
    release_date: string
  }
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([])
  const [watchedLoading, setWatchedLoading] = useState(true)

  useEffect(() => {
    if (!state.isAuthenticated) return

    const fetchWatched = async () => {
      setWatchedLoading(true)
      await new Promise((res) => setTimeout(res, 500))
      setWatchedMovies([
        {
          id: 550,
          title: "Fight Club",
          poster_path: "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
          vote_average: 8.4,
          release_date: "1999-10-15",
        },
        {
          id: 27205,
          title: "Interstellar",
          poster_path: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
          vote_average: 8.6,
          release_date: "2014-11-07",
        },
      ])
      setWatchedLoading(false)
    }

    fetchWatched()
  }, [state.isAuthenticated])

  if (!state.isAuthenticated) {
    return (
      <>
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
          onOpenUserList={() => setModalVisible(true)}
        />

        <Modal visible={modalVisible} animationType="slide">
          <ScrollView className="bg-primary px-4 pt-10">
            <Text className="text-light-100 text-xl font-bold mb-4">Tài khoản đã lưu</Text>
            {users.map((u, idx) => (
              <View key={idx} className="bg-dark-100 mb-4 p-4 rounded-xl">
                <Text className="text-light-100">📧 {u.email}</Text>
                <Text className="text-light-300">🔑 Mật khẩu: {u.password}</Text>
                <Text className="text-light-300">🧑 Role: {u.role}</Text>
                <TouchableOpacity onPress={() => deleteUser(u.email)} className="mt-2">
                  <Text className="text-red-400 underline">Xoá</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mb-10">
              <Text className="text-accent text-center mt-4 underline">Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      </>
    )
  }

  const { email: userEmail, avatarUrl: userAvatar, createdAt, role: userRole } = state.user!

  return (
    <ScrollView className="flex-1 bg-primary px-6 py-8 pb-20">
      <View className="items-center mb-8">
        <Image source={{ uri: userAvatar }} className="w-32 h-32 rounded-full border-4 border-accent mb-4" />
        <Text className="text-light-100 text-xl font-bold">{userEmail}</Text>
        <Text className="text-light-300 text-sm mt-1">
          Ngày tạo: {new Date(createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-red-400 text-sm mt-3 underline">Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      {userRole === "admin" && (
        <TouchableOpacity
          className="bg-accent rounded-xl p-4 mb-4"
          onPress={() => router.push("/admin")}      // TODO: Replace with actual admin screen navigation
        >
          <Text className="text-light-100 text-xl font-bold">🛠 Trang Admin</Text>
        </TouchableOpacity>
      )}

      <View className="mt-10">
        <Text className="text-lg text-light-100 font-bold mb-3">Phim đã xem</Text>
        {watchedLoading ? (
          <Text className="text-light-300">Đang tải...</Text>
        ) : (
          <FlatList
            data={watchedMovies}
            renderItem={({ item }) => (
              <MovieCard
                adult={false}
                backdrop_path={""}
                genre_ids={[]}
                original_language={""}
                original_title={""}
                overview={""}
                popularity={0}
                video={false}
                vote_count={0}
                {...item}
              />
            )}
            keyExtractor={(item) => `watched-${item.id}`}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 20,
              paddingRight: 5,
              marginBottom: 10,
            }}
            scrollEnabled={false}
            className="mt-2"
          />
        )}
      </View>

      <View className="border-t border-light-300 pt-6 mt-10 pb-36">
        <Text className="text-light-200 font-bold mb-2">Liên hệ đội ngũ phát triển:</Text>
        <Text className="text-light-300">📧 Email: dev@tikovia.com</Text>
        <Text className="text-light-300">📞 Hotline: 0123 456 789</Text>
      </View>
    </ScrollView>
  )
}

export default Profile
