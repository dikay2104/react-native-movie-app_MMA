// components/AuthForm.tsx – version kết nối với server
import React from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView
} from "react-native"

export default function AuthForm({
    mode,
    email,
    setEmail,
    password,
    setPassword,
    avatarUrl,
    setAvatarUrl,
    role,
    setRole,
    onSubmit,
    toggleMode,
    onOpenUserList
}: {
    mode: "login" | "register"
    email: string
    setEmail: (v: string) => void
    password: string
    setPassword: (v: string) => void
    avatarUrl: string
    setAvatarUrl: (v: string) => void
    role: string
    setRole: (v: string) => void
    onSubmit: () => void
    toggleMode: () => void
    onOpenUserList?: () => void // optional to fix error
}) {
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
                <>
                    <TextInput
                        className="w-full bg-light-200 text-dark-100 rounded-md p-3 mb-4"
                        placeholder="Avatar URL"
                        placeholderTextColor="#555"
                        value={avatarUrl}
                        onChangeText={setAvatarUrl}
                    />
                    <TextInput
                        className="w-full bg-light-200 text-dark-100 rounded-md p-3 mb-6"
                        placeholder="Role (admin/user)"
                        placeholderTextColor="#555"
                        value={role}
                        onChangeText={setRole}
                    />
                </>
            )}

            <TouchableOpacity
                className="bg-accent p-4 rounded-xl w-full mb-4"
                onPress={onSubmit}
            >
                <Text className="text-dark-200 font-semibold text-center">
                    {mode === "login" ? "Đăng nhập" : "Đăng ký"}
                </Text>
            </TouchableOpacity>

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
    )
}
