import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import FuelButton from '../components/FuelButton';
import TransactionTable from '../components/TransactionTable';
import InventoryIndicator from '../components/InventoryIndicator';
import QuickSearch from '../components/QuickSearch';
import { DollarSign, Users, TrendingUp, Clock, Package } from 'lucide-react';
import apiService from '../services/apiService';

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setDashboardStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Layout currentPage="dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </Layout>
    );
  }

  if (!dashboardStats) {
    return (
      <Layout currentPage="dashboard">
        <div className="flex items-center justify-center h-full">
          <p className="text-white">No se pudieron cargar los datos del dashboard.</p>
        </div>
      </Layout>
    );
  }

  const transactions = [
    { date: '11/6 PIA', pump: 'Bomba 6', fuel: 'Regular', amount: '$55.00' },
    { date: '1/33 PIA', pump: 'Bomba 1', fuel: 'Blenal', amount: '$133.86' },
    { date: '12/34 PV', pump: 'Bomba 3', fuel: 'Premium', amount: '$23.10' },
  ];

  const readings = [
    { type: 'Lecturas', value: '1', social: '1,435', prenglam: '$2,040', pegolaa: '$2.4/0' },
    { type: 'S', value: '5', social: '1,370', prenglam: '12,418', pegolaa: '72,678' },
  ];

  return (
    <Layout currentPage="dashboard">
      <div className="space-y-6">
        {/* Header with user info */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Gas Station</h1>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Vendedor</span>
            <span className="text-slate-400">/14.FE.LT 23:21 4/78</span>
          </div>
        </div>

        {/* Fuel Selection Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FuelButton type="Diesel" />
          <FuelButton type="Premium" selected />
          <FuelButton type="Regular" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Ventas Hoy"
            value={`$${dashboardStats.ventasHoy}`}
            subtitle="Total de ventas del día"
            icon={DollarSign}
            valueColor="text-green-400"
          />
          <StatCard
            title="Clientes Atendidos"
            value={dashboardStats.clientesAtendidos}
            subtitle="Número de clientes atendidos hoy"
            icon={Users}
            valueColor="text-blue-400"
          />
          <StatCard
            title="Inventario Total"
            value={dashboardStats.inventarioTotal}
            subtitle="Unidades en inventario"
            icon={Package}
            valueColor="text-purple-400"
          />
          <StatCard
            title="Empleados Activos"
            value={dashboardStats.empleadosActivos}
            subtitle="Empleados trabajando actualmente"
            icon={Users}
            valueColor="text-orange-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <TransactionTable
              title="Historial de Transacciones"
              transactions={transactions}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Inventory Status */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Bistada de Bemibra</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-400">● Benina 1</span>
                  <span className="text-green-400">$30420</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400">● Benina 2</span>
                  <span className="text-green-400">$1842</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400">● Benina 6</span>
                  <span className="text-green-400">$1276</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-400">● Benina 4</span>
                  <span className="text-green-400">$12301</span>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <QuickSearch placeholder="Emmina la tra" />

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Regimno
              </button>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                volumida
              </button>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                $390%
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Readings Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Lecturas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">Lecturas</th>
                    <th className="text-left py-2 text-slate-400">Social</th>
                    <th className="text-left py-2 text-slate-400">Prenglam</th>
                    <th className="text-left py-2 text-slate-400">Pegolaa</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-2 text-slate-300">{reading.value}</td>
                      <td className="py-2 text-slate-300">{reading.social}</td>
                      <td className="py-2 text-slate-300">{reading.prenglam}</td>
                      <td className="py-2 text-slate-300">{reading.pegolaa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Estado</h3>
            <div className="space-y-3">
              <div className="text-slate-300">
                <span className="text-slate-400">Pregione U'Lnio:</span> Abierta
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Lebinni:</span> $1,562.25
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

