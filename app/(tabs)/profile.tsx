// import { icons } from "@/constants/icons";
// import { View, Text, Image } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const Profile = () => {
//   return (
//     <SafeAreaView className="bg-primary flex-1 px-10">
//       <View className="flex justify-center items-center flex-1 flex-col gap-5">
//         <Image source={icons.person} className="size-10" tintColor="#fff" />
//         <Text className="text-gray-500 text-base">Profile</Text>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Profile;





// // screens/LoginScreen.js
// import React, { useState } from 'react';
// import { View, Text, TextInput, Pressable, ImageBackground } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { images } from '@/constants/images'; // giả sử bạn có ảnh tại đây

// export default function LoginScreen() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = async () => {
//     try {
//       // Xử lý đăng nhập
//       if (email === '' || password === '') {
//         alert('Vui lòng điền đầy đủ thông tin');
//         return;
//       }
//       // Giả sử bạn có một hàm đăng nhập
//       // await login(email, password
//       // );
//       console.log('Đăng nhập thành công với email:', email);
//       // Chuyển hướng
//       // navigation.navigate('Home');
//     } catch (err) {
//       console.error('Login error:', err);
//     }
//   };

//   return (
//     <ImageBackground
//       source={images.bg} // <-- ảnh từ thư mục assets
//       resizeMode="cover"
//       className="flex-1"
//     >
//       <View className="flex-1 bg-black/70 px-6 justify-center">
//         <Text className="text-light-100 text-2xl font-bold mb-8 text-center">
//           Sign in to your account!
//         </Text>

//         <TextInput
//           placeholder="Email"
//           placeholderTextColor="#A8B5DB"
//           className="bg-secondary text-light-100 px-4 py-3 rounded-xl mb-4"
//           value={email}
//           onChangeText={setEmail}
//         />
//         <TextInput
//           placeholder="Mật khẩu"
//           placeholderTextColor="#A8B5DB"
//           className="bg-secondary text-light-100 px-4 py-3 rounded-xl mb-6"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//         />

//         <Pressable onPress={handleLogin} className="bg-accent py-3 rounded-xl mb-4">
//           <Text className="text-primary text-center font-semibold">Đăng Nhập</Text>
//         </Pressable>

//         <Text className="text-light-200 text-center">
//           Chưa có tài khoản?{' '}
//           <Text className="text-accent">Đăng ký</Text>
//         </Text>
//       </View>
//     </ImageBackground>
//   );
// }



// ProfileScreen.tsx
import React, { useEffect, useState } from "react"
import { View, Text, Image, TouchableOpacity, ScrollView, FlatList, } from "react-native"
import { useNavigation } from "@react-navigation/native"
import MovieCard from "@/components/MovieCard"

const Profile = () => {
  const navigation = useNavigation()

  // Mock user data
  const user = {
    email: "12312312@gmail.com",
    avatarUrl: "https://example.com/avatar.jpg",
    createdAt: "2023-01-01T00:00:00Z",
    role: "admin", // or "user"
  }
  const { email, avatarUrl, createdAt, role } = user

  // 🎬 Mock watched movies data
  const mockWatchedMovies = [
    {
      id: 550,
      title: "Fight Club",
      poster_path: "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
      vote_average: 8.4,
      release_date: "1999-10-15"
    },
    {
      id: 27205,
      title: "Interstellar",
      poster_path: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
      vote_average: 8.6,
      release_date: "2014-11-07",
    },
  ]


  type WatchedMovie = {
    id: number; // đổi sang number để phù hợp với MovieCard
    poster_path: string; // URL ảnh poster phim
    title: string;
    vote_average: number; // điểm đánh giá (IMDb, TMDB,...)
    release_date: string; // dạng ISO string, ví dụ "2023-05-12"
  }
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([])
  const [watchedLoading, setWatchedLoading] = useState(true)
  const [watchedError, setWatchedError] = useState<Error | null>(null)

  useEffect(() => {
    // giả lập gọi API
    const fetchWatched = async () => {
      try {
        setWatchedLoading(true)
        await new Promise((res) => setTimeout(res, 500)) // simulate delay
        setWatchedMovies(mockWatchedMovies)
      } catch (err) {
        setWatchedError(err as Error)
      } finally {
        setWatchedLoading(false)
      }
    }

    fetchWatched()
  }, [])

  return (
    <ScrollView className="flex-1 bg-primary px-6 py-8">
      <View className="items-center mb-8">
        <Image
          source={{ uri: avatarUrl }}
          className="w-32 h-32 rounded-full border-4 border-accent mb-4"
        />
        <Text className="text-light-100 text-xl font-bold">{email}</Text>
        <Text className="text-light-300 text-sm mt-1">
          Ngày tạo: {new Date(createdAt).toLocaleDateString()}
        </Text>
      </View>

      {role === "admin" && (
        <TouchableOpacity
          className="bg-accent rounded-xl p-4 mb-10"
        // onPress={() => navigation.navigate("AdminScreen")}
        >
          <Text className="text-dark-200 text-center font-semibold">
            Đến trang Admin
          </Text>
        </TouchableOpacity>
      )}

      <View className="mt-10">
        <Text className="text-lg text-light-100 font-bold mb-3">
          Phim đã xem
        </Text>

        {watchedLoading ? (
          <Text className="text-light-300">Đang tải...</Text>
        ) : watchedError ? (
          <Text className="text-red-500">Lỗi: {watchedError.message}</Text>
        ) : (
          <FlatList
            data={watchedMovies}
            renderItem={({ item }) => <MovieCard adult={false} backdrop_path={""} genre_ids={[]} original_language={""} original_title={""} overview={""} popularity={0} video={false} vote_count={0} {...item} />}
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

      <View className="border-t border-light-300 pt-6 mt-10">
        <Text className="text-light-200 font-bold mb-2">
          Liên hệ đội ngũ phát triển:
        </Text>
        <Text className="text-light-300">📧 Email: dev@tikovia.com</Text>
        <Text className="text-light-300">📞 Hotline: 0123 456 789</Text>
      </View>
    </ScrollView>
  )
}

export default Profile

