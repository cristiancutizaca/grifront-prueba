'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ReportService, { GetInventoryFilters, InventoryStockData, InventoryMovementsData } from '../../src/services/reportService';



interface InventoryReportsProps {
    reportType: 'inventory-stock' | 'inventory-movements';
}


interface Option {
    id: number | string;
    name: string;
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InventoryReports({ reportType }: InventoryReportsProps) {
    const [filters, setFilters] = useState<GetInventoryFilters>({
        productId: undefined,
        tankId: undefined,
        startDate: '',
        endDate: '',
        movementType: undefined,
    });

    const [stockData, setStockData] = useState<InventoryStockData[] | null>(null);
    const [movementsData, setMovementsData] = useState<InventoryMovementsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para opciones de filtros (simulados - deberían venir de servicios)
    const [productsOptions] = useState<Option[]>([
        { id: 1, name: 'Gasolina 90' },
        { id: 2, name: 'Gasolina 95' },
        { id: 3, name: 'Diesel' },
    ]);
    const [tanksOptions] = useState<Option[]>([
        { id: 1, name: 'Tanque A - Gasolina 90' },
        { id: 2, name: 'Tanque B - Gasolina 95' },
        { id: 3, name: 'Tanque C - Diesel' },
    ]);
    const movementTypesOptions: Option[] = [
        { id: 'entrada', name: 'Entrada' },
        { id: 'salida', name: 'Salida' },
        { id: 'ajuste', name: 'Ajuste' },
    ];

    const generateReport = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (reportType === 'inventory-stock') {
                const data = await ReportService.getCurrentStockReport(filters);
                setStockData(data);
            } else {
                if (!filters.startDate || !filters.endDate) {
                    setError('Las fechas de inicio y fin son requeridas para el reporte de movimientos');
                    return;
                }
                const data = await ReportService.getInventoryMovementsReport(filters);
                setMovementsData(data);
            }
        } catch (err: any) {
            setError(err.message || 'Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    }, [filters, reportType]);

    useEffect(() => {
        // Establecer fechas por defecto para movimientos
        if (reportType === 'inventory-movements' && (!filters.startDate || !filters.endDate)) {
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
        if (reportType === 'inventory-stock' || (filters.startDate && filters.endDate)) {
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

    // Preparar datos para gráficos de stock
    const prepareStockLevelsData = () => {
        if (!stockData) return [];
        return stockData.map(tank => ({
            name: tank.tankName,
            stock: tank.currentStock,
            capacidad: tank.capacity,
            porcentaje: tank.fillPercentage,
            producto: tank.productName
        }));
    };

    const prepareLowStockData = () => {
        if (!stockData) return [];
        return stockData.filter(tank => tank.isLowStock).map(tank => ({
            name: tank.tankName,
            stock: tank.currentStock,
            capacidad: tank.capacity,
            porcentaje: tank.fillPercentage
        }));
    };

    // Preparar datos para gráficos de movimientos
    const prepareMovementFlowData = () => {
        if (!movementsData?.flowData) return [];
        return Object.entries(movementsData.flowData).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('es-PE'),
            entradas: data.in,
            salidas: data.out,
            ajustes: data.adjustments
        }));
    };

    const prepareMovementTypeData = () => {
        if (!movementsData) return [];
        return [
            { name: 'Entradas', value: movementsData.totalIn, color: '#10b981' },
            { name: 'Salidas', value: Math.abs(movementsData.totalOut), color: '#ef4444' },
            { name: 'Ajustes', value: Math.abs(movementsData.netAdjustments), color: '#f59e0b' }
        ];
    };

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {reportType === 'inventory-stock' ? 'Filtros - Stock Actual' : 'Filtros - Movimientos de Inventario'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <label className="block text-sm text-slate-400 mb-1">Tanque</label>
                        <select
                            name="tankId"
                            value={filters.tankId || ''}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Todos</option>
                            {tanksOptions.map(option => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </select>
                    </div>
                    {reportType === 'inventory-movements' && (
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
                                <label className="block text-sm text-slate-400 mb-1">Tipo de Movimiento</label>
                                <select
                                    name="movementType"
                                    value={filters.movementType || ''}
                                    onChange={handleFilterChange}
                                    className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Todos</option>
                                    {movementTypesOptions.map(option => (
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

            {/* Reporte de Stock Actual */}
            {reportType === 'inventory-stock' && stockData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Total de Tanques</p>
                                    <p className="text-3xl font-bold text-white">{stockData.length}</p>
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
                                    <p className="text-sm text-slate-400 uppercase">Tanques con Stock Bajo</p>
                                    <p className="text-3xl font-bold text-red-400">{stockData.filter(t => t.isLowStock).length}</p>
                                </div>
                                <div className="bg-red-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Capacidad Promedio</p>
                                    <p className="text-3xl font-bold text-white">
                                        {(stockData.reduce((acc, tank) => acc + tank.fillPercentage, 0) / stockData.length).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos de Stock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Niveles de stock por tanque */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Niveles de Stock por Tanque</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareStockLevelsData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="porcentaje" fill="#f97316" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Alertas de stock bajo */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Alertas de Stock Bajo</h3>
                            {prepareLowStockData().length > 0 ? (
                                <div className="space-y-3">
                                    {prepareLowStockData().map((tank, index) => (
                                        <div key={index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-red-400">{tank.name}</h4>
                                                    <p className="text-sm text-slate-400">
                                                        {tank.stock} / {tank.capacidad} litros
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold text-red-400">
                                                        {tank.porcentaje.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <svg className="h-12 w-12 mx-auto mb-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No hay tanques con stock bajo</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla detallada de stock */}
                    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
                        <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">Detalle de Stock por Tanque</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-white">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="p-4 text-sm text-slate-400">Tanque</th>
                                        <th className="p-4 text-sm text-slate-400">Producto</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Stock Actual</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Capacidad</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">% Llenado</th>
                                        <th className="p-4 text-sm text-slate-400">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {stockData.map((tank, index) => (
                                        <tr key={index} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4 font-medium">{tank.tankName}</td>
                                            <td className="p-4">{tank.productName}</td>
                                            <td className="p-4 text-right">{tank.currentStock.toFixed(2)} L</td>
                                            <td className="p-4 text-right">{tank.capacity.toFixed(2)} L</td>
                                            <td className="p-4 text-right">
                                                <span className={`font-semibold ${tank.fillPercentage < 20 ? 'text-red-400' :
                                                        tank.fillPercentage < 50 ? 'text-yellow-400' :
                                                            'text-green-400'
                                                    }`}>
                                                    {tank.fillPercentage.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full ${tank.isLowStock
                                                        ? 'bg-red-900 text-red-300'
                                                        : 'bg-green-900 text-green-300'
                                                    }`}>
                                                    {tank.isLowStock ? 'Stock Bajo' : 'Normal'}
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

            {/* Reporte de Movimientos */}
            {reportType === 'inventory-movements' && movementsData && (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Total Entradas</p>
                                    <p className="text-3xl font-bold text-green-400">{movementsData.totalIn.toFixed(2)} L</p>
                                </div>
                                <div className="bg-green-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Total Salidas</p>
                                    <p className="text-3xl font-bold text-red-400">{Math.abs(movementsData.totalOut).toFixed(2)} L</p>
                                </div>
                                <div className="bg-red-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400 uppercase">Ajustes Netos</p>
                                    <p className="text-3xl font-bold text-yellow-400">{movementsData.netAdjustments.toFixed(2)} L</p>
                                </div>
                                <div className="bg-yellow-500/20 p-3 rounded-full">
                                    <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gráficos de Movimientos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Flujo de movimientos por día */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Flujo de Movimientos por Día</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={prepareMovementFlowData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f3f4f6' }}
                                    />
                                    <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="salidas" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="ajustes" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Distribución por tipo de movimiento */}
                        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Distribución por Tipo</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={prepareMovementTypeData()}
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
                                        {prepareMovementTypeData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Tabla de movimientos detallados */}
                    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
                        <h3 className="text-lg font-semibold text-white p-4 border-b border-slate-700">Movimientos Detallados</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-white">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="p-4 text-sm text-slate-400">Fecha</th>
                                        <th className="p-4 text-sm text-slate-400">Producto</th>
                                        <th className="p-4 text-sm text-slate-400">Tipo</th>
                                        <th className="p-4 text-sm text-slate-400 text-right">Cantidad</th>
                                        <th className="p-4 text-sm text-slate-400">Razón</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {movementsData.movementDetails.slice(0, 20).map((movement, index) => (
                                        <tr key={movement.movement_id || index} className="hover:bg-slate-700/30 transition">
                                            <td className="p-4">
                                                {new Date(movement.movement_date).toLocaleDateString('es-PE')}
                                            </td>
                                            <td className="p-4">{movement.product.name}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full ${movement.movement_type === 'entrada' ? 'bg-green-900 text-green-300' :
                                                        movement.movement_type === 'salida' ? 'bg-red-900 text-red-300' :
                                                            'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    {movement.movement_type}
                                                </span>
                                            </td>
                                            <td className={`p-4 text-right font-semibold ${movement.movement_type === 'entrada' ? 'text-green-400' :
                                                    movement.movement_type === 'salida' ? 'text-red-400' :
                                                        'text-yellow-400'
                                                }`}>
                                                {movement.movement_type === 'entrada' ? '+' :
                                                    movement.movement_type === 'salida' ? '-' : '±'}
                                                {Math.abs(movement.quantity).toFixed(2)} L
                                            </td>
                                            <td className="p-4 text-slate-400">{movement.reason || 'N/A'}</td>
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

