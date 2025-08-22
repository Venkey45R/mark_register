import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "../api/axios";

const AuthStateContext = createContext(null);
const AuthDispatchContext = createContext(null);

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Corrected API endpoint to remove the duplicate '/api'
        const res = await axios.get("/check-role", { withCredentials: true });
        if (res.status === 200) {
          dispatch({ type: "LOGIN", payload: res.data });
        }
      } catch (error) {
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === null) {
    throw new Error("useAuthState must be used within an AuthProvider");
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (context === null) {
    throw new Error("useAuthDispatch must be used within an AuthProvider");
  }
  return context;
};

// Custom hook to use both state and dispatch
export default function useAuth() {
  const authState = useAuthState();
  const authDispatch = useAuthDispatch();
  return { ...authState, dispatch: authDispatch };
}
