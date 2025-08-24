
'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Package,
    DollarSign,
    CreditCard,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    Users,
    TrendingDown
} from 'lucide-react';
import reportService, {
    SalesByPeriodParams,
    SalesByEmployeeParams,
    SalesByProductParams,
    CurrentStockParams,
    InventoryMovementsParams,
    IncomeVsExpensesParams,
    CashFlowParams,
    OutstandingCreditsParams,
    CollectionsParams,
    SalesByPeriodResponse,
    SalesByEmployeeResponse,
    SalesByProductResponse,
    CurrentStockResponse,
    InventoryMovementsResponse,
    IncomeVsExpensesResponse,
    CashFlowResponse,
    OutstandingCreditsResponse,
    CollectionsResponse
} from '../../src/services/reportService';

interface ReportCard {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    category: 'sales' | 'inventory' | 'financial' | 'credits';
    color: string;
}

const REPORT_CARDS: ReportCard[] = [
    // Reportes de Ventas
    {
        id: 'sales-by-period',
        title: 'Ventas por Período',
        description: 'Análisis de ventas por día, semana, mes o turno',
        icon: TrendingUp,
        category: 'sales',
        color: 'bg-blue-500'
    },
    {
        id: 'sales-by-employee',
        title: 'Ventas por Empleado',
        description: 'Ranking de ventas por empleado',
        icon: Users,
        category: 'sales',
        color: 'bg-green-500'
    },
    {
        id: 'sales-by-product',
        title: 'Ventas por Producto',
        description: 'Análisis de productos más vendidos',
        icon: Package,
        category: 'sales',
        color: 'bg-purple-500'
    },
    // Reportes de Inventario
    {
        id: 'current-stock',
        title: 'Inventario Actual',
        description: 'Estado actual del inventario por producto y tanque',
        icon: Package,
        category: 'inventory',
        color: 'bg-orange-500'
    },
    {
        id: 'inventory-movements',
        title: 'Movimientos de Inventario',
        description: 'Historial de entradas y salidas de inventario',
        icon: RefreshCw,
        category: 'inventory',
        color: 'bg-yellow-500'
    },
    // Reportes Financieros
    {
        id: 'income-vs-expenses',
        title: 'Ingresos vs Gastos',
        description: 'Comparación de ingresos y gastos por período',
        icon: DollarSign,
        category: 'financial',
        color: 'bg-emerald-500'
    },
    {
        id: 'cash-flow',
        title: 'Flujo de Caja',
        description: 'Análisis del flujo de efectivo por método de pago',
        icon: TrendingDown,
        category: 'financial',
        color: 'bg-teal-500'
    },
    // Reportes de Créditos
    {
        id: 'outstanding-credits',
        title: 'Créditos Pendientes',
        description: 'Listado de créditos por cobrar',
        icon: CreditCard,
        category: 'credits',
        color: 'bg-red-500'
    },
    {
        id: 'collections',
        title: 'Cobranzas',
        description: 'Historial de pagos de créditos',
        icon: CreditCard,
        category: 'credits',
        color: 'bg-pink-500'
    }
];

const CATEGORIES = [
    { id: 'all', name: 'Todos', color: 'bg-slate-600' },
    { id: 'sales', name: 'Ventas', color: 'bg-blue-600' },
    { id: 'inventory', name: 'Inventario', color: 'bg-orange-600' },
    { id: 'financial', name: 'Financieros', color: 'bg-green-600' },
    { id: 'credits', name: 'Créditos', color: 'bg-red-600' }
];

type ReportId =
    | 'sales-by-period'
    | 'sales-by-employee'
    | 'sales-by-product'
    | 'current-stock'
    | 'inventory-movements'
    | 'income-vs-expenses'
    | 'cash-flow'
    | 'outstanding-credits'
    | 'collections';

