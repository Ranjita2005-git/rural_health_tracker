import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { login as apiLogin, 
  registerUser,
  getMe,
  setToken, 
  clearToken, 
  getToken, 
  type LoginResult,
  type RegisterPayload,
  type UserOut,
 } from '../services/api'

interface AuthUser {
  id: string
  name: string
  role: LoginResult['role']
  facilityId: string | null
  phoneNumber: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  error: string | null
  signIn: (phone: string, password: string) => Promise<boolean>
  signOut: () => void
  register: (payload: RegisterPayload) => Promise<boolean>

}

const AuthContext = createContext<AuthContextType | null>(null)
function mapUserOut(u: UserOut): AuthUser {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    facilityId: u.facility_id,
    phoneNumber: u.phone_number,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore token from localStorage on first render
  const [token, setTokenState] = useState<string | null>(getToken)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = getToken()
    if (!storedToken || user) return

    getMe().then(me => {
      if (me) setUser(mapUserOut(me))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  const signIn = useCallback(async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    const result = await apiLogin(phone, password)

    setIsLoading(false)

    if (!result) {
      setError('Invalid phone number or password. Please try again.')
      return false
    }

    setToken(result.access_token)
    setTokenState(result.access_token)
    const me = await getMe()
    if (me) {
      setUser(mapUserOut(me))
    } else {
      // Fallback with only the data from the token response
      setUser({ id: '', name: result.name, role: result.role, facilityId: null, phoneNumber: phone })
    }
    return true
  }, [])

  const signOut = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  const register = useCallback(async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    const result = await registerUser(payload)

    setIsLoading(false)

    if (!result) {
      setError('Registration failed. Phone number may already be in use.')
      return false
    }

    return true
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, signIn, signOut,register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
