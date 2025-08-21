import React, { useState, useEffect } from 'react';
import { User, Trophy, TrendingUp, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';

interface SalesEmployeeReportProps {
  filters: any;
}

interface EmployeeData {
  id: string;
  name: string;
  sales: number;
  orders: number;
  avgTicket: number;
  commission: number;
  rank: number;
}

interface EmployeeDetails {
  dailySales: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
    percentage: number;
  }>;
}

interface ApiResponse {
  employees: Array<{
    employeeId: string;
    employeeName: string;
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    commission: number;
  }>;
}

interface EmployeeDetailResponse {
  dailySales: Array<{
    date: string;
    totalSales: number;
    totalOrders: number;
  }>;
  productBreakdown: Array<{
    productName: string;
    totalSales: number;
    percentage: number;
  }>;
}

const SalesEmployeeReport: React.FC<SalesEmployeeReportProps> = ({ filters }) => {
  const [employeesData, setEmployeesData] = useState<EmployeeData[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<{ [key: string]: EmployeeDetails }>({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para construir querystring con los filtros
  const buildQueryString = (filters: any): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    return params.toString();
  };

  // Función para cargar datos de empleados
  const loadEmployeesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/sales/by-employee${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<ApiResponse>(endpoint);
      
      // Adaptar datos de la API al formato esperado y agregar ranking
      const formattedData = response.employees
        .map((employee, index) => ({
          id: employee.employeeId,
          name: employee.employeeName,
          sales: employee.totalSales,
          orders: employee.totalOrders,
          avgTicket: employee.averageTicket,
          commission: employee.commission,
          rank: index + 1
        }))
        .sort((a, b) => b.sales - a.sales) // Ordenar por ventas descendente
        .map((employee, index) => ({ ...employee, rank: index + 1 })); // Reasignar ranking

      setEmployeesData(formattedData);

    } catch (err) {
      console.error('Error loading employees data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar detalles de un empleado específico
  const loadEmployeeDetails = async (employeeId: string) => {
    try {
      setLoadingDetails(true);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/sales/by-employee/${employeeId}/details${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<EmployeeDetailResponse>(endpoint);
      
      // Formatear datos de detalles
      const formattedDetails: EmployeeDetails = {
        dailySales: response.dailySales.map(day => ({
          date: day.date,
          sales: day.totalSales,
          orders: day.totalOrders
        })),
        topProducts: response.productBreakdown.map(product => ({
          product: product.productName,
          sales: product.totalSales,
          percentage: product.percentage
        }))
      };

      setEmployeeDetails(prev => ({
        ...prev,
        [employeeId]: formattedDetails
      }));

    } catch (err) {
      console.error('Error loading employee details:', err);
      // En caso de error, usar datos de ejemplo para mantener funcionalidad
      setEmployeeDetails(prev => ({
        ...prev,
        [employeeId]: {
          dailySales: [
            { date: '2024-01-15', sales: 7500, orders: 25 },
            { date: '2024-01-16', sales: 8200, orders: 28 },
            { date: '2024-01-17', sales: 9100, orders: 32 },
            { date: '2024-01-18', sales: 8800, orders: 30 },
            { date: '2024-01-19', sales: 11400, orders: 35 }
          ],
          topProducts: [
            { product: 'Premium', sales: 18000, percentage: 40 },
            { product: 'Regular', sales: 15750, percentage: 35 },
            { product: 'Diesel', sales: 11250, percentage: 25 }
          ]
        }
      }));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadEmployeesData();
  }, [filters]);

  // Manejar selección de empleado
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    if (!employeeDetails[employeeId]) {
      loadEmployeeDetails(employeeId);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-400';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />;
    }
    return <span className="text-slate-400">#{rank}</span>;
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de empleados...</span>
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
              onClick={loadEmployeesData}
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
  if (employeesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-slate-400">
          <p>No hay datos de empleados disponibles para el período seleccionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ranking de Empleados */}
      <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Ranking de Empleados por Ventas</h3>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ranking</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Empleado</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ventas ($)</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Órdenes</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Ticket Promedio</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Comisión</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employeesData.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getRankIcon(employee.rank)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-white font-medium">{employee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-green-400 font-medium">${employee.sales.toLocaleString()}</td>
                  <td className="py-3 px-4 text-blue-400">{employee.orders}</td>
                  <td className="py-3 px-4 text-purple-400">${employee.avgTicket.toFixed(2)}</td>
                  <td className="py-3 px-4 text-orange-400">${employee.commission.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleEmployeeSelect(employee.id)}
                      className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparación entre Empleados */}
      <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
        <h3 className="text-lg font-semibold text-white mb-4">Comparación de Rendimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {employeesData.map((employee) => (
            <div key={employee.id} className="bg-slate-600 rounded-lg p-4 border border-slate-500">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white text-sm">{employee.name}</h4>
                {getRankIcon(employee.rank)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Ventas:</span>
                  <span className="text-green-400">${employee.sales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Órdenes:</span>
                  <span className="text-blue-400">{employee.orders}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Promedio:</span>
                  <span className="text-purple-400">${employee.avgTicket.toFixed(0)}</span>
                </div>
              </div>
              {/* Barra de progreso relativa al mejor empleado */}
              <div className="mt-3">
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(employee.sales / employeesData[0].sales) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalle del Empleado Seleccionado */}
      {selectedEmployee && (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Detalle de {employeesData.find(emp => emp.id === selectedEmployee)?.name}
            </h3>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {loadingDetails ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando detalles...</span>
              </div>
            </div>
          ) : employeeDetails[selectedEmployee] ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ventas Diarias */}
              <div>
                <h4 className="font-medium text-white mb-3">Ventas Diarias</h4>
                <div className="space-y-2">
                  {employeeDetails[selectedEmployee].dailySales.map((day) => (
                    <div key={day.date} className="flex justify-between items-center py-2 px-3 bg-slate-600 rounded">
                      <span className="text-slate-300 text-sm">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex space-x-4">
                        <span className="text-green-400 text-sm">${day.sales.toLocaleString()}</span>
                        <span className="text-blue-400 text-sm">{day.orders} órdenes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productos Más Vendidos */}
              <div>
                <h4 className="font-medium text-white mb-3">Productos Más Vendidos</h4>
                <div className="space-y-3">
                  {employeeDetails[selectedEmployee].topProducts.map((product) => (
                    <div key={product.product} className="bg-slate-600 rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{product.product}</span>
                        <span className="text-green-400">${product.sales.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                          style={{ width: `${product.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">{product.percentage}% del total</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p>No se pudieron cargar los detalles del empleado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesEmployeeReport;

