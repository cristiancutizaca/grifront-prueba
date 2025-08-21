import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Download, Fuel, Loader2, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';

interface InventoryReportProps {
  filters: any;
}

interface TankData {
  tankId: number;
  tankName: string;
  productId: number;
  productName: string;
  currentStock: number;
  capacity: number;
  fillPercentage: number;
  isLowStock: boolean;
}

interface MovementData {
  movement_type: string;
  product_id: number;
  product_name: string;
  tank_id: number;
  tank_name: string;
  quantity: number;
  first_at: string;
  last_at: string;
}

interface StockApiResponse {
  tanks: TankData[];
}

interface MovementsApiResponse {
  totalIn: number;
  totalOut: number;
  netAdjustments: number;
  movementDetails: MovementData[];
  movementsCount: number;
}

const InventoryReport: React.FC<InventoryReportProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'variations'>('stock');
  const [tanksData, setTanksData] = useState<TankData[]>([]);
  const [movementsData, setMovementsData] = useState<MovementData[]>([]);
  const [movementsSummary, setMovementsSummary] = useState<{totalIn: number, totalOut: number, netAdjustments: number}>({
    totalIn: 0,
    totalOut: 0,
    netAdjustments: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para construir querystring con los filtros
  const buildQueryString = (filters: any, additionalParams: any = {}): string => {
    const params = new URLSearchParams();
    
    if (filters.productId) params.append('productId', filters.productId);
    if (filters.tankId) params.append('tankId', filters.tankId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.movementType) params.append('movementType', filters.movementType);
    
    // Agregar parámetros adicionales
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    
    return params.toString();
  };

  // Función para cargar datos de stock actual
  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/inventory/current-stock${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<TankData[]>(endpoint);
      
      // La API devuelve directamente un array de tanques
      setTanksData(response);

    } catch (err) {
      console.error('Error loading stock data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los datos de stock');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos de movimientos
  const loadMovementsData = async () => {
    try {
      setLoadingMovements(true);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/inventory/movements${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<MovementsApiResponse>(endpoint);
      
      setMovementsData(response.movementDetails);
      setMovementsSummary({
        totalIn: response.totalIn,
        totalOut: response.totalOut,
        netAdjustments: response.netAdjustments
      });

    } catch (err) {
      console.error('Error loading movements data:', err);
      // En caso de error, mantener datos vacíos
      setMovementsData([]);
      setMovementsSummary({ totalIn: 0, totalOut: 0, netAdjustments: 0 });
    } finally {
      setLoadingMovements(false);
    }
  };

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadStockData();
  }, [filters]);

  // Cargar movimientos cuando se seleccione la pestaña de movimientos
  useEffect(() => {
    if (activeTab === 'movements') {
      loadMovementsData();
    }
  }, [activeTab, filters]);

  const getStockStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage < 15) return { status: 'critical', color: 'text-red-400', bgColor: 'bg-red-500' };
    if (percentage < 30) return { status: 'low', color: 'text-yellow-400', bgColor: 'bg-yellow-500' };
    return { status: 'normal', color: 'text-green-400', bgColor: 'bg-green-500' };
  };

  const getMovementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'out': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'in': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'adjust': return <Package className="h-4 w-4 text-yellow-400" />;
      default: return <Package className="h-4 w-4 text-slate-400" />;
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'out': return 'Salida';
      case 'in': return 'Entrada';
      case 'adjust': return 'Ajuste';
      default: return type;
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de inventario...</span>
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
              onClick={loadStockData}
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
      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stock'
              ? 'bg-orange-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          Stock Actual
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'movements'
              ? 'bg-orange-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          Movimientos
        </button>
        <button
          onClick={() => setActiveTab('variations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'variations'
              ? 'bg-orange-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          Variación de Tanques
        </button>
      </div>

      {activeTab === 'stock' && (
        <>
          {/* Alertas de Stock */}
          {tanksData.filter(tank => tank.isLowStock).length > 0 && (
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                Alertas de Inventario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tanksData.filter(tank => tank.isLowStock).map((tank) => {
                  const stockInfo = getStockStatus(tank.currentStock, tank.capacity);
                  return (
                    <div key={tank.tankId} className={`p-4 rounded-lg border-l-4 ${
                      tank.fillPercentage < 15 ? 'border-red-500 bg-red-500/10' : 'border-yellow-500 bg-yellow-500/10'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{tank.tankName}</h4>
                        <Fuel className={`h-5 w-5 ${stockInfo.color}`} />
                      </div>
                      <p className="text-sm text-slate-300">{tank.productName}</p>
                      <p className={`text-lg font-bold ${stockInfo.color}`}>
                        {tank.fillPercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400">
                        {tank.currentStock.toLocaleString()} / {tank.capacity.toLocaleString()} L
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado de Tanques */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Estado de Tanques</h3>
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

            {tanksData.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>No hay datos de tanques disponibles</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Tanque</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Producto</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Stock Actual</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Capacidad</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">% Capacidad</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tanksData.map((tank) => {
                      const stockInfo = getStockStatus(tank.currentStock, tank.capacity);
                      
                      return (
                        <tr key={tank.tankId} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                          <td className="py-3 px-4 text-white font-medium">{tank.tankName}</td>
                          <td className="py-3 px-4 text-slate-300">{tank.productName}</td>
                          <td className="py-3 px-4 text-blue-400">{tank.currentStock.toLocaleString()} L</td>
                          <td className="py-3 px-4 text-slate-300">{tank.capacity.toLocaleString()} L</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-slate-800 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${stockInfo.bgColor}`}
                                  style={{ width: `${Math.min(tank.fillPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className={stockInfo.color}>{tank.fillPercentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tank.isLowStock ? 
                                (tank.fillPercentage < 15 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400') :
                                'bg-green-500/20 text-green-400'
                            }`}>
                              {tank.isLowStock ? 
                                (tank.fillPercentage < 15 ? 'Crítico' : 'Bajo') : 
                                'Normal'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'movements' && (
        <>
          {/* Resumen de Movimientos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Entradas</p>
                  <p className="text-2xl font-bold text-green-400">{movementsSummary.totalIn.toLocaleString()} L</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Salidas</p>
                  <p className="text-2xl font-bold text-red-400">{movementsSummary.totalOut.toLocaleString()} L</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Ajustes Netos</p>
                  <p className={`text-2xl font-bold ${movementsSummary.netAdjustments >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {movementsSummary.netAdjustments >= 0 ? '+' : ''}{movementsSummary.netAdjustments.toLocaleString()} L
                  </p>
                </div>
                <Package className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Movimientos de Inventario</h3>
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

            {loadingMovements ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Cargando movimientos...</span>
                </div>
              </div>
            ) : movementsData.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <p>No hay movimientos disponibles para el período seleccionado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Tipo</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Producto</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Tanque</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Cantidad</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Primera Fecha</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Última Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movementsData.map((movement, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getMovementIcon(movement.movement_type)}
                            <span className="ml-2 text-white">{getMovementTypeText(movement.movement_type)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{movement.product_name}</td>
                        <td className="py-3 px-4 text-slate-300">{movement.tank_name}</td>
                        <td className={`py-3 px-4 font-medium ${
                          movement.movement_type.toLowerCase() === 'out' ? 'text-red-400' : 
                          movement.movement_type.toLowerCase() === 'in' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {movement.movement_type.toLowerCase() === 'out' ? '-' : '+'}
                          {Math.abs(movement.quantity).toLocaleString()} L
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(movement.first_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {new Date(movement.last_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'variations' && (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Variación de Tanques</h3>
          <div className="text-center text-slate-400 py-8">
            <p>Funcionalidad de variación de tanques pendiente de implementar</p>
            <p className="text-sm mt-2">Se conectará al endpoint: GET /reports/inventory/tank-variations</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryReport;

