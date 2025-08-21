import { useState, useEffect, useCallback } from 'react';
import ReportService, {
    GetSalesReportFilters,
    GetInventoryFilters,
    GetFinancialFilters,
    GetCreditsFilters,
    SalesReportData,
    SalesByEmployeeData,
    InventoryStockData,
    InventoryMovementsData,
    FinancialIncomeExpensesData,
    FinancialCashFlowData,
    CreditsOutstandingData,
    CreditsCollectionsData
} from '../services/reportService.improved';

// Hook para reportes de ventas
export function useSalesReports() {
    const [periodData, setPeriodData] = useState<SalesReportData | null>(null);
    const [employeeData, setEmployeeData] = useState<SalesByEmployeeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSalesByPeriod = useCallback(async (filters: GetSalesReportFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getSalesByPeriodReport(filters);
            setPeriodData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de ventas por período';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getSalesByEmployee = useCallback(async (filters: GetSalesReportFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getSalesByEmployeeReport(filters);
            setEmployeeData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de ventas por empleado';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        periodData,
        employeeData,
        loading,
        error,
        getSalesByPeriod,
        getSalesByEmployee,
        clearError: () => setError(null),
        clearData: () => {
            setPeriodData(null);
            setEmployeeData(null);
        }
    };
}

// Hook para reportes de inventario
export function useInventoryReports() {
    const [stockData, setStockData] = useState<InventoryStockData[] | null>(null);
    const [movementsData, setMovementsData] = useState<InventoryMovementsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCurrentStock = useCallback(async (filters: GetInventoryFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getCurrentStockReport(filters);
            setStockData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de stock actual';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getInventoryMovements = useCallback(async (filters: GetInventoryFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getInventoryMovementsReport(filters);
            setMovementsData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de movimientos de inventario';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stockData,
        movementsData,
        loading,
        error,
        getCurrentStock,
        getInventoryMovements,
        clearError: () => setError(null),
        clearData: () => {
            setStockData(null);
            setMovementsData(null);
        }
    };
}

// Hook para reportes financieros
export function useFinancialReports() {
    const [incomeExpensesData, setIncomeExpensesData] = useState<FinancialIncomeExpensesData | null>(null);
    const [cashFlowData, setCashFlowData] = useState<FinancialCashFlowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getIncomeVsExpenses = useCallback(async (filters: GetFinancialFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getIncomeVsExpensesReport(filters);
            setIncomeExpensesData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de ingresos vs gastos';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCashFlow = useCallback(async (filters: GetFinancialFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getCashFlowReport(filters);
            setCashFlowData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de flujo de caja';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        incomeExpensesData,
        cashFlowData,
        loading,
        error,
        getIncomeVsExpenses,
        getCashFlow,
        clearError: () => setError(null),
        clearData: () => {
            setIncomeExpensesData(null);
            setCashFlowData(null);
        }
    };
}

// Hook para reportes de créditos
export function useCreditsReports() {
    const [outstandingData, setOutstandingData] = useState<CreditsOutstandingData | null>(null);
    const [collectionsData, setCollectionsData] = useState<CreditsCollectionsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getOutstandingCredits = useCallback(async (filters: GetCreditsFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getOutstandingCreditsReport(filters);
            setOutstandingData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de créditos pendientes';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCollections = useCallback(async (filters: GetCreditsFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await ReportService.getCollectionsReport(filters);
            setCollectionsData(data);
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Error al obtener reporte de cobros';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        outstandingData,
        collectionsData,
        loading,
        error,
        getOutstandingCredits,
        getCollections,
        clearError: () => setError(null),
        clearData: () => {
            setOutstandingData(null);
            setCollectionsData(null);
        }
    };
}

// Hook general para verificar conectividad
export function useReportConnection() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);

    const checkConnection = useCallback(async () => {
        setChecking(true);
        try {
            const connected = await ReportService.checkConnection();
            setIsConnected(connected);
            return connected;
        } catch {
            setIsConnected(false);
            return false;
        } finally {
            setChecking(false);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    return {
        isConnected,
        checking,
        checkConnection,
        config: ReportService.getConfig()
    };
}

