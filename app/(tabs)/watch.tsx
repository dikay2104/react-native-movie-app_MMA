import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WatchScreen() {
    const { videoUrl } = useLocalSearchParams();
    const url =
        typeof videoUrl === 'string'
            ? videoUrl
            : Array.isArray(videoUrl)
                ? videoUrl[0]
                : '';

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
            allowsFullscreenVideo
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
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
});
