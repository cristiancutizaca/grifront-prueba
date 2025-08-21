import { APP_CONFIG, getBackendUrl } from '../config/appConfig';

// Interfaces para los filtros de reportes
export interface GetSalesReportFilters {
    startDate: string;
    endDate: string;
    productId?: number;
    clientId?: number;
    employeeId?: number;
    shiftId?: number;
    shift?: string;
    paymentMethod?: string;
}

export interface GetInventoryFilters {
    productId?: number;
    tankId?: number;
    startDate?: string;
    endDate?: string;
    movementType?: string;
}

export interface GetFinancialFilters {
    startDate: string;
    endDate: string;
    expenseCategory?: string;
    paymentMethod?: string;
}

export interface GetCreditsFilters {
    clientId?: number;
    status?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
}

// Interfaces para los datos de respuesta
export interface SalesReportData {
    totalSales: number;
    totalQuantity: number;
    averageTransaction: number;
    salesByProduct: Record<string, { quantity: number; amount: number }>;
    salesByPaymentMethod: Record<string, number>;
    timelineData: Record<string, { sales: number; quantity: number }>;
    salesCount: number;
}

export interface SalesByEmployeeData {
    employeeSales: Record<string, {
        totalSales: number;
        salesCount: number;
        totalQuantity: number;
    }>;
    rankingData: Array<{
        name: string;
        totalSales: number;
        salesCount: number;
        totalQuantity: number;
    }>;
    totalEmployees: number;
}

export interface InventoryStockData {
    tankId: number;
    tankName: string;
    productId: number;
    productName: string;
    currentStock: number;
    capacity: number;
    fillPercentage: number;
    isLowStock: boolean;
}

export interface InventoryMovementsData {
    totalIn: number;
    totalOut: number;
    netAdjustments: number;
    movementDetails: Array<{
        movement_id: number;
        product: { name: string };
        movement_type: string;
        quantity: number;
        movement_date: string;
        reason?: string;
    }>;
    flowData: Record<string, { in: number; out: number; adjustments: number }>;
}

export interface FinancialIncomeExpensesData {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    monthlyComparisonData: Record<string, { income: number; expenses: number }>;
    expenseDistributionData: Record<string, number>;
}

export interface FinancialCashFlowData {
    cashReceived: number;
    transfersReceived: number;
    creditsData: Record<string, number>;
    dailyFlowData: Record<string, number>;
    projectionsData: Record<string, number>;
}

export interface CreditsOutstandingData {
    totalOutstanding: number;
    partialPayments: number;
    agingData: {
        '0-30': number;
        '31-60': number;
        '61-90': number;
        '90+': number;
    };
    delinquentClients: Array<{
        credit_id: number;
        client: { first_name: string; last_name: string; company_name?: string };
        amount: number;
        remaining_amount: number;
        due_date: string;
        status: string;
    }>;
    creditsCount: number;
}

export interface CreditsCollectionsData {
    totalCollections: number;
    collectionEfficiency: number;
    collectionTrends: Record<string, number>;
    portfolioRecovery: Record<string, number>;
}

// Interfaces para datos detallados (legacy)
export interface SaleReportDetail {
    sale_id: number;
    sale_timestamp: string;
    clientName?: string;
    employeeName?: string;
    productName?: string;
    quantity?: number;
    paymentMethodName?: string;
    shiftName?: string;
    status: string;
    final_amount: number;
}

export interface SalesReportDataLegacy {
    totalSalesAmount: number;
    totalSalesCount: number;
    detailedSales: SaleReportDetail[];
}

class ReportService {
    private baseURL: string;

    
    constructor() {
        // Usar la configuración centralizada
        this.baseURL = getBackendUrl() || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    }

