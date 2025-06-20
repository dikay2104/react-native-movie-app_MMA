// services/authReducer.ts
export type AuthState = {
    isAuthenticated: boolean;
    user: null | {
        email: string;
        avatarUrl: string;
        createdAt: string;
        role: string;
    };
};

export type AuthAction =
    | { type: "LOGIN"; payload: AuthState["user"] }
    | { type: "LOGOUT" };

export const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN":
            return {
                isAuthenticated: true,
                user: action.payload,
            };
        case "LOGOUT":
            return {
                isAuthenticated: false,
                user: null,
            };
        default:
            return state;
    }
}
