import type { User, AuthResponse } from '../types/auth.types'
import { Role } from '../types/auth.types'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'


class AdminService {
  async getManagersToApprove(): Promise<User[]> {
    try {
      return (await axios.get(`${API_URL}/users/manager/claim`)).data
    } catch (error) {
      throw error
    }
  }


  async approveManager(managerId: number): Promise<User> {
    try {
      return (await axios.patch(`${API_URL}/users/manager/claim/${managerId}`)).data
    } catch (error) {
      throw error
    }
  }
}

export default new AdminService() 