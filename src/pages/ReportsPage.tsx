import React, { useState } from 'react';
import Layout from '../components/Layout';
import ReportsNavigation, { ReportType } from '../services/ReportsNavigation';
import ReportsFilters, { FilterState } from '../components/ReportsFilters';
import SalesGeneralReport from '../components/reports/SalesGeneralReport';
import SalesEmployeeReport from '../components/reports/SalesEmployeeReport';
import InventoryReport from '../components/reports/InventoryReport';
import CreditsReport from '../components/reports/CreditsReport';
import FinancialReport from '../components/reports/FinancialReport';

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('sales-period');
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

  const renderActiveReport = () => {
    switch (activeReport) {
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
    switch (activeReport) {
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
    <Layout currentPage="reports">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Reportes de Grifosis</h1>

        {/* Sección de Navegación de Reportes */}
        <ReportsNavigation activeReport={activeReport} onReportChange={setActiveReport} />

        {/* Sección de Filtros Principales */}
        <ReportsFilters filters={filters} onFiltersChange={setFilters} />

        {/* Módulos de Reportes */}
        <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">{getReportTitle()}</h2>
          {renderActiveReport()}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;


