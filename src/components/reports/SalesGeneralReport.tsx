import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, DollarSign, Download, Loader2, AlertCircle } from 'lucide-react';
import SalesChart from '../charts/SalesChart';
import KPICard from '../charts/KPICard';
import { ExportService } from '../../services/exportService';
import apiService from '../../services/apiService';

interface SalesGeneralReportProps {
  filters: any;
}

interface SalesData {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  growth: number;
}

interface SalesByDay {
  date: string;
  sales: number;
  orders: number;
}

interface SalesByPaymentMethod {
  name: string;
  value: number;
}

interface SalesByProduct {
  name: string;
  sales: number;
}

interface ApiResponse {
  summary: {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    growth: number;
  };
  dailyData: Array<{
    date: string;
    totalSales: number;
    totalOrders: number;
  }>;
  paymentMethodData: Array<{
    paymentMethod: string;
    totalSales: number;
  }>;
  productData: Array<{
    productName: string;
    totalSales: number;
  }>;
}

const SalesGeneralReport: React.FC<SalesGeneralReportProps> = ({ filters }) => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [salesByDay, setSalesByDay] = useState<SalesByDay[]>([]);
  const [salesByPaymentMethod, setSalesByPaymentMethod] = useState<SalesByPaymentMethod[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<SalesByProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para construir querystring con los filtros
  const buildQueryString = (filters: any): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.granularity) params.append('granularity', filters.granularity);
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.employeeId) params.append('employeeId', filters.employeeId);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    
    return params.toString();
  };

  // Función para cargar datos de la API
  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/sales/by-period${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<ApiResponse>(endpoint);
      
      // Adaptar datos de la API al formato esperado
      setSalesData({
        totalSales: response.summary.totalSales,
        totalOrders: response.summary.totalOrders,
        averageTicket: response.summary.averageTicket,
        growth: response.summary.growth
      });

      // Formatear datos diarios
      const formattedDailyData = response.dailyData.map(item => ({
        date: new Date(item.date).toLocaleDateString('es-ES', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        sales: item.totalSales,
        orders: item.totalOrders
      }));
      setSalesByDay(formattedDailyData);

      // Formatear datos por método de pago
      const formattedPaymentData = response.paymentMethodData.map(item => ({
        name: item.paymentMethod,
        value: item.totalSales
      }));
      setSalesByPaymentMethod(formattedPaymentData);

      // Formatear datos por producto
      const formattedProductData = response.productData.map(item => ({
        name: item.productName,
        sales: item.totalSales
      }));
      setSalesByProduct(formattedProductData);

    } catch (err) {
      console.error('Error loading sales data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadSalesData();
  }, [filters]);

  const handleExportExcel = () => {
    const exportData = ExportService.prepareSalesData(salesByDay);
    ExportService.exportToExcel(exportData);
  };

  const handleExportPDF = () => {
    const exportData = ExportService.prepareSalesData(salesByDay);
    ExportService.exportToPDF(exportData);
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de ventas...</span>
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
              onClick={loadSalesData}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos
  if (!salesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-slate-400">
          <p>No hay datos disponibles para el período seleccionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas Totales"
          value={`$${salesData.totalSales.toLocaleString()}`}
          subtitle="Total del período"
          icon={<DollarSign />}
          color="green"
          trend={salesData.growth >= 0 ? "up" : "down"}
          trendValue={`${salesData.growth >= 0 ? '+' : ''}${salesData.growth.toFixed(1)}%`}
        />
        <KPICard
          title="Número de Órdenes"
          value={salesData.totalOrders}
          subtitle="Transacciones realizadas"
          icon={<ShoppingCart />}
          color="blue"
          trend="up"
          trendValue="+8.2%"
        />
        <KPICard
          title="Ticket Promedio"
          value={`$${salesData.averageTicket.toFixed(2)}`}
          subtitle="Promedio por venta"
          icon={<TrendingUp />}
          color="purple"
          trend="up"
          trendValue="+3.8%"
        />
        <KPICard
          title="Crecimiento"
          value={`${salesData.growth.toFixed(1)}%`}
          subtitle="Vs período anterior"
          icon={<TrendingUp />}
          color="orange"
          trend={salesData.growth >= 0 ? "up" : "down"}
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart
          type="line"
          data={salesByDay}
          title="Evolución de Ventas Diarias"
          height={300}
        />
        <SalesChart
          type="pie"
          data={salesByPaymentMethod}
          title="Ventas por Método de Pago"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SalesChart
          type="bar"
          data={salesByProduct}
          title="Ventas por Producto"
          height={300}
        />
      </div>

      {/* Tabla de Ventas Detalladas */}
      <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Ventas por Día</h3>
          <div className="flex space-x-2">
            <button 
              onClick={handleExportExcel}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Fecha</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ventas ($)</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Órdenes</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ticket Promedio</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Variación</th>
              </tr>
            </thead>
            <tbody>
              {salesByDay.map((day, index) => {
                const avgTicket = day.sales / day.orders;
                const prevDay = index > 0 ? salesByDay[index - 1] : null;
                const variation = prevDay ? ((day.sales - prevDay.sales) / prevDay.sales * 100) : 0;
                
                return (
                  <tr key={day.date} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                    <td className="py-3 px-4 text-slate-300">{day.date}</td>
                    <td className="py-3 px-4 text-green-400 font-medium">${day.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-blue-400">{day.orders}</td>
                    <td className="py-3 px-4 text-purple-400">${avgTicket.toFixed(2)}</td>
                    <td className={`py-3 px-4 font-medium ${variation >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesGeneralReport;

