"use client";
import { useContext } from 'react'
import { AuthContext } from '../contexts/Auth/AuthContext'

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	return ctx
}

export default useAuth
