import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Clock, Download, Eye, DollarSign, Loader2 } from 'lucide-react';
import apiService from '../../services/apiService';

interface CreditsReportProps {
  filters: any;
}

interface OutstandingCredit {
  credit_id: number;
  client_id: number;
  client_name: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  days_overdue: number;
  is_overdue: boolean;
}

interface Collection {
  credit_id: number;
  client_id: number;
  client_name: string;
  amount_paid: number;
  payment_date: string;
}

interface OutstandingApiResponse {
  totalOutstanding: number;
  partialPayments: number;
  agingData: {
    "0-30": number;
    "31-60": number;
    "61-90": number;
    "90+": number;
  };
  creditsDetails: OutstandingCredit[];
  delinquentClients: OutstandingCredit[];
  creditsCount: number;
}

interface CollectionsApiResponse {
  totalCollections: number;
  collectionEfficiency: number;
  collectionTrends: { [key: string]: number };
  collectionsDetails: Collection[];
  collectionsCount: number;
}

const CreditsReport: React.FC<CreditsReportProps> = ({ filters }) => {
  const [activeTab, setActiveTab] = useState<'outstanding' | 'collections'>('outstanding');
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);
  
  // Estados para créditos pendientes
  const [outstandingCredits, setOutstandingCredits] = useState<OutstandingCredit[]>([]);
  const [outstandingSummary, setOutstandingSummary] = useState<{
    totalOutstanding: number;
    partialPayments: number;
    agingData: any;
    creditsCount: number;
  }>({
    totalOutstanding: 0,
    partialPayments: 0,
    agingData: {},
    creditsCount: 0
  });

  // Estados para cobros
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsSummary, setCollectionsSummary] = useState<{
    totalCollections: number;
    collectionEfficiency: number;
    collectionsCount: number;
  }>({
    totalCollections: 0,
    collectionEfficiency: 0,
    collectionsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para construir querystring con los filtros
  const buildQueryString = (filters: any, additionalParams: any = {}): string => {
    const params = new URLSearchParams();
    
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.status) params.append('status', filters.status);
    if (filters.dueDateStart) params.append('dueDateStart', filters.dueDateStart);
    if (filters.dueDateEnd) params.append('dueDateEnd', filters.dueDateEnd);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    
    // Agregar parámetros adicionales
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value as string);
    });
    
    return params.toString();
  };

  // Función para cargar datos de créditos pendientes
  const loadOutstandingCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/credits/outstanding${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<OutstandingApiResponse>(endpoint);
      
      setOutstandingCredits(response.creditsDetails);
      setOutstandingSummary({
        totalOutstanding: response.totalOutstanding,
        partialPayments: response.partialPayments,
        agingData: response.agingData,
        creditsCount: response.creditsCount
      });

    } catch (err) {
      console.error('Error loading outstanding credits:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar los créditos pendientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos de cobros
  const loadCollections = async () => {
    try {
      setLoadingCollections(true);
      
      const queryString = buildQueryString(filters);
      const endpoint = `/reports/credits/collections${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.get<CollectionsApiResponse>(endpoint);
      
      setCollections(response.collectionsDetails);
      setCollectionsSummary({
        totalCollections: response.totalCollections,
        collectionEfficiency: response.collectionEfficiency,
        collectionsCount: response.collectionsCount
      });

    } catch (err) {
      console.error('Error loading collections:', err);
      // En caso de error, mantener datos vacíos
      setCollections([]);
      setCollectionsSummary({
        totalCollections: 0,
        collectionEfficiency: 0,
        collectionsCount: 0
      });
    } finally {
      setLoadingCollections(false);
    }
  };

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    loadOutstandingCredits();
  }, [filters]);

  // Cargar cobros cuando se seleccione la pestaña de cobros
  useEffect(() => {
    if (activeTab === 'collections') {
      loadCollections();
    }
  }, [activeTab, filters]);

  const getStatusColor = (isOverdue: boolean, daysOverdue: number) => {
    if (!isOverdue) return 'text-green-400 bg-green-500/20';
    if (daysOverdue > 30) return 'text-red-400 bg-red-500/20';
    return 'text-yellow-400 bg-yellow-500/20';
  };

  const getStatusIcon = (isOverdue: boolean, daysOverdue: number) => {
    if (!isOverdue) return <CheckCircle className="h-4 w-4" />;
    if (daysOverdue > 30) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusText = (isOverdue: boolean, daysOverdue: number) => {
    if (!isOverdue) return 'Al día';
    if (daysOverdue > 30) return 'Crítico';
    return 'Vencido';
  };

  // Calcular estadísticas de créditos
  const creditStats = {
    totalOutstanding: outstandingSummary.totalOutstanding,
    totalCollected: collectionsSummary.totalCollections,
    recoveryRate: collectionsSummary.collectionEfficiency,
    averageDaysLate: outstandingCredits.length > 0 ? 
      outstandingCredits.reduce((sum, credit) => sum + credit.days_overdue, 0) / outstandingCredits.length : 0
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando datos de créditos...</span>
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
              onClick={loadOutstandingCredits}
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
      {/* KPIs de Créditos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Créditos Pendientes</p>
              <p className="text-2xl font-bold text-red-400">${creditStats.totalOutstanding.toLocaleString()}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">{outstandingSummary.creditsCount} cuentas por cobrar</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Cobros Realizados</p>
              <p className="text-2xl font-bold text-green-400">${creditStats.totalCollected.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">{collectionsSummary.collectionsCount} pagos recibidos</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">% Recuperación</p>
              <p className="text-2xl font-bold text-purple-400">{creditStats.recoveryRate.toFixed(1)}%</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Tasa de recuperación</p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Días Promedio</p>
              <p className="text-2xl font-bold text-orange-400">{creditStats.averageDaysLate.toFixed(1)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Días de retraso promedio</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'outstanding'
              ? 'bg-orange-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          Créditos Pendientes
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'collections'
              ? 'bg-orange-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-600'
          }`}
        >
          Cobros Realizados
        </button>
      </div>

      {activeTab === 'outstanding' && (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Créditos Pendientes</h3>
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

          {outstandingCredits.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No hay créditos pendientes para el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Monto Pendiente</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Monto Pagado</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Fecha Vencimiento</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Días Vencido</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {outstandingCredits.map((credit) => (
                    <tr key={credit.credit_id} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                      <td className="py-3 px-4 text-white font-medium">{credit.client_name}</td>
                      <td className="py-3 px-4 text-red-400 font-medium">${credit.amount_due.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-400 font-medium">${credit.amount_paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-300">{new Date(credit.due_date).toLocaleDateString()}</td>
                      <td className={`py-3 px-4 font-medium ${credit.days_overdue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {credit.days_overdue > 0 ? `+${credit.days_overdue}` : credit.days_overdue}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(credit.is_overdue, credit.days_overdue)}`}>
                          {getStatusIcon(credit.is_overdue, credit.days_overdue)}
                          <span className="ml-1">{getStatusText(credit.is_overdue, credit.days_overdue)}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedCredit(credit.credit_id.toString())}
                            className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </button>
                          <button className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors">
                            Cobrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Cobros Realizados</h3>
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

          {loadingCollections ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando cobros...</span>
              </div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p>No hay cobros registrados para el período seleccionado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Monto</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Fecha Cobro</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">ID Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((collection) => (
                    <tr key={`${collection.credit_id}-${collection.payment_date}`} className="border-b border-slate-700/50 hover:bg-slate-600/30">
                      <td className="py-3 px-4 text-white font-medium">{collection.client_name}</td>
                      <td className="py-3 px-4 text-green-400 font-medium">${collection.amount_paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-300">{new Date(collection.payment_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-300">#{collection.credit_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalle de Crédito */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Detalle del Crédito</h3>
              <button
                onClick={() => setSelectedCredit(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const credit = outstandingCredits.find(c => c.credit_id.toString() === selectedCredit);
              if (!credit) return null;
              
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400">Cliente</label>
                    <p className="text-white font-medium">{credit.client_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400">Monto Pendiente</label>
                    <p className="text-2xl font-bold text-red-400">${credit.amount_due.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400">Monto Pagado</label>
                    <p className="text-green-400 font-medium">${credit.amount_paid.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400">Fecha de Vencimiento</label>
                    <p className="text-white">{new Date(credit.due_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400">Estado</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(credit.is_overdue, credit.days_overdue)}`}>
                      {getStatusIcon(credit.is_overdue, credit.days_overdue)}
                      <span className="ml-1">{getStatusText(credit.is_overdue, credit.days_overdue)}</span>
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Registrar Pago
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Contactar Cliente
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditsReport;

