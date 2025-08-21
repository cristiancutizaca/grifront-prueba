import ApiService from './apiService'; // Asegúrate de que la ruta a tu ApiService sea correcta
import { paymentMethod } from "../../app/grifo-configuracion/types/payment-methods";

class PaymentMethodService {
  private readonly endpoint = '/payment-methods'; // Endpoint del controlador de métodos de pago en el backend

  /**
   * Obtiene todos los métodos de pago desde el backend.
   * @returns Una promesa que resuelve con un array de métodos de pago.
   */
  async getAll(): Promise<paymentMethod[]> {
    try {
      return await ApiService.get<paymentMethod[]>(this.endpoint);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Puedes añadir otros métodos aquí si necesitas crear, actualizar o eliminar métodos de pago
  /*
  async create(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    try {
      return await ApiService.post<PaymentMethod>(this.endpoint, data);
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }*/

  async update(id: string, data: Partial<paymentMethod>): Promise<paymentMethod> {
    try {
      return await ApiService.patch<paymentMethod>(`${this.endpoint}/${id}`, data);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await ApiService.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
}

export default new PaymentMethodService();

