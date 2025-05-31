import type { User, AuthResponse } from '../types/auth.types'
import { Role } from '../types/auth.types'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'


class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error) {
      throw error
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
      })

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }


  async registerManager(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/manager/register`, {
        email,
        password,
        name,
      })

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      return response.data
    } catch (error) {
      console.error('Manager Registration error:', error)
      throw error
    }
  }

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr) as User
      } catch (error) {
        console.error('Error parsing user data:', error)
        return null
      }
    }
    return null
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }

  setupAxiosInterceptors(): void {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // axios.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     if (error.response?.status === 401) {
    //       this.logout()
    //       window.location.href = '/login'
    //     }
    //     return Promise.reject(error)
    //   }
    // )
  }
}

export default new AuthService() 