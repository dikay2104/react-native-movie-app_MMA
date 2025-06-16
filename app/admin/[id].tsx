import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function EditMovie() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Dummy data
  const [title, setTitle] = useState("Inception");
  const [posterPath, setPosterPath] = useState("https://image.tmdb.org/t/p/w500/fake-poster.jpg");
  const [releaseDate, setReleaseDate] = useState("2010-07-16");
  const [runtime, setRuntime] = useState("148");
  const [voteAverage, setVoteAverage] = useState("8.8");
  const [voteCount, setVoteCount] = useState("30000");
  const [overview, setOverview] = useState("A thief who steals corporate secrets...");
  const [genres, setGenres] = useState("Action, Sci-Fi");
  const [budget, setBudget] = useState("160");
  const [revenue, setRevenue] = useState("830");
  const [productionCompanies, setProductionCompanies] = useState("Syncopy");

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{
            uri: posterPath.startsWith("http")
              ? posterPath
              : `https://image.tmdb.org/t/p/w500${posterPath}`,
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
          <TextInput placeholder="Ngân sách" style={styles.input} value={budget} onChangeText={setBudget} />
          <TextInput placeholder="Doanh thu" style={styles.input} value={revenue} onChangeText={setRevenue} />
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
