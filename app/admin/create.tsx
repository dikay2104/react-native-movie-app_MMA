import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createMovie } from '@/services/apiService';

export default function CreateMovie() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [runtime, setRuntime] = useState("");
  const [voteAverage, setVoteAverage] = useState("");
  const [voteCount, setVoteCount] = useState("");
  const [overview, setOverview] = useState("");
  const [genres, setGenres] = useState("");
  const [budget, setBudget] = useState("");
  const [revenue, setRevenue] = useState("");
  const [productionCompanies, setProductionCompanies] = useState("");

  const handleCreate = async () => {
    try {
      const newMovie = {
        title,
        posterUrl: posterPath,
        releaseDate,
        runtime: Number(runtime),
        rating: Number(voteAverage),
        voteCount: Number(voteCount),
        overview,
        genres: genres.split(",").map(g => g.trim()), // optional
        budgetUSD: Number(budget),
        revenueUSD: Number(revenue),
        productionCompany: productionCompanies,
      };

      await createMovie(newMovie);
      Alert.alert("🎉 Thành công", "Phim đã được tạo!");
      router.back();
    } catch (err) {
      console.error("❌ Lỗi khi tạo phim:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={styles.header}>➕ Tạo phim mới</Text>

          <TextInput placeholder="Poster URL" style={styles.input} value={posterPath} onChangeText={setPosterPath} placeholderTextColor="#aaa" />
          <TextInput placeholder="Tên phim" style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor="#aaa" />
          <TextInput placeholder="Ngày phát hành" style={styles.input} value={releaseDate} onChangeText={setReleaseDate} placeholderTextColor="#aaa" />
          <TextInput placeholder="Thời lượng (phút)" style={styles.input} value={runtime} onChangeText={setRuntime} placeholderTextColor="#aaa" />
          <TextInput placeholder="Điểm đánh giá" style={styles.input} value={voteAverage} onChangeText={setVoteAverage} placeholderTextColor="#aaa" />
          <TextInput placeholder="Số lượt đánh giá" style={styles.input} value={voteCount} onChangeText={setVoteCount} placeholderTextColor="#aaa" />
          <TextInput placeholder="Tóm tắt" style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={overview} onChangeText={setOverview} placeholderTextColor="#aaa" />
          <TextInput placeholder="Thể loại (phân cách bằng dấu phẩy)" style={styles.input} value={genres} onChangeText={setGenres} placeholderTextColor="#aaa" />
          <TextInput placeholder="Ngân sách (triệu USD)" style={styles.input} value={budget} onChangeText={setBudget} placeholderTextColor="#aaa" />
          <TextInput placeholder="Doanh thu (triệu USD)" style={styles.input} value={revenue} onChangeText={setRevenue} placeholderTextColor="#aaa" />
          <TextInput placeholder="Hãng sản xuất" style={styles.input} value={productionCompanies} onChangeText={setProductionCompanies} placeholderTextColor="#aaa" />

          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createText}>💾 Lưu phim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  scrollContent: { paddingBottom: 100 },
  form: { padding: 20 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  createText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
