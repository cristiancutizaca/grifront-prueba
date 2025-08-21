// src/services/paymentsService.ts
import apiService from './apiService';

export type CreatePaymentPayload =
  | {
      // PAGO DE CRÉDITO
      credit_id: number;
      sale_id?: never; // Asegura que sale_id no esté presente
      amount: number;
      payment_method_id: number;
      user_id: number;
      notes?: string;
    }
  | {
      // PAGO DE VENTA (para usar en otra pantalla si aplica)
      sale_id: number;
      credit_id?: never; // Asegura que credit_id no esté presente
      amount: number;
      payment_method_id: number;
      user_id: number;
      notes?: string;
    };

export const createPayment = (payload: CreatePaymentPayload) =>
  apiService.post('/payments', payload);


