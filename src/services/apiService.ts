  // API Base Service - Versión Corregida
  class ApiService {
    private baseURL: string;

    
    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api') {
      this.baseURL = baseURL;
    }

    private async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${this.baseURL}${endpoint}`;

      // Obtener token de autenticación (soporta ambos flujos de login)
      const token =
        (typeof window !== 'undefined' && sessionStorage.getItem('token')) ||
        (typeof window !== 'undefined' && localStorage.getItem('authToken')) ||
        null;

      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      try {
        const response = await fetch(url, config);

        if (!response.ok) {
          // Manejo mejorado de errores
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Si no se puede parsear el JSON, usar el mensaje por defecto
          }
          throw new Error(errorMessage);
        }

        // Verificar si la respuesta tiene contenido
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return data;
        } else {
          // Para respuestas sin contenido (como DELETE)
          return {} as T;
        }
      } catch (error) {
        console.error('API request failed:', error);
        
        // Verificar si es un error de conexión
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Error de conexión: No se puede conectar al servidor. Verifique que el backend esté ejecutándose.');
        }
        
        throw error;
      }
    }

    async get<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async patch<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }

    async delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Método para verificar la conexión con el backend
    async healthCheck(): Promise<boolean> {
      try {
        await this.get('/health');
        return true;
      } catch {
        return false;
      }
    }

    // Método para obtener la URL base actual
    getBaseURL(): string {
      return this.baseURL;
    }

    // Método para cambiar la URL base dinámicamente
    setBaseURL(newBaseURL: string): void {
      this.baseURL = newBaseURL;
    }

    
  }



  

  export default new ApiService();

