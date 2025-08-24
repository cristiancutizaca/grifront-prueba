import apiService from './apiService';

// Interfaces para los parámetros de los reportes
export interface SalesByPeriodParams {
    granularity?: 'day' | 'week' | 'month' | 'shift';
    startDate: string;
    endDate: string;
    format?: 'json' | 'excel' | 'pdf';
}

export interface SalesByEmployeeParams {
    format?: 'json' | 'excel' | 'pdf';
}

export interface SalesByProductParams {
    startDate?: string;
    endDate?: string;
    limit?: number;
    productId?: number;
}

export interface CurrentStockParams {
    productId?: number;
    tankId?: number;
}

export interface InventoryMovementsParams {
    startDate?: string;
    endDate?: string;
    movementType?: string;
    productId?: number;
    tankId?: number;
}

export interface TankVariationsParams {
    startDate?: string;
    endDate?: string;
    tankId?: number;
}

export interface IncomeVsExpensesParams {
    startDate?: string;
    endDate?: string;
    expenseCategory?: string;
}

export interface CashFlowParams {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
}

export interface OutstandingCreditsParams {
    clientId?: number;
    status?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
}

export interface CollectionsParams {
    startDate?: string;
    endDate?: string;
    clientId?: number;
    paymentMethod?: string;
}

// Tipos DEVUELTOS por el backend
export type SalesByPeriodResponse = any[]; // tu backend arma un agregado; si luego defines shape exacto, cámbialo

export interface SalesByEmployeeResponse {
    employeeSales: Record<string, unknown>;
    rankingData: { employee_name: string; orders: number; total: number }[];
    totalEmployees: number;
}

export interface SalesByProductResponse {
    productSales: { product_id: number; product_name: string; qty: number; revenue: number }[];
    totalRevenue: number;
    totalQuantity: number;
    productsCount: number;
}

export interface CurrentStockItem {
    tankId: number;
    tankName: string;
    productId: number;
    productName: string;
    currentStock: number;
    capacity: number;
    fillPercentage: number;
    isLowStock: boolean;
}
export type CurrentStockResponse = CurrentStockItem[];

export interface InventoryMovementsResponse {
    totalIn: number;
    totalOut: number;
    netAdjustments: number;
    movementDetails: {
        movement_type: string;
        product_id: number;
        product_name: string;
        tank_id: number;
        tank_name: string;
        quantity: number;
        first_at: string;
        last_at: string;
    }[];
    movementsCount: number;
}

export interface IncomeVsExpensesResponse {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    monthlyComparisonData: Record<string, { income: number; expenses: number }>;
    expenseDistributionData: Record<string, number>;
}

export interface CashFlowResponse {
    cashReceived: number;
    transfersReceived: number;
    dailyFlowData: Record<string, number>;
    creditsData: Record<string, unknown>;
    projectionsData: Record<string, unknown>;
}

export interface OutstandingCreditItem {
    credit_id: number;
    client_id: number;
    client_name: string;
    balance: number;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    days_overdue: number;
    is_overdue: boolean;
}
export type OutstandingCreditsResponse = OutstandingCreditItem[];

export interface CollectionsResponse {
    totalCollections: number;
    collectionEfficiency: number;
    collectionTrends: Record<string, number>;
    collectionsDetails: {
        payment_id: number;
        client_id: number;
        client_name: string;
        amount: number;
        payment_date: string;
        payment_method: string;
    }[];
    collectionsCount: number;
}

class ReportService {
    // ==================== REPORTES DE VENTAS ====================

    async getSalesByPeriod(params: SalesByPeriodParams): Promise<SalesByPeriodResponse> {
        const queryParams = new URLSearchParams();

        if (params.granularity) queryParams.append('granularity', params.granularity);
        queryParams.append('startDate', params.startDate);
        queryParams.append('endDate', params.endDate);
        if (params.format) queryParams.append('format', params.format);

        return apiService.get<SalesByPeriodResponse>(`/reports/sales/by-period?${queryParams.toString()}`);
    }

    async getSalesByEmployee(params: SalesByEmployeeParams = {}): Promise<SalesByEmployeeResponse> {
        const queryParams = new URLSearchParams();
        if (params.format) queryParams.append('format', params.format);

        return apiService.get<SalesByEmployeeResponse>(`/reports/sales/by-employee?${queryParams.toString()}`);
    }