const pickDataArray = (reportId: ReportId, data: any): any[] => {
    if (!data) return [];

    switch (reportId) {
        case 'sales-by-employee':
            return (data as SalesByEmployeeResponse).rankingData ?? [];

        case 'sales-by-product':
            return (data as SalesByProductResponse).productSales ?? [];

        case 'current-stock':
            return Array.isArray(data) ? data : ((data as CurrentStockResponse) ?? []);

        case 'inventory-movements':
            return (data as InventoryMovementsResponse).movementDetails ?? [];

        case 'income-vs-expenses':
            return Object.entries((data as IncomeVsExpensesResponse).monthlyComparisonData ?? {}).map(([period, v]: [string, any]) => ({
                period,
                income: v?.income ?? 0,
                expenses: v?.expenses ?? 0,
                net: (v?.income ?? 0) - (v?.expenses ?? 0),
            }));

        case 'cash-flow':
            return Object.entries((data as CashFlowResponse).dailyFlowData ?? {}).map(([date, amount]) => ({ date, amount }));

        case 'outstanding-credits': {
            // 1) Si ya es un arreglo, úsalo
            if (Array.isArray(data)) return data;

            // 2) Si viene envuelto, con propiedad clara
            if (Array.isArray((data as any)?.outstandingCredits)) {
                return (data as any).outstandingCredits;
            }

            if (data && typeof data === 'object') {
                const maybeArray = Object.values(data).find(v => Array.isArray(v)) as any[] | undefined;
                if (Array.isArray(maybeArray) && maybeArray.length && typeof maybeArray[0] === 'object') {
                    return maybeArray;
                }
            }

            return [];
        }
        case 'collections':
            return (data as CollectionsResponse).collectionsDetails
                ?? Object.entries((data as CollectionsResponse).collectionTrends ?? {}).map(([date, amount]) => ({ date, amount }));

        case 'sales-by-period': {
            const d = data as SalesByPeriodResponse | { periodData?: any[] };
            return Array.isArray(d) ? d : (Array.isArray((d as any).periodData) ? (d as any).periodData : []);
        }

        default:
            return Array.isArray(data) ? data : [];
    }
};

const MONEY_COLS = ['amount', 'total', 'price', 'revenue', 'balance'];
const PCT_COLS = ['percentage', 'efficiency'];
const DATE_COLS = ['date', '_at', 'due_date', 'payment_date']; // bien permisivo

const isMoneyCol = (col: string) =>
    MONEY_COLS.some(k => col.toLowerCase().includes(k));

const isPctCol = (col: string) =>
    PCT_COLS.some(k => col.toLowerCase().includes(k));

const isDateCol = (col: string) =>
    DATE_COLS.some(k => col.toLowerCase().includes(k));

