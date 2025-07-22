import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert
} from "react-native";

export default function AuthForm({
    mode,
    email,
    setEmail,
    password,
    setPassword,
    onSubmit,
    toggleMode,
    onOpenUserList,
    onForgotPassword
}: {
    mode: "login" | "register"
    email: string
    setEmail: (v: string) => void
    password: string
    setPassword: (v: string) => void
    onSubmit: () => void
    toggleMode: () => void
    onOpenUserList?: () => void
    onForgotPassword?: () => void
}) {
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {
        if (mode === "register" && password !== confirmPassword) {
            Alert.alert("Mật khẩu nhập lại không khớp", "Vui lòng kiểm tra lại mật khẩu.");
            return;
        }
        onSubmit();
    };

    return (
        <ScrollView className="flex-1 bg-primary px-6 pt-20">
            <Text className="text-light-100 text-2xl mb-6 font-bold text-center">
                {mode === "login" ? "Đăng nhập" : "Đăng ký"}
            </Text>

            <TextInput
                className="w-full bg-light-200 text-dark-100 rounded-md p-3 mb-4"
                placeholder="Email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                className="w-full bg-light-200 text-dark-100 rounded-md p-3 mb-4"
                placeholder="Mật khẩu"
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {mode === "register" && (
                <TextInput
                    className="w-full bg-light-200 text-dark-100 rounded-md p-3 mb-6"
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#555"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            )}

            <TouchableOpacity
                className="bg-accent p-4 rounded-xl w-full mb-4"
                onPress={handleSubmit}
            >
                <Text className="text-dark-200 font-semibold text-center">
                    {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                </Text>
            </TouchableOpacity>

            {mode === "login" && onForgotPassword && (
                <TouchableOpacity onPress={onForgotPassword}>
                    <Text className="text-light-300 text-center underline mb-2">
                        Quên mật khẩu?
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={toggleMode}>
                <Text className="text-light-300 text-center underline mb-6">
                    {mode === "login"
                        ? "Chưa có tài khoản? Đăng ký"
                        : "Đã có tài khoản? Đăng nhập"}
                </Text>
            </TouchableOpacity>

            {mode === "register" && onOpenUserList && (
                <TouchableOpacity
                    className="border border-light-300 rounded-xl p-3"
                    onPress={onOpenUserList}
                >
                    <Text className="text-light-300 text-center">
                        Xem danh sách tài khoản (dev)
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}