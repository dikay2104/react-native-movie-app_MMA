import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient"; // Cần cài đặt: npx expo install expo-linear-gradient
import { Ionicons } from "@expo/vector-icons"; // Cần cài đặt: npx expo install @expo/vector-icons
import { getAllUsers, deleteUser, updateUser } from "@/services/apiService";

export default function UserAdmin() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Định nghĩa màu sắc cho theme
    const colors = {
        background: "#0A0A0B",
        cardBackground: "#1A1A1B",
        primary: "#10B981",
        danger: "#DC2626",
        textPrimary: "#E5E5E5",
        textSecondary: "#A1A1AA",
        admin: "#10B981",
        user: "#F59E42",
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data || []);
        } catch (err) {
            // Error handled in apiService
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (userId: string) => {
        Alert.alert("Xác nhận", "Bạn có chắc muốn xóa người dùng này?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Xóa",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteUser(userId);
                        fetchUsers();
                    } catch (err) { }
                },
            },
        ]);
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        Alert.alert(
            "Thay đổi quyền người dùng",
            "Chọn quyền mới cho người dùng này:",
            [
                {
                    text: "Chuyển thành Admin",
                    onPress: async () => {
                        if (currentRole !== "admin") {
                            try {
                                await updateUser(userId, { role: "admin" });
                                fetchUsers();
                            } catch (err) { }
                        }
                    },
                },
                {
                    text: "Chuyển thành User",
                    onPress: async () => {
                        if (currentRole !== "user") {
                            try {
                                await updateUser(userId, { role: "user" });
                                fetchUsers();
                            } catch (err) { }
                        }
                    },
                },
                { text: "Hủy", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Image
                    source={item.avatarUrl ? { uri: item.avatarUrl } : require("../../assets/icons/user.png")}
                    style={styles.avatar}
                    defaultSource={require("../../assets/icons/user.png")}
                />
                <View style={styles.userText}>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text
                        style={[
                            styles.userRole,
                            { color: item.role === "admin" ? colors.admin : colors.user },
                        ]}
                    >
                        {item.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => handleUpdateRole(item._id, item.role)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="shield-checkmark" size={20} color={colors.textPrimary} />
                    <Text style={styles.buttonText}>Sửa role</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.danger }]}
                    onPress={() => handleDelete(item._id)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="trash" size={20} color={colors.textPrimary} />
                    <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#0A0A0B", "#1A1A1B", "#0A0A0B"]}
                style={StyleSheet.absoluteFill}
            >
                {/* Các điểm sáng mô phỏng ánh sao */}
                <View style={[styles.star, { top: "10%", left: "15%", width: 4, height: 4, opacity: 0.8 }]} />
                <View style={[styles.star, { top: "20%", left: "80%", width: 3, height: 3, opacity: 0.6 }]} />
                <View style={[styles.star, { top: "50%", left: "30%", width: 5, height: 5, opacity: 0.7 }]} />
                <View style={[styles.star, { top: "70%", left: "60%", width: 3, height: 3, opacity: 0.5 }]} />
                <View style={[styles.star, { top: "30%", left: "90%", width: 4, height: 4, opacity: 0.9 }]} />
            </LinearGradient>
            <View style={styles.header}>
                <Text style={styles.headerText}>👤 Quản lý Người dùng</Text>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    renderItem={renderUserItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Không có người dùng nào</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent", // Để gradient hiển thị
    },
    star: {
        position: "absolute",
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        opacity: 0.6,
    },
    header: {
        padding: 20,
        backgroundColor: "rgba(26, 26, 27, 0.9)", // Trong suốt nhẹ để thấy ánh sao
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 12,
    },
    headerText: {
        color: "#E5E5E5",
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    loadingText: {
        color: "#A1A1AA",
        fontSize: 16,
        marginTop: 12,
    },
    listContainer: {
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    userCard: {
        backgroundColor: "#1A1A1B",
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
        backgroundColor: "#2A2A2A",
    },
    userText: {
        flex: 1,
    },
    userEmail: {
        color: "#E5E5E5",
        fontSize: 16,
        fontWeight: "600",
    },
    userRole: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        marginHorizontal: 8,
    },
    buttonText: {
        color: "#E5E5E5",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        color: "#A1A1AA",
        fontSize: 16,
        textAlign: "center",
    },
});