'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Clock, Search, Users, CreditCard, DollarSign, UserCheck } from 'lucide-react';
import { createPayment, type CreatePaymentPayload } from '../../src/services/paymentsService';
import creditService, { Credit, CreditsDashboard } from '../../src/services/creditService';
import paymentMethodService from '../../src/services/paymentMethodService';
import { getUserId } from '../../src/utils/auth';
import type { paymentMethod } from '../../app/grifo-configuracion/types/payment-methods';

const GrifoCreditManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [credits, setCredits] = useState<Credit[]>([]);
  const [dashboard, setDashboard] = useState<CreditsDashboard>({
    total: 0,
    overdue: 0,
    paid: 0
  });
  const [overdueCredits, setOverdueCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para el formulario de pago rápido
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // NUEVO: ids seleccionados automáticamente
  const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // NUEVO: métodos de pago
  const [paymentMethods, setPaymentMethods] = useState<paymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);

  // Estados calculados
  const [totalDebt, setTotalDebt] = useState(0);
  const [clientsWithDebt, setClientsWithDebt] = useState(0);

  // Cargar datos del dashboard
  const loadDashboard = async () => {
    try {
      const dashboardData = await creditService.getCreditsDashboard();
      setDashboard(dashboardData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  // Cargar todos los créditos
  const loadCredits = async () => {
    try {
      const creditsData = await creditService.getAllCredits();
      setCredits(creditsData);
      
      // Calcular estadísticas adicionales
      const debt = creditsData
        .filter((credit: Credit) => credit.status === 'pending' || credit.status === 'overdue')
        .reduce((sum: number, credit: Credit) => sum + (credit.credit_amount - credit.amount_paid), 0);
      
      const uniqueClients = new Set(
        creditsData
          .filter((credit: Credit) => credit.status === 'pending' || credit.status === 'overdue')
          .map((credit: Credit) => credit.client_id)
      ).size;

      setTotalDebt(debt);
      setClientsWithDebt(uniqueClients);
    } catch (err) {
      console.error('Error loading credits:', err);
      setError('Error al cargar los créditos');
    }
  };

  // Cargar créditos vencidos
  const loadOverdueCredits = async () => {
    try {
      const overdueData = await creditService.getOverdueCredits();
      setOverdueCredits(overdueData);
    } catch (err) {
      console.error('Error loading overdue credits:', err);
    }
  };

  // NUEVO: Cargar métodos de pago
  useEffect(() => {
    (async () => {
      try {
        const methods = await paymentMethodService.getAll();
        setPaymentMethods(methods);
        // Preseleccionar el primero activo si existe
        const first = methods.find(m => m.is_active) ?? methods[0];
        setSelectedPaymentMethodId(first ? first.payment_method_id : null);
      } catch (e) {
        console.error('Error fetching payment methods', e);
      }
    })();
  }, []);

  // NUEVO: Cuando el usuario elige cliente, autopoblar crédito/venta
  useEffect(() => {
    if (!selectedClientId) {
      setSelectedCreditId(null);
      setSelectedSaleId(null);
      return;
    }
    const pending = credits
      .filter(c => c.client_id === Number(selectedClientId))
      .filter(c => c.status === 'pending' || c.status === 'overdue');

    if (pending.length > 0) {
      setSelectedCreditId(pending[0].credit_id);
      setSelectedSaleId(pending[0].sale_id ?? null);
    } else {
      setSelectedCreditId(null);
      setSelectedSaleId(null);
    }
  }, [selectedClientId, credits]);

  // Registrar pago (CORREGIDO)
  const registerPayment = async () => {
    if (!selectedClientId || !paymentAmount) {
      alert('Por favor completa cliente y monto.');
      return;
    }
    if (!selectedCreditId) {
      alert('El cliente no tiene créditos pendientes/atrasados o no se seleccionó uno.');
      return;
    }
    if (!selectedPaymentMethodId) {
      alert('Selecciona un método de pago.');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      alert('No se pudo obtener el usuario del token. Vuelve a iniciar sesión.');
      return;
    }

    setProcessingPayment(true);
    try {
      const payload: CreatePaymentPayload = {
        credit_id: selectedCreditId,
        payment_method_id: selectedPaymentMethodId,
        amount: parseFloat(paymentAmount),
        user_id: Number(userId),
        notes: paymentReference || undefined,
      };

      await createPayment(payload); // POST /payments

      // limpiar
      setSelectedClientId('');
      setSelectedCreditId(null);
      setSelectedSaleId(null);
      setPaymentAmount('');
      setPaymentReference('');

      // refrescar
      await Promise.all([loadCredits(), loadDashboard()]);
      alert('Pago registrado exitosamente');
    } catch (err) {
      console.error('Error registering payment:', err);
      alert('Error al registrar el pago');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDashboard(),
          loadCredits(),
          loadOverdueCredits()
        ]);
      } catch (err) {
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400 border-green-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400 border-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'overdue':
        return 'Vencido';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  // Tarjetas resumen con datos reales
  const summaryCards = [
    {
      title: 'Total Deuda Pendiente',
      value: formatCurrency(totalDebt),
      icon: CreditCard,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Clientes con Deuda',
      value: clientsWithDebt.toString(),
      icon: Users,
      color: 'from-blue-700 to-blue-800'
    },
    {
      title: 'Créditos Vencidos',
      value: dashboard.overdue.toString(),
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  // Alertas dinámicas
  const alerts = [
    {
      type: 'Créditos Vencidos',
      message: `${dashboard.overdue} créditos han vencido y requieren atención inmediata.`,
      icon: AlertTriangle,
      color: 'text-red-400'
    },
    {
      type: 'Créditos por Vencer',
      message: `${overdueCredits.length} créditos están próximos a vencer.`,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      type: 'Total Pendiente',
      message: `${formatCurrency(totalDebt)} en deuda total pendiente.`,
      icon: DollarSign,
      color: 'text-blue-400'
    }
  ];

  // Filtrar créditos por búsqueda
  const filteredCredits = credits.filter(credit =>
    credit.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    credit.credit_id.toString().includes(searchTerm)
  );

  // Obtener clientes únicos con deuda para el selector
  const clientsWithDebtList = credits
    .filter(credit => credit.status === 'pending' || credit.status === 'overdue')
    .reduce((acc: any[], credit) => {
      if (!acc.find(c => c.client_id === credit.client_id)) {
        acc.push({
          client_id: credit.client_id,
          name: credit.client?.name || `Cliente ${credit.client_id}`,
          debt: credit.credit_amount - credit.amount_paid
        });
      }
      return acc;
    }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-white">Cargando datos de créditos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
            <CreditCard className="text-green-500" size={28} />
            Créditos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestión y monitoreo de créditos a clientes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          <span className="text-slate-300">Sucursal Lima</span>
          <span className="text-slate-300">
            Última actualización: {new Date().toLocaleDateString('es-PE')}
          </span>
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 flex items-center gap-4 border border-slate-700 bg-slate-800 shadow`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr ${card.color}`}>
              <card.icon className="text-white" size={28} />
            </div>
            <div>
              <div className="text-slate-400 text-xs font-medium">{card.title}</div>
              <div className="text-xl font-bold text-white">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar cliente o ID de crédito"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
            />
          </div>
          <button 
            onClick={() => {
              loadCredits();
              loadDashboard();
              loadOverdueCredits();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Alertas horizontales */}
      <div className="flex flex-col md:flex-row gap-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2"
          >
            <alert.icon size={20} className={alert.color} />
            <div>
              <span className={`font-semibold ${alert.color}`}>{alert.type}:</span>
              <span className="text-slate-400 ml-1">{alert.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido principal: tabla y sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabla de créditos */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Monto Crédito</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Pagado</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Saldo</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Vencimiento</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCredits.map((credit) => {
                    const balance = credit.credit_amount - credit.amount_paid;
                    return (
                      <tr key={credit.credit_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 text-white">
                          {credit.client?.name || `Cliente ${credit.client_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatCurrency(credit.credit_amount)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatCurrency(credit.amount_paid)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatCurrency(balance)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatDate(credit.due_date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${getStatusColor(credit.status)}`}>
                            {getStatusText(credit.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información de paginación */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-slate-400 text-sm">
              Mostrando {filteredCredits.length} de {credits.length} créditos
            </div>
          </div>
        </div>

        {/* Sidebar: Pago rápido + Información */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 space-y-6">
            {/* Pago rápido */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-green-400" size={20} />
                Registrar Pago Rápido
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientsWithDebtList.map(client => (
                    <option key={client.client_id} value={client.client_id}>
                      {client.name} - {formatCurrency(client.debt)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Monto (S/)"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
                <input
                  type="text"
                  placeholder="Referencia (opcional)"
                  value={paymentReference}
                  onChange={e => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />

                {/* NUEVO: Mostrar información del crédito seleccionado */}
                {selectedCreditId && (
                  <div className="bg-slate-700 rounded-lg p-3 text-sm">
                    <div className="text-slate-300">
                      <strong>Crédito seleccionado:</strong> #{selectedCreditId}
                    </div>
                    {selectedSaleId && (
                      <div className="text-slate-300">
                        <strong>Venta asociada:</strong> #{selectedSaleId}
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={registerPayment}
                  disabled={processingPayment}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {processingPayment ? 'Procesando...' : 'Registrar Pago'}
                </button>
              </div>
            </div>

            {/* Información */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="text-blue-400" size={20} />
                Información
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Créditos:</span>
                  <span className="text-white font-medium">{dashboard.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pagados:</span>
                  <span className="text-green-400 font-medium">{dashboard.paid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vencidos:</span>
                  <span className="text-red-400 font-medium">{dashboard.overdue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deuda Total:</span>
                  <span className="text-white font-medium">{formatCurrency(totalDebt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrifoCreditManagement;

