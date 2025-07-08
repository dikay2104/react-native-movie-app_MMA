import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect } from "react";
import { Alert, Linking } from "react-native";

export const options = {
    headerShown: false, // 👈 Ẩn header
};

export default function WatchScreen() {
    const { videoUrl } = useLocalSearchParams();

    const url =
        typeof videoUrl === "string"
            ? videoUrl
            : Array.isArray(videoUrl)
                ? videoUrl[0]
                : "";

    useEffect(() => {
        // 👇 Bắt buộc xoay ngang khi mở video
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
        );
        return () => {
            ScreenOrientation.unlockAsync(); // 👈 Trả lại dọc khi thoát
        };
    }, []);

    if (!url) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Không có URL video</Text>
            </View>
        );
    }

    return (
        <WebView
            source={{ uri: url }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            allowsFullscreenVideo
            originWhitelist={["*"]}
            onShouldStartLoadWithRequest={(request) => {
                if (request.url !== url) {
                    // ⚠️ Link ngoài bị chặn: thông báo xác nhận
                    Alert.alert(
                        "Mở liên kết ngoài?",
                        "Trang web đang yêu cầu mở trình duyệt. Bạn có muốn tiếp tục?",
                        [
                            { text: "Huỷ", style: "cancel" },
                            {
                                text: "Mở trình duyệt",
                                onPress: () => Linking.openURL(request.url),
                            },
                        ]
                    );
                    return false;
                }
                return true;
            }}
            injectedJavaScript={`
    window.open = function(url) {
      window.location.href = url;
    };
    const style = document.createElement('style');
    style.innerHTML = '.ads, .ad_iframe, #banner {display:none!important}';
    document.head.appendChild(style);
    true;
  `}
            startInLoadingState
            renderLoading={() => (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        />

    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        color: "white",
        fontSize: 16,
    },
});
