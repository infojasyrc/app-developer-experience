
export interface HeaderProps {
    isAuthenticated: boolean
    username: string
    onLogin: () => void
    onLogout: () => void
    version?: string
}
