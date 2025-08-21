'use client';

import React from 'react';

export type ReportType =
    | 'sales-period'
    | 'sales-employee'
    | 'inventory-stock'
    | 'inventory-movements'
    | 'financial-income'
    | 'financial-cashflow'
    | 'credits-outstanding'
    | 'credits-collections';



interface ReportsNavigationProps {
    activeReport: ReportType;
    onReportChange: (reportType: ReportType) => void;
}

interface ReportOption {
    id: ReportType;
    name: string;
    description: string;
    icon: React.ReactNode;
    category: string;
}

const reportOptions: ReportOption[] = [
    // Reportes de Ventas
    {
        id: 'sales-period',
        name: 'Ventas por Período',
        description: 'Análisis de ventas en un rango de fechas',
        category: 'Ventas',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        )
    },
    {
        id: 'sales-employee',
        name: 'Ventas por Empleado',
        description: 'Rendimiento de ventas por vendedor',
        category: 'Ventas',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    // Reportes de Inventario
    {
        id: 'inventory-stock',
        name: 'Stock Actual',
        description: 'Estado actual del inventario y tanques',
        category: 'Inventario',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        )
    },
    {
        id: 'inventory-movements',
        name: 'Movimientos de Inventario',
        description: 'Entradas, salidas y ajustes de stock',
        category: 'Inventario',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        )
    },
    // Reportes Financieros
    {
        id: 'financial-income',
        name: 'Ingresos vs Egresos',
        description: 'Análisis financiero de ingresos y gastos',
        category: 'Financiero',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        id: 'financial-cashflow',
        name: 'Flujo de Caja',
        description: 'Análisis del flujo de efectivo',
        category: 'Financiero',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        )
    },
    // Reportes de Créditos
    {
        id: 'credits-outstanding',
        name: 'Créditos Pendientes',
        description: 'Análisis de cuentas por cobrar',
        category: 'Créditos',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    },
    {
        id: 'credits-collections',
        name: 'Cobros Realizados',
        description: 'Seguimiento de pagos de créditos',
        category: 'Créditos',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
];

const categoryColors = {
    'Ventas': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Inventario': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Financiero': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Créditos': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
};

export default function ReportsNavigation({ activeReport, onReportChange }: ReportsNavigationProps) {
    const groupedReports = reportOptions.reduce((acc, report) => {
        if (!acc[report.category]) {
            acc[report.category] = [];
        }
        acc[report.category].push(report);
        return acc;
    }, {} as Record<string, ReportOption[]>);

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tipos de Reportes</h2>

            <div className="space-y-6">
                {Object.entries(groupedReports).map(([category, reports]) => (
                    <div key={category}>
                        <h3 className={`text-sm font-medium mb-3 px-3 py-1 rounded-full inline-block border ${categoryColors[category as keyof typeof categoryColors]}`}>
                            {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {reports.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => onReportChange(report.id)}
                                    className={`p-4 rounded-lg border transition-all duration-200 text-left ${activeReport === report.id
                                        ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className={`p-2 rounded-lg ${activeReport === report.id
                                            ? 'bg-orange-500/30'
                                            : 'bg-slate-600'
                                            }`}>
                                            {report.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm mb-1 truncate">
                                                {report.name}
                                            </h4>
                                            <p className="text-xs opacity-75 line-clamp-2">
                                                {report.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

