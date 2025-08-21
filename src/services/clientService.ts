import apiService from './apiService';

// Interfaz principal del cliente con campos clásicos y nuevos
export interface Client {
  client_id: number;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: string;
  telefono: string;
  email: string;
  direccion: string;
  tipo_cliente: 'persona' | 'empresa';
  limite_credito: number;
  credito_disponible: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
  fecha_registro: string;
  fecha_actualizacion: string;
  // Nuevos campos opcionales (para edición/creación avanzada)
  first_name?: string;
  last_name?: string;
  company_name?: string | null;
  category?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  client_type?: 'persona' | 'empresa';
  created_at?: string;
  updated_at?: string;
}

// Datos requeridos para crear un cliente
export interface CreateClientData {
  first_name?: string;
  last_name?: string;
  company_name?: string | null;
  category?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  birth_date?: string | null;
  notes?: string;
  client_type?: 'persona' | 'empresa';
  tipo_documento?: string;
  limite_credito?: number;
}

// Datos para actualizar un cliente (id + parcial del resto)
export interface UpdateClientData extends Partial<CreateClientData> {
  client_id: number;
}

class ClientService {
  private endpoint = '/clients';

  // Obtener todos los clientes
  async getAllClients(): Promise<Client[]> {
    return apiService.get<Client[]>(this.endpoint);
  }

  // Obtener cliente por ID
  async getClientById(id: number): Promise<Client> {
    return apiService.get<Client>(`${this.endpoint}/${id}`);
  }

  // Crear un nuevo cliente
  async createClient(clientData: CreateClientData): Promise<Client> {
    return apiService.post<Client>(this.endpoint, clientData);
  }

  // 🧠 ACTUALIZADO: Usamos PATCH para no romper tu backend
  async updateClient(clientData: UpdateClientData): Promise<Client> {
    const { client_id, ...data } = clientData;
    return apiService.patch<Client>(`${this.endpoint}/${client_id}`, data);
  }

  // Eliminar cliente
  async deleteClient(id: number): Promise<void> {
    return apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  // Buscar clientes por texto libre
  async searchClients(query: string): Promise<Client[]> {
    return apiService.get<Client[]>(`${this.endpoint}/search?q=${encodeURIComponent(query)}`);
  }

  // Obtener clientes filtrados por tipo (persona/empresa)
  async getClientsByType(tipo: 'persona' | 'empresa'): Promise<Client[]> {
    return apiService.get<Client[]>(`${this.endpoint}?tipo_cliente=${tipo}`);
  }

  // Obtener clientes que tengan crédito
  async getClientsWithCredit(): Promise<Client[]> {
    return apiService.get<Client[]>(`${this.endpoint}?con_credito=true`);
  }

  // Actualizar solo el crédito de un cliente
  async updateClientCredit(id: number, nuevoLimite: number): Promise<Client> {
    return apiService.patch<Client>(`${this.endpoint}/${id}/credito`, {
      limite_credito: nuevoLimite
    });
  }

  // Obtener historial de transacciones de un cliente
  async getClientTransactions(id: number): Promise<any[]> {
    return apiService.get<any[]>(`${this.endpoint}/${id}/transacciones`);
  }
}

export default new ClientService();
