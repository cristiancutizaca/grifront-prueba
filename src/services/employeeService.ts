// employeeService.ts - Servicio para gestionar empleados
import ApiService from './apiService';

export interface Employee {
  employee_id: number;
  dni: string;
  first_name: string;
  last_name: string;
  position: string;
  birth_date: string;
  address: string;
  phone_number: string;
  email: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeDto {
  dni: string;
  first_name: string;
  last_name: string;
  position: string;
  birth_date: string; // Formato YYYY-MM-DD
  address: string;
  phone_number: string;
  email: string;
  hire_date: string; // Formato YYYY-MM-DD
  is_active?: boolean;
}

export interface UpdateEmployeeDto {
  dni?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  birth_date?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  hire_date?: string;
  is_active?: boolean;
}

class EmployeeService {
  private readonly endpoint = '/employees';

  // Obtener todos los empleados
  async getAll(): Promise<Employee[]> {
    try {
      return await ApiService.get<Employee[]>(this.endpoint);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  }

  // Obtener empleado por ID
  async getById(id: number): Promise<Employee> {
    try {
      return await ApiService.get<Employee>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      throw error;
    }
  }

  // Crear nuevo empleado
  async create(employeeData: CreateEmployeeDto): Promise<Employee> {
    return await ApiService.post<Employee>(this.endpoint, employeeData);
  }
  // Actualizar empleado
  async update(id: number, employeeData: UpdateEmployeeDto): Promise<Employee> {
    try {
      return await ApiService.patch<Employee>(`${this.endpoint}/${id}`, employeeData);
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      throw error;
    }
  }

  // Eliminar empleado
  async delete(id: number): Promise<void> {
    try {
      await ApiService.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      throw error;
    }
  }

  // --- ✅ MÉTODOS AÑADIDOS ---
  /**
   * Activa un empleado enviando una solicitud al backend.
   * @param id - El ID del empleado a activar.
   */
  async activate(id: number): Promise<Employee> {
    try {
      // Esta ruta debe coincidir con tu API (ej: PATCH /api/employees/123/activate)
      return await ApiService.patch<Employee>(`${this.endpoint}/${id}/activate`, {});
    } catch (error) {
      console.error(`Error al activar el empleado con ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Desactiva un empleado enviando una solicitud al backend.
   * @param id - El ID del empleado a desactivar.
   */
  async deactivate(id: number): Promise<Employee> {
    try {
      // Esta ruta debe coincidir con tu API (ej: PATCH /api/employees/123/deactivate)
      return await ApiService.patch<Employee>(`${this.endpoint}/${id}/deactivate`, {});
    } catch (error) {
      console.error(`Error al desactivar el empleado con ID ${id}:`, error);
      throw error;
    }
  }
  // --- FIN DE MÉTODOS AÑADIDOS ---

  // Obtener empleados activos
  async getActiveEmployees(): Promise<Employee[]> {
    try {
      return await ApiService.get<Employee[]>(`${this.endpoint}?active=true`);
    } catch (error) {
      console.error('Error al obtener empleados activos:', error);
      throw error;
    }
  }

  // Buscar empleado por DNI
  async getByDni(dni: string): Promise<Employee> {
    try {
      return await ApiService.get<Employee>(`${this.endpoint}/dni/${dni}`);
    } catch (error) {
      console.error('Error al buscar empleado por DNI:', error);
      throw error;
    }
  }
}

export default new EmployeeService();