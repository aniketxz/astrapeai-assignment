import React, { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "LOAD_USER"; payload: { user: User; token: string } }

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      }
    case "LOAD_USER":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll just check if it exists
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        dispatch({ type: "LOAD_USER", payload: { user, token } })
      } else {
        dispatch({ type: "LOGIN_FAILURE" })
      }
    } else {
      dispatch({ type: "LOGIN_FAILURE" })
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await authAPI.login(email, password)
      const data = response.data

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.token },
      })
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      )
    }
  }

  const register = async (email: string, password: string) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await authAPI.register(email, password)
      const data = response.data

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.user, token: data.token },
      })
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      )
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("cart")
    dispatch({ type: "LOGOUT" })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
