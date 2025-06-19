import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import { fetchMovieDetails } from "@/services/api"; // Đảm bảo path đúng

export default function EditMovie() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadMovie = async () => {
      try {
        setLoading(true);
        const movie = await fetchMovieDetails(id as string);
        setTitle(movie.title || "");
        setPosterPath(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
        setReleaseDate(movie.release_date || "");
        setRuntime(movie.runtime?.toString() || "");
        setVoteAverage(movie.vote_average?.toString() || "");
        setVoteCount(movie.vote_count?.toString() || "");
        setOverview(movie.overview || "");
        setGenres(movie.genres?.map((g) => g.name).join(", ") || "");
        setBudget((movie.budget / 1_000_000)?.toString() || "");
        setRevenue((movie.revenue / 1_000_000)?.toString() || "");
        setProductionCompanies(
          movie.production_companies?.map((c) => c.name).join(", ") || ""
        );
      } catch (err) {
        Alert.alert("❌", "Không thể tải dữ liệu phim.");
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id]);

  const handleUpdate = () => {
    console.log("Updating movie:", {
      id,
      title,
      releaseDate,
      runtime,
      voteAverage,
      voteCount,
      overview,
      genres,
      budget,
      revenue,
      productionCompanies,
      posterPath,
    });
    Alert.alert("✅", "Phim đã được cập nhật (mock)");
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("🗑️ Xác nhận", "Bạn có chắc muốn xoá phim này?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => {
          console.log("Deleted movie ID:", id);
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri: posterPath,
          }}
          style={styles.poster}
        />

        <View style={styles.form}>
          <TextInput placeholder="Poster URL" style={styles.input} value={posterPath} onChangeText={setPosterPath} />
          <TextInput placeholder="Tiêu đề phim" style={styles.input} value={title} onChangeText={setTitle} />
          <TextInput placeholder="Ngày phát hành" style={styles.input} value={releaseDate} onChangeText={setReleaseDate} />
          <TextInput placeholder="Thời lượng" style={styles.input} value={runtime} onChangeText={setRuntime} />
          <TextInput placeholder="Điểm đánh giá" style={styles.input} value={voteAverage} onChangeText={setVoteAverage} />
          <TextInput placeholder="Số lượt đánh giá" style={styles.input} value={voteCount} onChangeText={setVoteCount} />
          <TextInput placeholder="Tóm tắt" style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={overview} onChangeText={setOverview} />
          <TextInput placeholder="Thể loại" style={styles.input} value={genres} onChangeText={setGenres} />
          <TextInput placeholder="Ngân sách (triệu USD)" style={styles.input} value={budget} onChangeText={setBudget} />
          <TextInput placeholder="Doanh thu (triệu USD)" style={styles.input} value={revenue} onChangeText={setRevenue} />
          <TextInput placeholder="Hãng sản xuất" style={styles.input} value={productionCompanies} onChangeText={setProductionCompanies} />

          <TouchableOpacity style={styles.createButton} onPress={handleUpdate}>
            <Text style={styles.createText}>💾 Cập nhật</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.createButton, { backgroundColor: "#DC2626", marginTop: 10 }]} onPress={handleDelete}>
            <Text style={styles.createText}>🗑️ Xoá phim</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  scrollContent: { paddingBottom: 100 },
  poster: { width: "100%", height: 400 },
  form: { padding: 20 },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  createButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  createText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
