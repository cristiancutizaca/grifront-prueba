'use client';

import React, { useState } from 'react';
import ReportsNavigation, { ReportType } from '../../src/services/ReportsNavigation';
import ReportsFilters, { FilterState } from '../../src/components/ReportsFilters';
import SalesGeneralReport from '../../src/components/reports/SalesGeneralReport';
import SalesEmployeeReport from '../../src/components/reports/SalesEmployeeReport';
import InventoryReport from '../../src/components/reports/InventoryReport';
import CreditsReport from '../../src/components/reports/CreditsReport';
import FinancialReport from '../../src/components/reports/FinancialReport';

export default function MainReportsComponent() {
    const [selectedReport, setSelectedReport] = useState<ReportType>('sales-period');
    const [filters, setFilters] = useState<FilterState>({
        dateRange: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        },
        granularity: 'day',
        employee: '',
        product: '',
        paymentMethod: '',
        client: ''
    });

    const renderReportComponent = () => {
        switch (selectedReport) {
            case 'sales-period':
                return <SalesGeneralReport filters={filters} />;
            case 'sales-employee':
                return <SalesEmployeeReport filters={filters} />;
            case 'inventory-stock':
            case 'inventory-movements':
                return <InventoryReport filters={filters} />;
            case 'credits-outstanding':
            case 'credits-collections':
                return <CreditsReport filters={filters} />;
            case 'financial-income':
            case 'financial-cashflow':
                return <FinancialReport filters={filters} />;
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-slate-400">Selecciona un tipo de reporte para comenzar</p>
                    </div>
                );
        }
    };

    const getReportTitle = () => {
        switch (selectedReport) {
            case 'sales-period': return 'Ventas por Período';
            case 'sales-employee': return 'Ventas por Empleado';
            case 'inventory-stock': return 'Estado del Inventario';
            case 'inventory-movements': return 'Movimientos de Inventario';
            case 'credits-outstanding': return 'Créditos Pendientes';
            case 'credits-collections': return 'Cobros Realizados';
            case 'financial-income': return 'Análisis Financiero';
            case 'financial-cashflow': return 'Flujo de Caja';
            default: return 'Reportes';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-2">{getReportTitle()}</h1>
                    <p className="text-slate-400">Análisis completo de ventas, inventario, finanzas y créditos</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Navegación de reportes */}
                <div className="mb-8">
                    <ReportsNavigation
                        activeReport={selectedReport}
                        onReportChange={setSelectedReport}
                    />
                </div>
                
                {/* Sección de Filtros Principales */}
                <ReportsFilters filters={filters} onFiltersChange={setFilters} />

                {/* Contenido del reporte seleccionado */}
                <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6 mt-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Detalle del Reporte</h2>
                    {renderReportComponent()}
                </div>
            </div>
        </div>
    );
}