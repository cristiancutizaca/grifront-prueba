'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import ReportService, { GetFinancialFilters, FinancialIncomeExpensesData, FinancialCashFlowData } from '../../src/services/reportService';


interface FinancialReportsProps {
    reportType: 'financial-income' | 'financial-cashflow';
}

interface Option {
    id: number | string;
    name: string;
}


const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function FinancialReports({ reportType }: FinancialReportsProps) {
    const [filters, setFilters] = useState<GetFinancialFilters>({
        startDate: '',
        endDate: '',
        expenseCategory: undefined,
        paymentMethod: undefined,
    });

    const [incomeExpensesData, setIncomeExpensesData] = useState<FinancialIncomeExpensesData | null>(null);
    const [cashFlowData, setCashFlowData] = useState<FinancialCashFlowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para opciones de filtros (simulados - deberían venir de servicios)
    const [expenseCategoriesOptions] = useState<Option[]>([
        { id: 'combustible', name: 'Combustible' },
        { id: 'mantenimiento', name: 'Mantenimiento' },
        { id: 'personal', name: 'Personal' },
        { id: 'servicios', name: 'Servicios' },
        { id: 'otros', name: 'Otros' },
    ]);
    const [paymentMethodsOptions] = useState<Option[]>([
        { id: 'efectivo', name: 'Efectivo' },
        { id: 'transferencia', name: 'Transferencia' },
        { id: 'tarjeta', name: 'Tarjeta' },
    ]);

    const generateReport = useCallback(async () => {
        if (!filters.startDate || !filters.endDate) return;

        setLoading(true);
        setError(null);

        try {
            if (reportType === 'financial-income') {
                const data = await ReportService.getIncomeVsExpensesReport(filters);
                setIncomeExpensesData(data);
            } else {
                const data = await ReportService.getCashFlowReport(filters);
                setCashFlowData(data);
            }
        } catch (err: any) {
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    }, [filters, reportType]);

    useEffect(() => {
        // Establecer fechas por defecto
        if (!filters.startDate || !filters.endDate) {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            setFilters(prev => ({
                ...prev,
                startDate: firstDayOfMonth,
                endDate: lastDayOfMonth,
            }));
        }
    }, []);

    useEffect(() => {
        if (filters.startDate && filters.endDate) {
            generateReport();
        }
    }, [generateReport]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value === '' ? undefined : value
        }));
    };

    // Preparar datos para gráficos de ingresos vs egresos
    const prepareMonthlyComparisonData = () => {
        if (!incomeExpensesData?.monthlyComparisonData) return [];
        return Object.entries(incomeExpensesData.monthlyComparisonData).map(([month, data]) => ({
            month: new Date(month).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
            ingresos: data.income,
            egresos: data.expenses,
            utilidad: data.income - data.expenses
        }));
    };

    const prepareExpenseDistributionData = () => {
        if (!incomeExpensesData?.expenseDistributionData) return [];
        return Object.entries(incomeExpensesData.expenseDistributionData).map(([category, amount]) => ({
            name: category,
            value: amount
        }));
    };

    // Preparar datos para gráficos de flujo de caja
    const prepareDailyFlowData = () => {
        if (!cashFlowData?.dailyFlowData) return [];
        return Object.entries(cashFlowData.dailyFlowData).map(([date, amount]) => ({
            date: new Date(date).toLocaleDateString('es-PE'),
            flujo: amount
        }));
    };

    const prepareCreditsData = () => {
        if (!cashFlowData?.creditsData) return [];
        return Object.entries(cashFlowData.creditsData).map(([status, amount]) => ({
            name: status,
            value: amount
        }));
    };

    const prepareProjectionsData = () => {
        if (!cashFlowData?.projectionsData) return [];
        return Object.entries(cashFlowData.projectionsData).map(([period, amount]) => ({
            period,
            proyeccion: amount
        }));
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {reportType === 'financial-income' ? 'Filtros - Ingresos vs Egresos' : 'Filtros - Flujo de Caja'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Fecha Inicio</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Fecha Fin</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    {reportType === 'financial-income' && (
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Categoría de Gasto</label>
                            <select
                                name="expenseCategory"
                                value={filters.expenseCategory || ''}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todas</option>
                                {expenseCategoriesOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {reportType === 'financial-cashflow' && (
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Método de Pago</label>
                            <select
                                name="paymentMethod"
                                value={filters.paymentMethod || ''}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Todos</option>
                                {paymentMethodsOptions.map(option => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400">
                    <p>{error}</p>
                </div>
            )}

            {loading && (
                <div className="text-white text-center py-8">Cargando reporte...</div>
            )}

            {/* Reporte de Ingresos vs Egresos */}
            {reportType === 'financial-income' && incomeExpensesData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Ingresos Totales</p>
                                    <p className="text-3xl font-bold text-green-400">S/ {incomeExpensesData.totalIncome.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Egresos Totales</p>
                                    <p className="text-3xl font-bold text-red-400">S/ {incomeExpensesData.totalExpenses.toFixed(2)}</p>
                                </div>
                                <div className="bg-red-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Utilidad Neta</p>
                                    <p className={`text-3xl font-bold ${incomeExpensesData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        S/ {incomeExpensesData.netProfit.toFixed(2)}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${incomeExpensesData.netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}>
                                    <svg className={`h-8 w-8 ${incomeExpensesData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Comparación mensual */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Comparación Mensual</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={prepareMonthlyComparisonData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="month" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="ingresos" fill="#10b981" />
                                    <Bar dataKey="egresos" fill="#ef4444" />
                                    <Line type="monotone" dataKey="utilidad" stroke="#f97316" strokeWidth={3} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Distribución de gastos */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Distribución de Gastos</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={prepareExpenseDistributionData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ rango, percent }) =>
                                            `${rango} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {prepareExpenseDistributionData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Análisis de rentabilidad */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Análisis de Rentabilidad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-700 p-4 rounded-lg">
                                <p className="text-sm text-slate-400 mb-1">Margen de Utilidad</p>
                                <p className="text-2xl font-bold text-white">
                                    {((incomeExpensesData.netProfit / incomeExpensesData.totalIncome) * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-slate-700 p-4 rounded-lg">
                                <p className="text-sm text-slate-400 mb-1">Ratio Ingresos/Egresos</p>
                                <p className="text-2xl font-bold text-white">
                                    {(incomeExpensesData.totalIncome / incomeExpensesData.totalExpenses).toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-slate-700 p-4 rounded-lg">
                                <p className="text-sm text-slate-400 mb-1">ROI</p>
                                <p className="text-2xl font-bold text-white">
                                    {((incomeExpensesData.netProfit / incomeExpensesData.totalExpenses) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Reporte de Flujo de Caja */}
            {reportType === 'financial-cashflow' && cashFlowData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Efectivo Recibido</p>
                                    <p className="text-3xl font-bold text-green-400">S/ {cashFlowData.cashReceived.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Transferencias</p>
                                    <p className="text-3xl font-bold text-blue-400">S/ {cashFlowData.transfersReceived.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Flujo Total</p>
                                    <p className="text-3xl font-bold text-orange-400">
                                        S/ {(cashFlowData.cashReceived + cashFlowData.transfersReceived).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-orange-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Flujo diario */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Flujo de Caja Diario</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareDailyFlowData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Line type="monotone" dataKey="flujo" stroke="#f97316" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Estado de créditos */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Estado de Créditos</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={prepareCreditsData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ rango, percent }) =>
                                            `${rango} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {prepareCreditsData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Proyecciones */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Proyecciones de Flujo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={prepareProjectionsData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="period" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Bar dataKey="proyeccion" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}

