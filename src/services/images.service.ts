import axios from 'axios'

class ImagesService {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    const response = await axios.post('http://localhost:3000/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.path
  }
}

export default new ImagesService() 