    async getSalesByProduct(params: SalesByProductParams = {}): Promise<SalesByProductResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.productId) queryParams.append('productId', params.productId.toString());

        return apiService.get<SalesByProductResponse>(`/reports/sales/by-product?${queryParams.toString()}`);
    }

    // ==================== REPORTES DE INVENTARIO ====================

    async getCurrentStock(params: CurrentStockParams = {}): Promise<CurrentStockResponse> {
        const queryParams = new URLSearchParams();

        if (params.productId) queryParams.append('productId', params.productId.toString());
        if (params.tankId) queryParams.append('tankId', params.tankId.toString());

        return apiService.get<CurrentStockResponse>(`/reports/inventory/current-stock?${queryParams.toString()}`);
    }

    async getInventoryMovements(params: InventoryMovementsParams = {}): Promise<InventoryMovementsResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.movementType) queryParams.append('movementType', params.movementType);
        if (params.productId) queryParams.append('productId', params.productId.toString());
        if (params.tankId) queryParams.append('tankId', params.tankId.toString());

        return apiService.get<InventoryMovementsResponse>(`/reports/inventory/movements?${queryParams.toString()}`);
    }

    async getTankVariations(params: TankVariationsParams = {}): Promise<any> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.tankId) queryParams.append('tankId', params.tankId.toString());

        return apiService.get<any>(`/reports/inventory/tank-variations?${queryParams.toString()}`);
    }

    // ==================== REPORTES FINANCIEROS ====================

    async getIncomeVsExpenses(params: IncomeVsExpensesParams = {}): Promise<IncomeVsExpensesResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.expenseCategory) queryParams.append('expenseCategory', params.expenseCategory);

        return apiService.get<IncomeVsExpensesResponse>(`/reports/financial/income-vs-expenses?${queryParams.toString()}`);
    }

    async getCashFlow(params: CashFlowParams = {}): Promise<CashFlowResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);

        return apiService.get<CashFlowResponse>(`/reports/financial/cash-flow?${queryParams.toString()}`);
    }

    // ==================== REPORTES DE CRÉDITOS ====================

    async getOutstandingCredits(params: OutstandingCreditsParams = {}): Promise<OutstandingCreditsResponse> {
        const queryParams = new URLSearchParams();

        if (params.clientId) queryParams.append('clientId', params.clientId.toString());
        if (params.status) queryParams.append('status', params.status);
        if (params.dueDateStart) queryParams.append('dueDateStart', params.dueDateStart);
        if (params.dueDateEnd) queryParams.append('dueDateEnd', params.dueDateEnd);

        return apiService.get<OutstandingCreditsResponse>(`/reports/credits/outstanding?${queryParams.toString()}`);
    }

    async getCollections(params: CollectionsParams = {}): Promise<CollectionsResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.clientId) queryParams.append('clientId', params.clientId.toString());
        if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);

        return apiService.get<CollectionsResponse>(`/reports/credits/collections?${queryParams.toString()}`);
    }

    // ==================== MÉTODOS AUXILIARES ====================

    // Método para descargar reportes en formato Excel o PDF
    async downloadReport(
        endpoint: string,
        params: Record<string, any>,
        format: 'excel' | 'pdf',
        fallbackFilename: string
    ): Promise<void> {
        const url = new URL(endpoint, apiService.getBaseURL());
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.append(k, String(v));
        });
        url.searchParams.set('format', format);

        const accept =
            format === 'excel'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'application/pdf';

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                    Accept: accept,
                },
            });

            const contentType = response.headers.get('content-type') || '';

            if (!response.ok) {
                // Intenta leer el cuerpo como texto para mostrar error claro
                let bodyText = '';
                try {
                    bodyText = await response.text();
                } catch { }
                throw new Error(
                    `Error ${response.status} ${response.statusText}` +
                    (bodyText ? ` — ${bodyText.slice(0, 300)}` : '')
                );
            }

            // Si el servidor devolvió JSON (ej. error o “no hay datos”), no descargues archivo vacío
            if (contentType.includes('application/json')) {
                const jsonText = await response.clone().text();
                let msg = 'El backend no devolvió un archivo.';
                try {
                    const j = JSON.parse(jsonText);
                    msg = j?.message || JSON.stringify(j);
                } catch {
                    msg = jsonText;
                }
                throw new Error(msg);
            }

            // Blob real (xlsx/pdf)
            const blob = await response.blob();
            if (!blob || blob.size === 0) {
                throw new Error('El archivo llegó vacío (0 bytes). Revisa filtros o datos en backend.');
            }

            // Usa filename de Content-Disposition si el backend lo manda
            let filename = fallbackFilename;
            const cd = response.headers.get('content-disposition') || '';
            const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
            if (m && m[1]) {
                try {
                    filename = decodeURIComponent(m[1]);
                } catch {
                    filename = m[1];
                }
            }

            const urlObj = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = urlObj;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(urlObj);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error al descargar el reporte:', err);
            // Lanza el error para que el caller muestre alerta/toast
            throw err;
        }
    }
}

export default new ReportService();

