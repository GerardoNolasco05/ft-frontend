import { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react'

const AuthContext = createContext()

function AuthContextProvider({children}) {
    const [token, setToken] = useState(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const initialized = useRef(false); // Add this

    useEffect(() => {
        // Prevent double execution in Strict Mode
        if (initialized.current) return;
        initialized.current = true;

        let localToken = localStorage.getItem('token')

        if (localToken) {
            setToken(localToken)
        }

        setIsLoading(false)
    }, [])


    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('coach')
        setToken(undefined)
    }

    // Use useMemo to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        token,
        isLoading,
        logout,
        setToken
    }), [token, isLoading]); // Only recreate when these actually change

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider

export const useAuthContext = () => useContext(AuthContext)