import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { sendOtpResetPassword, resetPasswordWithOtp } from "@/services/apiService";

export default function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) return Alert.alert("Vui lòng nhập email");
        setLoading(true);
        try {
            await sendOtpResetPassword(email);
            setStep(2);
        } catch {}
        setLoading(false);
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) return Alert.alert("Nhập đủ OTP và mật khẩu mới");
        try {
            await resetPasswordWithOtp(email, otp, newPassword);
            onBack(); // Quay lại màn đăng nhập
        } catch {}
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#18181B", padding: 24, justifyContent: "center" }}>
            {step === 1 ? (
                <>
                    <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 24 }}>Quên mật khẩu</Text>
                    <TextInput
                        style={{ backgroundColor: "#232323", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 16 }}
                        placeholder="Nhập email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TouchableOpacity
                        style={{
                            backgroundColor: loading ? "#6EE7B7" : "#10B981",
                            padding: 14,
                            borderRadius: 8,
                            marginBottom: 12,
                            opacity: loading ? 0.7 : 1,
                        }}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Gửi OTP về email</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={{ color: "#aaa", textAlign: "center", textDecorationLine: "underline" }}>Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 24 }}>Nhập OTP & mật khẩu mới</Text>
                    <TextInput
                        style={{ backgroundColor: "#232323", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 16 }}
                        placeholder="OTP"
                        placeholderTextColor="#aaa"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                    />
                    <TextInput
                        style={{ backgroundColor: "#232323", color: "#fff", borderRadius: 8, padding: 12, marginBottom: 16 }}
                        placeholder="Mật khẩu mới"
                        placeholderTextColor="#aaa"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity
                        style={{ backgroundColor: "#10B981", padding: 14, borderRadius: 8, marginBottom: 12 }}
                        onPress={handleResetPassword}
                    >
                        <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Đổi mật khẩu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onBack}>
                        <Text style={{ color: "#aaa", textAlign: "center", textDecorationLine: "underline" }}>Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}