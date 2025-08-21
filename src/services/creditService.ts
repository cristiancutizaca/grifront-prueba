import apiService from './apiService';

// Interfaces actualizadas para coincidir con el backend
export interface Credit {
  credit_id: number;
  client_id: number;
  sale_id?: number;
  credit_amount: number;
  amount_paid: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  updated_at: string;
  client?: {
    client_id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  sale?: {
    sale_id: number;
    total_amount: number;
  };
}

export interface CreditsDashboard {
  total: number;
  overdue: number;
  paid: number;
}

export interface CreateCreditData {
  client_id: number;
  sale_id?: number;
  credit_amount: number;
  due_date: string;
}

export interface PaymentData {
  amount: number;
  payment_method_id: number;
  user_id: number;
  sale_id?: number | null;
  notes?: string;
}

export interface CreditStats {
  totalCredits: number;
  totalDebt: number;
  clientsWithDebt: number;
  overdueCredits: number;
  paidCredits: number;
}

class CreditService {
  private endpoint = '/credits';

  // Obtener todos los créditos con filtros opcionales
  async getAllCredits(filters?: {
    status?: string;
    overdue?: boolean;
  }): Promise<Credit[]> {
    let url = this.endpoint;
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.overdue) {
      params.append('overdue', 'true');
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return apiService.get<Credit[]>(url);
  }

  // Obtener un crédito por ID
  async getCreditById(id: number): Promise<Credit> {
    return apiService.get<Credit>(`${this.endpoint}/${id}`);
  }

  // Crear un nuevo crédito
  async createCredit(creditData: CreateCreditData): Promise<Credit> {
    return apiService.post<Credit>(this.endpoint, creditData);
  }

  // Obtener dashboard de créditos
  async getCreditsDashboard(): Promise<CreditsDashboard> {
    return apiService.get<CreditsDashboard>(`${this.endpoint}/dashboard`);
  }

  // Obtener créditos vencidos
  async getOverdueCredits(): Promise<Credit[]> {
    return apiService.get<Credit[]>(`${this.endpoint}/overdue`);
  }

  /**
   * Agregar un pago a un crédito usando el endpoint correcto del backend:
   * POST /payments  (CreatePaymentDto)
   * Campos requeridos: credit_id?, sale_id?, payment_method_id, amount, user_id
   */
  async addPayment(creditId: number, payload: {
    amount: number;
    payment_method_id: number;
    user_id: number;
    sale_id?: number | null;
    notes?: string;
  }) {
    const body = { credit_id: creditId, ...payload };
    return apiService.post('/payments', body);
  }

  // Obtener créditos pendientes (con deuda)
  async getPendingCredits(): Promise<Credit[]> {
    return this.getAllCredits({ status: 'pending' });
  }

  // Obtener créditos pagados
  async getPaidCredits(): Promise<Credit[]> {
    return this.getAllCredits({ status: 'paid' });
  }

  // Obtener estadísticas calculadas
  async getCreditStats(): Promise<CreditStats> {
    try {
      const [allCredits, dashboard] = await Promise.all([
        this.getAllCredits(),
        this.getCreditsDashboard()
      ]);

      // Calcular estadísticas adicionales
      const totalDebt = allCredits
        .filter(credit => credit.status === 'pending' || credit.status === 'overdue')
        .reduce((sum, credit) => sum + (credit.credit_amount - credit.amount_paid), 0);

      const clientsWithDebt = new Set(
        allCredits
          .filter(credit => credit.status === 'pending' || credit.status === 'overdue')
          .map(credit => credit.client_id)
      ).size;

      return {
        totalCredits: dashboard.total,
        totalDebt,
        clientsWithDebt,
        overdueCredits: dashboard.overdue,
        paidCredits: dashboard.paid
      };
    } catch (error) {
      console.error('Error getting credit stats:', error);
      throw error;
    }
  }

  // Obtener créditos por cliente
  async getCreditsByClient(clientId: number): Promise<Credit[]> {
    const allCredits = await this.getAllCredits();
    return allCredits.filter(credit => credit.client_id === clientId);
  }

  // Obtener clientes con deuda
  async getClientsWithDebt(): Promise<Array<{
    client_id: number;
    name: string;
    totalDebt: number;
    creditsCount: number;
  }>> {
    const credits = await this.getAllCredits();
    const clientsMap = new Map();

    credits
      .filter(credit => credit.status === 'pending' || credit.status === 'overdue')
      .forEach(credit => {
        const clientId = credit.client_id;
        const debt = credit.credit_amount - credit.amount_paid;

        if (clientsMap.has(clientId)) {
          const existing = clientsMap.get(clientId);
          existing.totalDebt += debt;
          existing.creditsCount += 1;
        } else {
          clientsMap.set(clientId, {
            client_id: clientId,
            name: credit.client?.name || `Cliente ${clientId}`,
            totalDebt: debt,
            creditsCount: 1
          });
        }
      });

    return Array.from(clientsMap.values());
  }



  // Verificar conexión con el backend
  async healthCheck(): Promise<boolean> {
    try {
      await apiService.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export default new CreditService();

