'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReportService, { GetCreditsFilters, CreditsOutstandingData, CreditsCollectionsData } from '../../src/services/reportService';

interface CreditsReportsProps {
    reportType: 'credits-outstanding' | 'credits-collections';
}



interface Option {
    id: number | string;
    name: string;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CreditsReports({ reportType }: CreditsReportsProps) {
    const [filters, setFilters] = useState<GetCreditsFilters>({
        clientId: undefined,
        status: undefined,
        dueDateStart: undefined,
        dueDateEnd: undefined,
        startDate: '',
        endDate: '',
        paymentMethod: undefined,
    });

    const [outstandingData, setOutstandingData] = useState<CreditsOutstandingData | null>(null);
    const [collectionsData, setCollectionsData] = useState<CreditsCollectionsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para opciones de filtros (simulados - deberían venir de servicios)
    const [clientsOptions] = useState<Option[]>([
        { id: 1, name: 'Cliente A' },
        { id: 2, name: 'Cliente B' },
        { id: 3, name: 'Cliente C' },
    ]);
    const statusOptions: Option[] = [
        { id: 'pendiente', name: 'Pendiente' },
        { id: 'parcial', name: 'Pago Parcial' },
        { id: 'pagado', name: 'Pagado' },
        { id: 'vencido', name: 'Vencido' },
    ];
    const [paymentMethodsOptions] = useState<Option[]>([
        { id: 'efectivo', name: 'Efectivo' },
        { id: 'transferencia', name: 'Transferencia' },
        { id: 'tarjeta', name: 'Tarjeta' },
    ]);

    const generateReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (reportType === 'credits-outstanding') {
                const data = await ReportService.getOutstandingCreditsReport(filters);
                setOutstandingData(data);
            } else {
                if (!filters.startDate || !filters.endDate) {
                    setError('Las fechas de inicio y fin son requeridas para el reporte de cobros');
                    return;
                }
                const data = await ReportService.getCollectionsReport(filters);
                setCollectionsData(data);
            }
        } catch (err: any) {
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    }, [filters, reportType]);

    useEffect(() => {
        // Establecer fechas por defecto para cobros
        if (reportType === 'credits-collections' && (!filters.startDate || !filters.endDate)) {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            setFilters(prev => ({
                ...prev,
                startDate: firstDayOfMonth,
                endDate: lastDayOfMonth,
            }));
        } else {
            generateReport();
        }
    }, [reportType]);

    useEffect(() => {
        if (reportType === 'credits-outstanding' || (filters.startDate && filters.endDate)) {
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

    // Preparar datos para gráficos de créditos pendientes
    const prepareAgingData = () => {
        if (!outstandingData?.agingData) return [];
        return Object.entries(outstandingData.agingData).map(([range, amount]) => ({
            rango: range,
            monto: amount
        }));
    };

    const prepareDelinquentClientsData = () => {
        if (!outstandingData?.delinquentClients) return [];
        return outstandingData.delinquentClients.slice(0, 10).map(credit => ({
            cliente: credit.client.first_name && credit.client.last_name
                ? `${credit.client.first_name} ${credit.client.last_name}`
                : credit.client.company_name || `Cliente ${credit.credit_id}`,
            monto: credit.remaining_amount,
            vencimiento: credit.due_date,
            diasVencido: Math.floor((new Date().getTime() - new Date(credit.due_date).getTime()) / (1000 * 60 * 60 * 24))
        }));
    };

    // Preparar datos para gráficos de cobros
    const prepareCollectionTrendsData = () => {
        if (!collectionsData?.collectionTrends) return [];
        return Object.entries(collectionsData.collectionTrends).map(([date, amount]) => ({
            fecha: new Date(date).toLocaleDateString('es-PE'),
            cobros: amount
        }));
    };

    const preparePortfolioRecoveryData = () => {
        if (!collectionsData?.portfolioRecovery) return [];
        return Object.entries(collectionsData.portfolioRecovery).map(([period, amount]) => ({
            periodo: period,
            recuperacion: amount
        }));
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {reportType === 'credits-outstanding' ? 'Filtros - Créditos Pendientes' : 'Filtros - Cobros Realizados'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    {reportType === 'credits-outstanding' && (
                        <>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Estado</label>
                                <select
                                    name="status"
                                    value={filters.status || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Todos</option>
                                    {statusOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Vencimiento Desde</label>
                                <input
                                    type="date"
                                    name="dueDateStart"
                                    value={filters.dueDateStart || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Vencimiento Hasta</label>
                                <input
                                    type="date"
                                    name="dueDateEnd"
                                    value={filters.dueDateEnd || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </>
                    )}
                    {reportType === 'credits-collections' && (
                        <>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Fecha Fin</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
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
                        </>
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

            {/* Reporte de Créditos Pendientes */}
            {reportType === 'credits-outstanding' && outstandingData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Total Pendiente</p>
                                    <p className="text-3xl font-bold text-red-400">S/ {outstandingData.totalOutstanding.toFixed(2)}</p>
                                </div>
                                <div className="bg-red-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Pagos Parciales</p>
                                    <p className="text-3xl font-bold text-yellow-400">S/ {outstandingData.partialPayments.toFixed(2)}</p>
                                </div>
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Créditos Activos</p>
                                    <p className="text-3xl font-bold text-white">{outstandingData.creditsCount}</p>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Análisis de antigüedad */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Análisis de Antigüedad</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareAgingData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="rango" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="monto" fill="#f97316" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Distribución por antigüedad */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Distribución por Antigüedad</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={prepareAgingData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ rango, percent }) =>
                                            `${rango} ${((percent ?? 0) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="monto"
                                    >
                                        {prepareAgingData().map((entry, index) => (
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

                    {/* Tabla de clientes morosos */}
                    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
                        <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">Clientes con Mayor Deuda</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-white">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="p-4 text-sm text-slate-400">Cliente</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Monto Pendiente</th>
                                        <th className="p-4 text-sm text-slate-400">Fecha Vencimiento</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Días Vencido</th>
                                        <th className="p-4 text-sm text-slate-400">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {prepareDelinquentClientsData().map((client, index) => (
                                        <tr key={index} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4 font-medium">{client.cliente}</td>
                                            <td className="p-4 text-right font-semibold text-red-400">
                                                S/ {client.monto.toFixed(2)}
                                            </td>
                                            <td className="p-4">
                                                {new Date(client.vencimiento).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`font-semibold ${client.diasVencido > 0 ? 'text-red-400' : 'text-green-400'
                                                    }`}>
                                                    {client.diasVencido > 0 ? `+${client.diasVencido}` : client.diasVencido}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full ${client.diasVencido > 30 ? 'bg-red-900 text-red-300' :
                                                        client.diasVencido > 0 ? 'bg-yellow-900 text-yellow-300' :
                                                            'bg-green-900 text-green-300'
                                                    }`}>
                                                    {client.diasVencido > 30 ? 'Crítico' :
                                                        client.diasVencido > 0 ? 'Vencido' : 'Al día'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Reporte de Cobros */}
            {reportType === 'credits-collections' && collectionsData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Total Cobrado</p>
                                    <p className="text-3xl font-bold text-green-400">S/ {collectionsData.totalCollections.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Eficiencia de Cobro</p>
                                    <p className="text-3xl font-bold text-blue-400">{collectionsData.collectionEfficiency.toFixed(1)}%</p>
                                </div>
                                <div className="bg-blue-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Promedio Diario</p>
                                    <p className="text-3xl font-bold text-orange-400">
                                        S/ {(collectionsData.totalCollections / 30).toFixed(2)}
                                    </p>
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
                        {/* Tendencia de cobros */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Tendencia de Cobros</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareCollectionTrendsData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="fecha" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Line type="monotone" dataKey="cobros" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recuperación de cartera */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Recuperación de Cartera</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={preparePortfolioRecoveryData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="periodo" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="recuperacion" fill="#f97316" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Métricas de rendimiento */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Métricas de Rendimiento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-slate-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-slate-400 mb-1">Tasa de Recuperación</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {collectionsData.collectionEfficiency.toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-slate-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-slate-400 mb-1">Tiempo Promedio de Cobro</p>
                                <p className="text-2xl font-bold text-blue-400">15 días</p>
                            </div>
                            <div className="bg-slate-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-slate-400 mb-1">Cobros del Mes</p>
                                <p className="text-2xl font-bold text-orange-400">
                                    S/ {collectionsData.totalCollections.toFixed(0)}
                                </p>
                            </div>
                            <div className="bg-slate-700 p-4 rounded-lg text-center">
                                <p className="text-sm text-slate-400 mb-1">Meta Mensual</p>
                                <p className="text-2xl font-bold text-purple-400">85%</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

