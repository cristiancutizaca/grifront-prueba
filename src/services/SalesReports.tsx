'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import ReportService, { GetSalesReportFilters, SalesReportData, SalesByEmployeeData } from '../../src/services/reportService';



interface SalesReportsProps {
    reportType: 'sales-period' | 'sales-employee';
}

interface Option {
    id: number | string;
    name: string;
}


const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export default function SalesReports({ reportType }: SalesReportsProps) {
    const [filters, setFilters] = useState<GetSalesReportFilters>({
        startDate: '',
        endDate: '',
        productId: undefined,
        clientId: undefined,
        employeeId: undefined,
        shiftId: undefined,
    });

    const [periodData, setPeriodData] = useState<SalesReportData | null>(null);
    const [employeeData, setEmployeeData] = useState<SalesByEmployeeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para opciones de filtros (simulados - deberían venir de servicios)
    const [clientsOptions] = useState<Option[]>([
        { id: 1, name: 'Cliente A' },
        { id: 2, name: 'Cliente B' },
    ]);
    const [productsOptions] = useState<Option[]>([
        { id: 1, name: 'Gasolina 90' },
        { id: 2, name: 'Gasolina 95' },
        { id: 3, name: 'Diesel' },
    ]);
    const [employeesOptions] = useState<Option[]>([
        { id: 1, name: 'Juan Pérez' },
        { id: 2, name: 'María García' },
        { id: 3, name: 'Carlos López' },
    ]);

    const generateReport = useCallback(async () => {
        if (!filters.startDate || !filters.endDate) return;

        setLoading(true);
        setError(null);

        try {
            if (reportType === 'sales-period') {
                const data = await ReportService.getSalesByPeriodReport(filters);
                setPeriodData(data);
            } else {
                const data = await ReportService.getSalesByEmployeeReport(filters);
                setEmployeeData(data);
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
            [name]: value === '' ? undefined : (name.includes('Id') ? parseInt(value) : value)
        }));
    };

    // Preparar datos para gráficos
    const prepareTimelineData = () => {
        if (!periodData?.timelineData) return [];
        return Object.entries(periodData.timelineData).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('es-PE'),
            ventas: data.sales,
            cantidad: data.quantity
        }));
    };

    const prepareProductData = () => {
        if (!periodData?.salesByProduct) return [];
        return Object.entries(periodData.salesByProduct).map(([product, data]) => ({
            name: product,
            amount: data.amount,
            quantity: data.quantity
        }));
    };

    const preparePaymentMethodData = () => {
        if (!periodData?.salesByPaymentMethod) return [];
        return Object.entries(periodData.salesByPaymentMethod).map(([method, amount]) => ({
            name: method,
            value: amount
        }));
    };

    const prepareEmployeeRankingData = () => {
        if (!employeeData?.rankingData) return [];
        return employeeData.rankingData.slice(0, 10); // Top 10
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {reportType === 'sales-period' ? 'Filtros - Ventas por Período' : 'Filtros - Ventas por Empleado'}
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
                    {reportType === 'sales-period' && (
                        <>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Producto</label>
                                <select
                                    name="productId"
                                    value={filters.productId || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Todos</option>
                                    {productsOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Cliente</label>
                                <select
                                    name="clientId"
                                    value={filters.clientId || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Todos</option>
                                    {clientsOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Empleado</label>
                        <select
                            name="employeeId"
                            value={filters.employeeId || ''}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Todos</option>
                            {employeesOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </select>
                    </div>
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

            {/* Reporte por Período */}
            {reportType === 'sales-period' && periodData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Ventas Totales</p>
                                    <p className="text-3xl font-bold text-white">S/ {periodData.totalSales.toFixed(2)}</p>
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
                                    <p className="text-sm text-slate-400 uppercase">Cantidad Total</p>
                                    <p className="text-3xl font-bold text-white">{periodData.totalQuantity.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Promedio por Transacción</p>
                                    <p className="text-3xl font-bold text-white">S/ {periodData.averageTransaction.toFixed(2)}</p>
                                </div>
                                <div className="bg-orange-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Línea de tiempo */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Ventas por Día</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareTimelineData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Line type="monotone" dataKey="ventas" stroke="#f97316" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Ventas por producto */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Ventas por Producto</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareProductData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="amount" fill="#f97316" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Métodos de pago */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700 lg:col-span-2">
                            <h3 className="text-lg font-semibold text-white mb-4">Distribución por Método de Pago</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={preparePaymentMethodData()}
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
                                        {preparePaymentMethodData().map((entry, index) => (
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
                </>
            )}

            {/* Reporte por Empleado */}
            {reportType === 'sales-employee' && employeeData && (
                <>
                    {/* KPI */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400 uppercase">Total de Empleados Activos</p>
                                <p className="text-3xl font-bold text-white">{employeeData.totalEmployees}</p>
                            </div>
                            <div className="bg-purple-500/20 p-3 rounded-full">
                                <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Ranking de empleados */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Ranking de Ventas por Empleado</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={prepareEmployeeRankingData()} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Bar dataKey="totalSales" fill="#f97316" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabla detallada */}
                    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
                        <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">Detalle por Empleado</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-white">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="p-4 text-sm text-slate-400">Empleado</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Ventas Totales</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Cantidad de Ventas</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Cantidad Total</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Promedio por Venta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {prepareEmployeeRankingData().map((employee, index) => (
                                        <tr key={employee.name} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500 text-yellow-900' :
                                                            index === 1 ? 'bg-gray-400 text-gray-900' :
                                                                index === 2 ? 'bg-orange-600 text-orange-100' :
                                                                    'bg-slate-600 text-slate-300'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                    <span>{employee.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-semibold text-green-400">
                                                S/ {employee.totalSales.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-right">{employee.salesCount}</td>
                                            <td className="p-4 text-right">{employee.totalQuantity.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                S/ {(employee.totalSales / employee.salesCount).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

