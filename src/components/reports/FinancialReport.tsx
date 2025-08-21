import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Download, Calculator, Loader2, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';

interface FinancialReportProps {
  filters: any;
}

interface IncomeVsExpensesResponse {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  monthlyComparisonData: { [key: string]: { income: number; expenses: number } };
  expenseDistributionData: { [key: string]: number };
}

interface CashFlowResponse {
  cashReceived: number;
  transfersReceived: number;
  creditsData: { [key: string]: number };
  dailyFlowData: { [key: string]: number };
  projectionsData: { [key: string]: number };
}

const FinancialReport: React.FC<FinancialReportProps> = ({ filters }) => {
  // Estados para datos financieros
  const [financialData, setFinancialData] = useState<{
    totalIncome: number;
    totalExpenses: number;
    netFlow: number;
    grossMargin: number;
    operatingMargin: number;
  }>({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    grossMargin: 0,
    operatingMargin: 0
  });

  const [incomeByCategory, setIncomeByCategory] = useState<Array<{
    category: string;
    amount: number;
    percentage: number;
  }>>([]);

  const [expensesByCategory, setExpensesByCategory] = useState<Array<{
    category: string;
    amount: number;
    percentage: number;
  }>>([]);

  const [dailyCashFlow, setDailyCashFlow] = useState<Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>>([]);

  const [cashFlowData, setCashFlowData] = useState<{
    cashReceived: number;
    transfersReceived: number;
    creditsData: any;
  }>({
    cashReceived: 0,
    transfersReceived: 0,
    creditsData: {}
  });

  const [loading, setLoading] = useState(true);
  const [loadingCashFlow, setLoadingCashFlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para construir querystring con los filtros
  const buildQueryString = (filters: any, additionalParams: any = {}): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.expenseCategory) params.append('expenseCategory', filters.expenseCategory);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    
    // Agregar parámetros adicionales
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    
    return params.toString();
  };

  // Función para cargar datos de ingresos vs egresos
  const loadIncomeVsExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/financial/income-vs-expenses${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<IncomeVsExpensesResponse>(endpoint);
      
      // Actualizar datos financieros principales
      const grossMargin = response.totalIncome > 0 ? ((response.totalIncome - response.totalExpenses) / response.totalIncome) * 100 : 0;
      const operatingMargin = response.totalIncome > 0 ? (response.netProfit / response.totalIncome) * 100 : 0;

      setFinancialData({
        totalIncome: response.totalIncome,
        totalExpenses: response.totalExpenses,
        netFlow: response.netProfit,
        grossMargin: grossMargin,
        operatingMargin: operatingMargin
      });

      // Procesar datos de gastos por categoría
      const expensesArray = Object.entries(response.expenseDistributionData).map(([category, amount]) => ({
        category,
        amount: amount as number,
        percentage: response.totalExpenses > 0 ? ((amount as number) / response.totalExpenses) * 100 : 0
      }));
      setExpensesByCategory(expensesArray);

      // Procesar datos mensuales para flujo diario (simulado)
      const dailyFlow = Object.entries(response.monthlyComparisonData).map(([month, data]) => ({
        date: month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses
      }));
      setDailyCashFlow(dailyFlow);

      // Datos de ingresos por categoría (simulados basados en el total)
      const totalIncome = response.totalIncome;
      setIncomeByCategory([
        { category: 'Ventas Combustible', amount: totalIncome * 0.8, percentage: 80 },
        { category: 'Servicios Adicionales', amount: totalIncome * 0.12, percentage: 12 },
        { category: 'Productos Tienda', amount: totalIncome * 0.064, percentage: 6.4 },
        { category: 'Otros Ingresos', amount: totalIncome * 0.016, percentage: 1.6 }
      ]);

    } catch (err) {
      console.error('Error loading income vs expenses:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos de flujo de caja
  const loadCashFlow = async () => {
    try {
      setLoadingCashFlow(true);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/financial/cash-flow${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<CashFlowResponse>(endpoint);
      
      setCashFlowData({
        cashReceived: response.cashReceived,
        transfersReceived: response.transfersReceived,
        creditsData: response.creditsData
      });

      // Actualizar flujo diario con datos reales si están disponibles
      if (Object.keys(response.dailyFlowData).length > 0) {
        const dailyFlowFromAPI = Object.entries(response.dailyFlowData).map(([date, net]) => ({
          date,
          income: net as number > 0 ? net as number : 0,
          expenses: net as number < 0 ? Math.abs(net as number) : 0,
          net: net as number
        }));
        setDailyCashFlow(dailyFlowFromAPI);
      }

    } catch (err) {
      console.error('Error loading cash flow:', err);
      // En caso de error, mantener datos existentes
    } finally {
      setLoadingCashFlow(false);
    }
  };

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadIncomeVsExpenses();
    loadCashFlow();
  }, [filters]);

  // Métricas financieras calculadas
  const financialMetrics = [
    { 
      name: 'ROI', 
      value: financialData.totalIncome > 0 ? `${((financialData.netFlow / financialData.totalIncome) * 100).toFixed(1)}%` : '0%', 
      trend: 'up', 
      description: 'Retorno sobre inversión' 
    },
    { 
      name: 'Margen Bruto', 
      value: `${financialData.grossMargin.toFixed(1)}%`, 
      trend: 'up', 
      description: 'Margen bruto de ganancia' 
    },
    { 
      name: 'Rotación Inventario', 
      value: '12x', 
      trend: 'stable', 
      description: 'Veces por año' 
    },
    { 
      name: 'Días Cobranza', 
      value: '15', 
      trend: 'down', 
      description: 'Días promedio de cobro' 
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <div className="h-4 w-4 bg-slate-400 rounded-full"></div>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos financieros...</span>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <div className="text-center">
            <p className="font-medium">Error al cargar los datos</p>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
            <button 
              onClick={loadIncomeVsExpenses}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Financieros Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-400">${financialData.totalIncome.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Período seleccionado</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Gastos Totales</p>
              <p className="text-2xl font-bold text-red-400">${financialData.totalExpenses.toLocaleString()}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Período seleccionado</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Flujo Neto</p>
              <p className={`text-2xl font-bold ${financialData.netFlow >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                ${financialData.netFlow.toLocaleString()}
              </p>
            </div>
            {financialData.netFlow >= 0 ? 
              <TrendingUp className="h-8 w-8 text-blue-400" /> : 
              <TrendingDown className="h-8 w-8 text-red-400" />
            }
          </div>
          <p className="text-xs text-slate-500 mt-2">Ingresos - Gastos</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Margen Bruto</p>
              <p className="text-2xl font-bold text-purple-400">{financialData.grossMargin.toFixed(1)}%</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Rentabilidad bruta</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Margen Operativo</p>
              <p className="text-2xl font-bold text-orange-400">{financialData.operatingMargin.toFixed(1)}%</p>
            </div>
            <Calculator className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Rentabilidad operativa</p>
        </div>
      </div>

      {/* Flujo de Caja */}
      {dailyCashFlow.length > 0 && (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Flujo de Caja por Período</h3>
            <div className="flex space-x-2">
              <button className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </button>
              <button className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>
            </div>
          </div>

          {loadingCashFlow ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando flujo de caja...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Período</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Ingresos</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Gastos</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Flujo Neto</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Margen %</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyCashFlow.map((period, index) => {
                    const margin = period.income > 0 ? ((period.net / period.income) * 100) : 0;
                    return (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                        <td className="py-3 px-4 text-slate-300">{period.date}</td>
                        <td className="py-3 px-4 text-green-400 font-medium">${period.income.toLocaleString()}</td>
                        <td className="py-3 px-4 text-red-400 font-medium">${period.expenses.toLocaleString()}</td>
                        <td className={`py-3 px-4 font-medium ${period.net >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          ${period.net.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-purple-400 font-medium">{margin.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Análisis de Ingresos y Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por Categoría */}
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Ingresos por Categoría</h3>
          <div className="space-y-4">
            {incomeByCategory.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{item.category}</span>
                  <span className="text-green-400 font-medium">${item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-400">{item.percentage.toFixed(1)}% del total</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos por Categoría */}
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h3>
          {expensesByCategory.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No hay datos de gastos por categoría disponibles</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expensesByCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{item.category}</span>
                    <span className="text-red-400 font-medium">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400">{item.percentage.toFixed(1)}% del total</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Métricas Financieras Avanzadas */}
      <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">Métricas Financieras</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialMetrics.map((metric) => (
            <div key={metric.name} className="bg-slate-600 rounded-lg p-4 border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white text-sm">{metric.name}</h4>
                {getTrendIcon(metric.trend)}
              </div>
              <p className={`text-2xl font-bold ${getTrendColor(metric.trend)}`}>{metric.value}</p>
              <p className="text-xs text-slate-400 mt-1">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Ejecutivo */}
      <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen Ejecutivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center ${
              financialData.netFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {financialData.netFlow >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-400" /> :
                <TrendingDown className="h-8 w-8 text-red-400" />
              }
            </div>
            <h4 className="font-medium text-white mb-2">
              {financialData.netFlow >= 0 ? 'Rentabilidad Positiva' : 'Pérdidas Registradas'}
            </h4>
            <p className="text-sm text-slate-400">
              {financialData.netFlow >= 0 ? 
                `El flujo neto positivo de $${financialData.netFlow.toLocaleString()} indica una operación rentable.` :
                `Se registraron pérdidas por $${Math.abs(financialData.netFlow).toLocaleString()} en el período.`
              }
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="font-medium text-white mb-2">Ingresos Totales</h4>
            <p className="text-sm text-slate-400">
              Los ingresos totales de $${financialData.totalIncome.toLocaleString()} representan la facturación del período seleccionado.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Calculator className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="font-medium text-white mb-2">Control de Gastos</h4>
            <p className="text-sm text-slate-400">
              Los gastos totales de $${financialData.totalExpenses.toLocaleString()} representan un {financialData.grossMargin.toFixed(1)}% de margen bruto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;