const formatCell = (col: string, val: any) => {
    const num = typeof val === 'number'
        ? val
        : (typeof val === 'string' && val.trim() !== '' && !Number.isNaN(Number(val)) ? Number(val) : NaN);

    if (isMoneyCol(col) && !Number.isNaN(num)) {
        return `S/ ${num.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    }
    if (isPctCol(col) && !Number.isNaN(num)) {
        return `${num.toFixed(2)}%`;
    }
    if (isDateCol(col) && typeof val === 'string') {
        const d = new Date(val);
        if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('es-PE');
    }
    return val ?? '';
};

export default function ReportesContent() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<ReportId | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const filteredReports = selectedCategory === 'all'
        ? REPORT_CARDS
        : REPORT_CARDS.filter(report => report.category === selectedCategory);

    const handleReportSelect = async (reportId: ReportId) => {
        setSelectedReport(reportId);
        setLoading(true);
        setReportData(null);

        try {
            let data;

            switch (reportId) {
                case 'sales-by-period':
                    const salesParams: SalesByPeriodParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        granularity: 'day'
                    };
                    data = await reportService.getSalesByPeriod(salesParams);
                    break;

                case 'sales-by-employee':
                    const employeeParams: SalesByEmployeeParams = {};
                    data = await reportService.getSalesByEmployee(employeeParams);
                    break;

                case 'sales-by-product':
                    const productParams: SalesByProductParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                        limit: 10
                    };
                    data = await reportService.getSalesByProduct(productParams);
                    break;

                case 'current-stock':
                    const stockParams: CurrentStockParams = {};
                    data = await reportService.getCurrentStock(stockParams);
                    break;

                case 'inventory-movements':
                    const movementsParams: InventoryMovementsParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    };
                    data = await reportService.getInventoryMovements(movementsParams);
                    break;

                case 'income-vs-expenses':
                    const incomeParams: IncomeVsExpensesParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    };
                    data = await reportService.getIncomeVsExpenses(incomeParams);
                    break;

                case 'cash-flow':
                    const cashFlowParams: CashFlowParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    };
                    data = await reportService.getCashFlow(cashFlowParams);
                    break;

                case 'outstanding-credits':
                    const creditsParams: OutstandingCreditsParams = {};
                    data = await reportService.getOutstandingCredits(creditsParams);
                    break;

                case 'collections':
                    const collectionsParams: CollectionsParams = {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    };
                    data = await reportService.getCollections(collectionsParams);
                    break;

                default:
                    throw new Error('Reporte no implementado');
            }

            setReportData(data);
        } catch (error) {
            console.error('Error al cargar el reporte:', error);
            setReportData({ error: 'Error al cargar el reporte. Verifique que el backend esté funcionando.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format: 'excel' | 'pdf') => {
        if (!selectedReport) return;

        try {
            const reportCard = REPORT_CARDS.find(r => r.id === selectedReport);
            const filename = `${reportCard?.title.replace(/\s+/g, '_').toLowerCase()}_${dateRange.startDate}_${dateRange.endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

            let endpoint = '';
            let params: any = {};

            switch (selectedReport) {
                case 'sales-by-period':
                    endpoint = '/reports/sales/by-period';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate, granularity: 'day' };
                    break;

                case 'sales-by-employee':
                    endpoint = '/reports/sales/by-employee';
                    params = {}; // si tu backend no filtra por fecha aquí
                    break;

                case 'sales-by-product':
                    endpoint = '/reports/sales/by-product';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 10 };
                    break;

                case 'current-stock':
                    endpoint = '/reports/inventory/current-stock';
                    params = {}; // productId/tankId si los usas
                    break;

                case 'inventory-movements':
                    endpoint = '/reports/inventory/movements';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
                    break;

                case 'income-vs-expenses':
                    endpoint = '/reports/financial/income-vs-expenses';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
                    break;

                case 'cash-flow':
                    endpoint = '/reports/financial/cash-flow';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
                    break;

                case 'outstanding-credits':
                    endpoint = '/reports/credits/outstanding';
                    // si tu backend filtra por estado, podrías pasar status: 'pending'
                    params = {};
                    break;

                case 'collections':
                    endpoint = '/reports/credits/collections';
                    params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
                    break;

                default:
                    endpoint = '';
            }

            if (endpoint) {
                await reportService.downloadReport(endpoint, params, format, filename);
            }
        } catch (error) {
            console.error('Error al descargar el reporte:', error);
            alert('Error al descargar el reporte. Verifique que el backend esté funcionando.');
        }
    };

    const renderReportData = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F97316]"></div>
                </div>
            );
        }

        if (!reportData) {
            return (
                <div className="flex items-center justify-center h-64 text-[#6B7280]">
                    <div className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-[#6B7280]" />
                        <p>Selecciona un reporte para ver los datos</p>
                    </div>
                </div>
            );
        }

        if (reportData.error) {
            return (
                <div className="flex items-center justify-center h-64 text-red-400">
                    <div className="text-center">
                        <div className="bg-red-900/20 p-4 rounded-lg">
                            <p className="font-medium">Error al cargar el reporte</p>
                            <p className="text-sm mt-2">{reportData.error}</p>
                        </div>
                    </div>
                </div>
            );
        }

        const dataArray = pickDataArray(selectedReport ?? 'sales-by-period', reportData);

        if (dataArray.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-[#6B7280]">
                    <div className="text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-[#6B7280]" />
                        <p>No hay datos disponibles para este reporte</p>
                        <p className="text-sm mt-2">Intente con un rango de fechas diferente</p>
                    </div>
                </div>
            );
        }

        const columns = Array.from(
            dataArray.reduce((set: Set<string>, row: any) => {
                Object.keys(row).forEach(k => set.add(k));
                return set;
            }, new Set<string>())
        );

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-700">
                            {columns.map((column) => (
                                <th key={column} className="text-left py-3 px-4 text-[#6B7280] font-medium">
                                    {column.replace(/_/g, ' ').toUpperCase()}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataArray.map((row: any, index: number) => (
                            <tr key={index} className="border-b border-gray-700/50 hover:bg-[#1F2937] transition-colors">
                                {columns.map((column) => (
                                    <td key={column} className="py-3 px-4 text-gray-300">
                                        {formatCell(column, row[column])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <main className="p-4 md:p-8 w-full">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Reportes del Sistema</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-[#6B7280]" />
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 text-sm"
                        />
                        <span className="text-[#6B7280]">-</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-3 py-2 text-sm"
                        />
                    </div>
                </div>
            </header>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                            ? `${category.color} text-white`
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Cards */}
                <div className="lg:col-span-1">
                    <div className="grid gap-4">
                        {filteredReports.map((report) => {
                            const IconComponent = report.icon;
                            return (
                                <div
                                    key={report.id}
                                    onClick={() => handleReportSelect(report.id as ReportId)}
                                    className={`bg-[#1F2937] border border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:border-gray-600 ${selectedReport === report.id ? 'ring-2 ring-[#F97316] border-[#F97316]' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`${report.color} p-2 rounded-lg`}>
                                            <IconComponent className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white text-sm">{report.title}</h3>
                                            <p className="text-[#6B7280] text-xs mt-1">{report.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Report Data */}
                <div className="lg:col-span-2">
                    <div className="bg-[#111827] border border-gray-700 rounded-lg">
                        {/* Report Header */}
                        {selectedReport && (
                            <div className="border-b border-gray-700 p-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-white">
                                        {REPORT_CARDS.find(r => r.id === selectedReport)?.title}
                                    </h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDownload('excel')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Excel</span>
                                        </button>
                                        <button
                                            onClick={() => handleDownload('pdf')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>PDF</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Report Content */}
                        <div className="p-4">
                            {renderReportData()}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