    // Método para obtener headers con autenticación
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Agregar token de autenticación si está disponible
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Método para manejar errores de red con reintentos
    private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        ...this.getHeaders(),
                        ...options.headers,
                    },
                });

                if (response.ok) {
                    return response;
                }

                // Si es el último intento o es un error 4xx, lanzar error
                if (i === retries - 1 || (response.status >= 400 && response.status < 500)) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                // Si es el último intento, lanzar error
                if (i === retries - 1) {
                    throw error;
                }
                
                // Esperar antes del siguiente intento
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }

        throw new Error('Error de conexión después de múltiples intentos');
    }

    // ==================== REPORTES DE VENTAS ====================

    async getSalesByPeriodReport(filters: GetSalesReportFilters): Promise<SalesReportData> {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        
        if (filters.productId) params.append('productId', filters.productId.toString());
        if (filters.clientId) params.append('clientId', filters.clientId.toString());
        if (filters.employeeId) params.append('employeeId', filters.employeeId.toString());
        if (filters.shiftId) params.append('shiftId', filters.shiftId.toString());

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/sales/by-period?${params}`);
        return response.json();
    }

    async getSalesByEmployeeReport(filters: GetSalesReportFilters): Promise<SalesByEmployeeData> {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        
        if (filters.employeeId) params.append('employeeId', filters.employeeId.toString());
        if (filters.shiftId) params.append('shiftId', filters.shiftId.toString());

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/sales/by-employee?${params}`);
        return response.json();
    }

    // ==================== REPORTES DE INVENTARIO ====================

    async getCurrentStockReport(filters: GetInventoryFilters = {}): Promise<InventoryStockData[]> {
        const params = new URLSearchParams();
        
        if (filters.productId) params.append('productId', filters.productId.toString());
        if (filters.tankId) params.append('tankId', filters.tankId.toString());

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/inventory/current-stock?${params}`);
        return response.json();
    }

    async getInventoryMovementsReport(filters: GetInventoryFilters): Promise<InventoryMovementsData> {
        const params = new URLSearchParams();
        
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.movementType) params.append('movementType', filters.movementType);
        if (filters.productId) params.append('productId', filters.productId.toString());

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/inventory/movements?${params}`);
        return response.json();
    }

    // ==================== REPORTES FINANCIEROS ====================

    async getIncomeVsExpensesReport(filters: GetFinancialFilters): Promise<FinancialIncomeExpensesData> {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        
        if (filters.expenseCategory) params.append('expenseCategory', filters.expenseCategory);

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/financial/income-vs-expenses?${params}`);
        return response.json();
    }

    async getCashFlowReport(filters: GetFinancialFilters): Promise<FinancialCashFlowData> {
        const params = new URLSearchParams();
        params.append('startDate', filters.startDate);
        params.append('endDate', filters.endDate);
        
        if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/financial/cash-flow?${params}`);
        return response.json();
    }

    // ==================== REPORTES DE CRÉDITOS ====================

    async getOutstandingCreditsReport(filters: GetCreditsFilters = {}): Promise<CreditsOutstandingData> {
        const params = new URLSearchParams();
        
        if (filters.clientId) params.append('clientId', filters.clientId.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.dueDateStart) params.append('dueDateStart', filters.dueDateStart);
        if (filters.dueDateEnd) params.append('dueDateEnd', filters.dueDateEnd);

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/credits/outstanding?${params}`);
        return response.json();
    }

    async getCollectionsReport(filters: GetCreditsFilters): Promise<CreditsCollectionsData> {
        const params = new URLSearchParams();
        
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.clientId) params.append('clientId', filters.clientId.toString());
        if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

        const response = await this.fetchWithRetry(`${this.baseURL}/reports/credits/collections?${params}`);
        return response.json();
    }

    // ==================== MÉTODO LEGACY (para compatibilidad) ====================

    async getSalesReport(filters: GetSalesReportFilters): Promise<SalesReportDataLegacy> {
        // Este método mantiene la compatibilidad con el código existente
        // pero internamente usa el nuevo endpoint
        const data = await this.getSalesByPeriodReport(filters);
        
        return {
            totalSalesAmount: data.totalSales,
            totalSalesCount: data.salesCount,
            detailedSales: [] // Se podría implementar si el backend devuelve detalles
        };
    }

    // ==================== MÉTODOS DE UTILIDAD ====================

    // Método para verificar la conectividad con el backend
    async checkConnection(): Promise<boolean> {
        try {
            const response = await this.fetchWithRetry(`${this.baseURL}/health`, {}, 1);
            return response.ok;
        } catch {
            return false;
        }
    }

    // Método para obtener la configuración actual
    getConfig() {
        return {
            baseURL: this.baseURL,
            mode: APP_CONFIG.mode,
            authRequired: APP_CONFIG.auth.requireAuth,
        };
    }
}

export default new ReportService();

