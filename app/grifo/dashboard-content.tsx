'use client'

import React, { useState, useEffect } from 'react';
import StatCard from '../../src/components/StatCard';
import FuelButton from '../../src/components/FuelButton';
import TransactionTable from '../../src/components/TransactionTable';
import QuickSearch from '../../src/components/QuickSearch';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  Fuel,
  AlertTriangle,
  BarChart3,
  Settings,
  Bell,
  Download,
  Filter,
  RefreshCw,
  Link,
  ChevronDown,
  ChevronUp,
  Gauge
} from 'lucide-react';

const GrifoDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDispenser, setSelectedDispenser] = useState('all');
  const [tanksPanelOpen, setTanksPanelOpen] = useState(false);
  const [showTankMeters, setShowTankMeters] = useState(false);

  // Simular actualización automática cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdate(new Date());
    }, 1500);
  };

  // Datos dinámicos según el período seleccionado
  const dashboardData = {
    today: {
      totalSales: 1850.75,
      totalCustomers: 156,
      totalGallons: 618,
      activeEmployees: 12,
      fuelData: [
        { type: 'Regular', gallons: 317, amount: 960.00, level: 85, color: 'bg-red-500' },
        { type: 'Premium', gallons: 180, amount: 544.00, level: 65, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 121, amount: 346.75, level: 45, color: 'bg-purple-700' }
      ],
      recentTransactions: [
        { id: '001', time: '09:45', date: '03/07/2025', pump: 'Surtidor 1', fuel: 'Regular', liters: 25, gallons: 6.6, amount: 20.00 },
        { id: '002', time: '09:42', date: '03/07/2025', pump: 'Surtidor 3', fuel: 'Premium', liters: 18, gallons: 4.8, amount: 14.40 },
        { id: '003', time: '09:38', date: '03/07/2025', pump: 'Surtidor 2', fuel: 'Diesel', liters: 30, gallons: 7.9, amount: 22.50 },
        { id: '004', time: '09:35', date: '03/07/2025', pump: 'Surtidor 1', fuel: 'Regular', liters: 22, gallons: 5.8, amount: 17.60 },
        { id: '005', time: '09:32', date: '03/07/2025', pump: 'Surtidor 3', fuel: 'Premium', liters: 15, gallons: 4.0, amount: 12.00 },
        { id: '006', time: '09:28', date: '03/07/2025', pump: 'Surtidor 2', fuel: 'Diesel', liters: 35, gallons: 9.2, amount: 26.25 },
        { id: '007', time: '09:25', date: '03/07/2025', pump: 'Surtidor 1', fuel: 'Regular', liters: 28, gallons: 7.4, amount: 22.40 },
        { id: '008', time: '09:20', date: '03/07/2025', pump: 'Surtidor 3', fuel: 'Premium', liters: 20, gallons: 5.3, amount: 16.00 }
      ],
      notifications: [
        { id: 1, type: 'warning', message: 'Nivel bajo en tanque de Diesel', time: '10:30', priority: 'alta' },
        { id: 2, type: 'info', message: 'Turno de mañana iniciado', time: '08:00', priority: 'baja' },
        { id: 3, type: 'success', message: 'Backup completado exitosamente', time: '07:00', priority: 'media' }
      ]
    },
    week: {
      totalSales: 12840.50,
      totalCustomers: 1089,
      totalGallons: 4331,
      activeEmployees: 18,
      fuelData: [
        { type: 'Regular', gallons: 2222, amount: 6720.00, level: 78, color: 'bg-red-500' },
        { type: 'Premium', gallons: 1259, amount: 3808.00, level: 82, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 851, amount: 2412.50, level: 55, color: 'bg-purple-700' }
      ],
      recentTransactions: [
        { id: '101', time: 'Lunes', date: '29/06/2025', pump: 'Surtidor 1', fuel: 'Todos', liters: 850, gallons: 224.6, amount: 680.00 },
        { id: '102', time: 'Martes', date: '30/06/2025', pump: 'Surtidor 2', fuel: 'Todos', liters: 760, gallons: 200.8, amount: 608.00 },
        { id: '103', time: 'Miércoles', date: '01/07/2025', pump: 'Surtidor 3', fuel: 'Todos', liters: 920, gallons: 243.1, amount: 736.00 },
        { id: '104', time: 'Jueves', date: '02/07/2025', pump: 'Surtidor 1', fuel: 'Todos', liters: 780, gallons: 206.1, amount: 624.00 },
        { id: '105', time: 'Viernes', date: '03/07/2025', pump: 'Surtidor 2', fuel: 'Todos', liters: 890, gallons: 235.2, amount: 712.00 },
        { id: '106', time: 'Sábado', date: '04/07/2025', pump: 'Surtidor 3', fuel: 'Todos', liters: 950, gallons: 251.0, amount: 760.00 }
      ],
      notifications: [
        { id: 1, type: 'info', message: 'Reporte semanal generado', time: 'Ayer', priority: 'media' },
        { id: 2, type: 'success', message: 'Meta de ventas alcanzada', time: 'Viernes', priority: 'alta' },
        { id: 3, type: 'warning', message: 'Mantenimiento programado', time: 'Jueves', priority: 'media' }
      ]
    },
    month: {
      totalSales: 45620.80,
      totalCustomers: 4234,
      totalGallons: 15460,
      activeEmployees: 24,
      fuelData: [
        { type: 'Regular', gallons: 7910, amount: 23920.00, level: 92, color: 'bg-red-500' },
        { type: 'Premium', gallons: 4492, amount: 13584.00, level: 88, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 3058, amount: 8677.50, level: 76, color: 'bg-purple-700' }
      ],
      recentTransactions: [
        { id: '201', time: 'Semana 1', date: '06-12/06/2025', pump: 'Surtidor 1', fuel: 'Todos', liters: 4860, gallons: 1284.2, amount: 3888.00 },
        { id: '202', time: 'Semana 2', date: '13-19/06/2025', pump: 'Surtidor 2', fuel: 'Todos', liters: 5080, gallons: 1342.4, amount: 4064.00 },
        { id: '203', time: 'Semana 3', date: '20-26/06/2025', pump: 'Surtidor 3', fuel: 'Todos', liters: 4950, gallons: 1308.0, amount: 3960.00 },
        { id: '204', time: 'Semana 4', date: '27/06-03/07/2025', pump: 'Surtidor 1', fuel: 'Todos', liters: 4580, gallons: 1210.2, amount: 3664.00 },
        { id: '205', time: 'Semana 5', date: '04-10/07/2025', pump: 'Surtidor 2', fuel: 'Todos', liters: 4890, gallons: 1292.1, amount: 3912.00 },
        { id: '206', time: 'Semana 6', date: '11-17/07/2025', pump: 'Surtidor 3', fuel: 'Todos', liters: 5120, gallons: 1352.9, amount: 4096.00 }
      ],
      notifications: [
        { id: 1, type: 'success', message: 'Récord mensual de ventas', time: 'Hace 2 días', priority: 'alta' },
        { id: 2, type: 'info', message: 'Inventario mensual completado', time: 'Hace 5 días', priority: 'media' },
        { id: 3, type: 'warning', message: 'Renovación de licencias', time: 'Hace 1 semana', priority: 'alta' }
      ]
    }
  };

  const currentData = dashboardData[selectedPeriod as keyof typeof dashboardData];

  // Datos por dispensador dinámicos según período
  const dispenserData = {
    today: {
      all: currentData.fuelData,
      dispenser1: [
        { type: 'Regular', gallons: 119, amount: 360.00, level: 85, color: 'bg-red-500' },
        { type: 'Premium', gallons: 74, amount: 224.00, level: 65, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 48, amount: 135.00, level: 45, color: 'bg-purple-700' }
      ],
      dispenser2: [
        { type: 'Regular', gallons: 100, amount: 304.00, level: 75, color: 'bg-red-500' },
        { type: 'Premium', gallons: 58, amount: 176.00, level: 55, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 42, amount: 120.00, level: 40, color: 'bg-purple-700' }
      ],
      dispenser3: [
        { type: 'Regular', gallons: 98, amount: 296.00, level: 70, color: 'bg-red-500' },
        { type: 'Premium', gallons: 48, amount: 144.00, level: 45, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 32, amount: 90.00, level: 30, color: 'bg-purple-700' }
      ]
    },
    week: {
      all: currentData.fuelData,
      dispenser1: [
        { type: 'Regular', gallons: 740, amount: 2240.00, level: 82, color: 'bg-red-500' },
        { type: 'Premium', gallons: 518, amount: 1568.00, level: 68, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 333, amount: 945.00, level: 52, color: 'bg-purple-700' }
      ],
      dispenser2: [
        { type: 'Regular', gallons: 703, amount: 2128.00, level: 78, color: 'bg-red-500' },
        { type: 'Premium', gallons: 407, amount: 1232.00, level: 58, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 296, amount: 840.00, level: 48, color: 'bg-purple-700' }
      ],
      dispenser3: [
        { type: 'Regular', gallons: 778, amount: 2352.00, level: 86, color: 'bg-red-500' },
        { type: 'Premium', gallons: 333, amount: 1008.00, level: 62, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 222, amount: 630.00, level: 44, color: 'bg-purple-700' }
      ]
    },
    month: {
      all: currentData.fuelData,
      dispenser1: [
        { type: 'Regular', gallons: 2637, amount: 7976.00, level: 88, color: 'bg-red-500' },
        { type: 'Premium', gallons: 1497, amount: 4528.00, level: 85, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 1020, amount: 2892.75, level: 72, color: 'bg-purple-700' }
      ],
      dispenser2: [
        { type: 'Regular', gallons: 2635, amount: 7972.00, level: 92, color: 'bg-red-500' },
        { type: 'Premium', gallons: 1497, amount: 4528.00, level: 88, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 1019, amount: 2892.00, level: 76, color: 'bg-purple-700' }
      ],
      dispenser3: [
        { type: 'Regular', gallons: 2635, amount: 7972.00, level: 95, color: 'bg-red-500' },
        { type: 'Premium', gallons: 1497, amount: 4528.00, level: 90, color: 'bg-green-700' },
        { type: 'Diesel', gallons: 1020, amount: 2892.75, level: 78, color: 'bg-purple-700' }
      ]
    }
  };

  const currentDispenserData = dispenserData[selectedPeriod as 'today' | 'week' | 'month'][selectedDispenser as 'all' | 'dispenser1' | 'dispenser2' | 'dispenser3'];
  
  // Datos de medidores por dispensador dinámicos según período
  const dispenserMeters = {
    today: {
      dispenser1: {
        totalGallons: 240,
        totalAmount: 719.00,
        readings: {
          regular: { current: 3326.9, previous: 3267.4, gallons: 59.5 },
          premium: { current: 2365.1, previous: 2317.5, gallons: 47.6 },
          diesel: { current: 1780.5, previous: 1732.9, gallons: 47.6 }
        }
      },
      dispenser2: {
        totalGallons: 201,
        totalAmount: 600.00,
        readings: {
          regular: { current: 2610.8, previous: 2563.2, gallons: 47.6 },
          premium: { current: 1993.9, previous: 1935.7, gallons: 58.2 },
          diesel: { current: 1433.4, previous: 1391.1, gallons: 42.3 }
        }
      },
      dispenser3: {
        totalGallons: 177,
        totalAmount: 531.00,
        readings: {
          regular: { current: 2969.8, previous: 2871.7, gallons: 98.1 },
          premium: { current: 1794.6, previous: 1747.0, gallons: 47.6 },
          diesel: { current: 1207.3, previous: 1175.6, gallons: 31.7 }
        }
      }
    },
    week: {
      dispenser1: {
        totalGallons: 1591,
        totalAmount: 4753.00,
        readings: {
          regular: { current: 3326.9, previous: 2586.5, gallons: 740.4 },
          premium: { current: 2365.1, previous: 1847.3, gallons: 517.8 },
          diesel: { current: 1780.5, previous: 1447.4, gallons: 333.1 }
        }
      },
      dispenser2: {
        totalGallons: 1406,
        totalAmount: 4200.00,
        readings: {
          regular: { current: 2610.8, previous: 1907.4, gallons: 703.4 },
          premium: { current: 1993.9, previous: 1586.8, gallons: 407.1 },
          diesel: { current: 1433.4, previous: 1137.5, gallons: 295.9 }
        }
      },
      dispenser3: {
        totalGallons: 1333,
        totalAmount: 3990.00,
        readings: {
          regular: { current: 2969.8, previous: 2192.5, gallons: 777.3 },
          premium: { current: 1794.6, previous: 1461.5, gallons: 333.1 },
          diesel: { current: 1207.3, previous: 985.4, gallons: 221.9 }
        }
      }
    },
    month: {
      dispenser1: {
        totalGallons: 5154,
        totalAmount: 15396.75,
        readings: {
          regular: { current: 3326.9, previous: 690.0, gallons: 2636.9 },
          premium: { current: 2365.1, previous: 868.3, gallons: 1496.8 },
          diesel: { current: 1780.5, previous: 760.2, gallons: 1020.3 }
        }
      },
      dispenser2: {
        totalGallons: 5151,
        totalAmount: 15392.00,
        readings: {
          regular: { current: 2610.8, previous: -23.7, gallons: 2634.5 },
          premium: { current: 1993.9, previous: 497.8, gallons: 1496.1 },
          diesel: { current: 1433.4, previous: 414.1, gallons: 1019.3 }
        }
      },
      dispenser3: {
        totalGallons: 5152,
        totalAmount: 15392.75,
        readings: {
          regular: { current: 2969.8, previous: 335.8, gallons: 2634.0 },
          premium: { current: 1794.6, previous: 298.6, gallons: 1496.0 },
          diesel: { current: 1207.3, previous: 187.8, gallons: 1019.5 }
        }
      }
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-2xl hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
            <TrendingUp size={16} className={trend < 0 ? 'rotate-180' : ''} />
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm opacity-90 font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs opacity-75">{subtitle}</p>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-8 bg-slate-600 rounded w-1/2"></div>
    </div>
  );

  // Carrusel de transacciones mejorado
  const totalPages = Math.ceil(currentData.recentTransactions.length / 3);
  const currentPage = Math.floor(currentIndex / 3) + 1;
  
  const nextTransactions = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 3;
      return nextIndex >= currentData.recentTransactions.length ? 0 : nextIndex;
    });
  };

  const prevTransactions = () => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 3;
      return prevIndex < 0 ? Math.max(0, currentData.recentTransactions.length - 3) : prevIndex;
    });
  };

  const visibleTransactions = currentData.recentTransactions.slice(currentIndex, currentIndex + 3);

  // Datos de tanques y conexiones
  const tankData = [
    {
      id: 'tank1',
      name: 'Tanque Regular',
      type: 'Regular',
      capacity: 10000,
      current: 8500,
      level: 85,
      color: 'bg-red-500',
      connectedDispensers: [1, 2, 3],
      status: 'normal'
    },
    {
      id: 'tank2',
      name: 'Tanque Premium',
      type: 'Premium',
      capacity: 8000,
      current: 5200,
      level: 65,
      color: 'bg-green-700',
      connectedDispensers: [1, 2],
      status: 'normal'
    },
    {
      id: 'tank3',
      name: 'Tanque Diesel',
      type: 'Diesel',
      capacity: 6000,
      current: 2700,
      level: 45,
      color: 'bg-purple-700',
      connectedDispensers: [2, 3],
      status: 'warning'
    },
    {
      id: 'tank4',
      name: 'Tanque Diesel 2',
      type: 'Diesel 2',
      capacity: 7000,
      current: 4200,
      level: 60,
      color: 'bg-purple-800',
      connectedDispensers: [1, 3],
      status: 'normal'
    }
  ];

  const TankCard = ({ tank }: { tank: any }) => (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${tank.color} rounded-lg flex items-center justify-center`}>
            <Fuel size={20} className="text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">{tank.name}</h4>
            <p className="text-sm text-slate-400">{tank.type}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          tank.status === 'warning' 
            ? 'bg-yellow-500/20 text-yellow-400' 
            : 'bg-green-500/20 text-green-400'
        }`}>
          {tank.status === 'warning' ? 'Bajo' : 'Normal'}
        </div>
      </div>

      {/* Nivel del tanque */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-300">Nivel</span>
          <span className="text-sm text-white font-semibold">{tank.level}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${tank.color} transition-all duration-500`}
            style={{ width: `${tank.level}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
          <span>{tank.current.toLocaleString()}L</span>
          <span>{tank.capacity.toLocaleString()}L</span>
        </div>
      </div>

      {/* Conexiones a dispensadores */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link size={12} className="text-slate-400" />
          <span className="text-xs text-slate-300">Conectado a:</span>
        </div>
        <div className="flex gap-2">
          {tank.connectedDispensers.map((dispenser: number) => (
            <div
              key={dispenser}
              className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium"
            >
              Disp. {dispenser}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente medidor digital
  const DigitalMeter = ({ label, current, previous, gallons, color }: any) => (
    <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <div className={`w-2 h-2 ${color} rounded-full`}></div>
      </div>
      
      {/* Display LCD style */}
      <div className="bg-black rounded p-2 mb-2 font-mono">
        <div className="text-green-400 text-lg font-bold">
          {current.toFixed(1)} gal
        </div>
        <div className="text-green-300 text-xs">
          Ant: {previous.toFixed(1)} gal
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-white font-semibold text-sm">{gallons} gal</div>
        <div className="text-slate-400 text-xs">Vendidos hoy</div>
      </div>
    </div>
  );

  // Componente medidor circular (gauge)
  const CircularGauge = ({ value, max, label, color }: any) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-700"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={`${color} transition-all duration-500 ease-in-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{value} gal</span>
          </div>
        </div>
        <span className="text-xs text-slate-400 mt-1">{label}</span>
      </div>
    );
  };

  // Componente panel de medidores por dispensador
  const DispenserMeterPanel = ({ dispenserId }: { dispenserId: string }) => {
    const periodData = dispenserMeters[selectedPeriod as 'today' | 'week' | 'month'];
    const meterData = periodData[dispenserId as 'dispenser1' | 'dispenser2' | 'dispenser3'];
    
    if (!meterData) return null;
    
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-orange-500" />
            <h4 className="text-white font-semibold">
              {dispenserId === 'dispenser1' ? 'Dispensador 1' :
               dispenserId === 'dispenser2' ? 'Dispensador 2' : 'Dispensador 3'}
            </h4>
            <span className="text-xs text-slate-400">
              ({selectedPeriod === 'today' ? 'Hoy' : selectedPeriod === 'week' ? 'Semana' : 'Mes'})
            </span>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold text-sm">S/ {meterData.totalAmount.toLocaleString()}</div>
            <div className="text-slate-400 text-xs">{meterData.totalGallons.toLocaleString()} gal total</div>
          </div>
        </div>

        {/* Medidores digitales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <DigitalMeter
            label="Regular"
            current={meterData.readings.regular.current}
            previous={meterData.readings.regular.previous}
            gallons={meterData.readings.regular.gallons}
            color="bg-red-500"
          />
          <DigitalMeter
            label="Premium"
            current={meterData.readings.premium.current}
            previous={meterData.readings.premium.previous}
            gallons={meterData.readings.premium.gallons}
            color="bg-green-700"
          />
          <DigitalMeter
            label="Diesel"
            current={meterData.readings.diesel.current}
            previous={meterData.readings.diesel.previous}
            gallons={meterData.readings.diesel.gallons}
            color="bg-purple-700"
          />
        </div>

        {/* Medidores circulares */}
        <div className="flex justify-around pt-2 border-t border-slate-700">
          <CircularGauge
            value={meterData.readings.regular.gallons}
            max={selectedPeriod === 'today' ? 130 : selectedPeriod === 'week' ? 800 : 2650}
            label="Regular"
            color="text-red-500"
          />
          <CircularGauge
            value={meterData.readings.premium.gallons}
            max={selectedPeriod === 'today' ? 105 : selectedPeriod === 'week' ? 530 : 1500}
            label="Premium"
            color="text-green-600"
          />
          <CircularGauge
            value={meterData.readings.diesel.gallons}
            max={selectedPeriod === 'today' ? 80 : selectedPeriod === 'week' ? 400 : 1050}
            label="Diesel"
            color="text-purple-600"
          />
        </div>
      </div>
    );
  };

  // Componente medidor circular para tanques
  const TankMeter = ({ tank }: { tank: any }) => {
    const percentage = tank.level;
    const circumference = 2 * Math.PI * 60;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${tank.color} rounded-lg flex items-center justify-center`}>
              <Fuel size={16} className="text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{tank.name}</h4>
              <p className="text-slate-400 text-xs">{tank.type}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            tank.status === 'warning' 
              ? 'bg-yellow-500/20 text-yellow-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {tank.status === 'warning' ? 'Bajo' : 'OK'}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Medidor circular */}
          <div className="relative">
            <svg width="120" height="120" className="transform -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-600"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-700 ${
                  tank.level > 60 ? 'text-green-500' : 
                  tank.level > 30 ? 'text-yellow-500' : 'text-red-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white">{tank.level}%</div>
              <div className="text-slate-400 text-xs">Nivel</div>
            </div>
          </div>

          {/* Información lateral */}
          <div className="flex-1 space-y-2">
            <div className="bg-slate-600 rounded p-2">
              <div className="text-white font-semibold text-sm">{tank.current.toLocaleString()}L</div>
              <div className="text-slate-400 text-xs">Actual</div>
            </div>
            <div className="bg-slate-600 rounded p-2">
              <div className="text-white font-semibold text-sm">{tank.capacity.toLocaleString()}L</div>
              <div className="text-slate-400 text-xs">Capacidad</div>
            </div>
            <div className="bg-slate-600 rounded p-2">
              <div className="text-white font-semibold text-sm">{(tank.capacity - tank.current).toLocaleString()}L</div>
              <div className="text-slate-400 text-xs">Restante</div>
            </div>
          </div>
        </div>

        {/* Conexiones */}
        <div className="mt-3 pt-3 border-t border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Link size={12} className="text-slate-400" />
            <span className="text-xs text-slate-300">Conexiones:</span>
          </div>
          <div className="flex gap-1">
            {tank.connectedDispensers.map((dispenser: number) => (
              <div
                key={dispenser}
                className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs"
              >
                D{dispenser}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Modal de medidores
  const TankMetersModal = () => {
    if (!showTankMeters) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full h-full max-w-none max-h-none overflow-auto">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Gauge size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Medidores de Tanques</h2>
                <p className="text-slate-400 text-sm">Monitoreo detallado en tiempo real</p>
              </div>
            </div>
            <button
              onClick={() => setShowTankMeters(false)}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-4">
            {/* Medidores compactos para vista general de tanques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Total Regular</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="bg-black rounded p-2 mb-2 font-mono">
                  <div className="text-green-400 text-lg font-bold">
                    2969.8 gal
                  </div>
                  <div className="text-green-300 text-xs">
                    Ant: 2871.7 gal
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">98.1 gal</div>
                  <div className="text-slate-400 text-xs">Vendidos hoy</div>
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Total Premium</span>
                  <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                </div>
                <div className="bg-black rounded p-2 mb-2 font-mono">
                  <div className="text-green-400 text-lg font-bold">
                    1794.6 gal
                  </div>
                  <div className="text-green-300 text-xs">
                    Ant: 1747.0 gal
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">47.6 gal</div>
                  <div className="text-slate-400 text-xs">Vendidos hoy</div>
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Total Diesel</span>
                  <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
                </div>
                <div className="bg-black rounded p-2 mb-2 font-mono">
                  <div className="text-green-400 text-lg font-bold">
                    1207.3 gal
                  </div>
                  <div className="text-green-300 text-xs">
                    Ant: 1175.6 gal
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">31.7 gal</div>
                  <div className="text-slate-400 text-xs">Vendidos hoy</div>
                </div>
              </div>
              <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Total Diesel 2</span>
                  <div className="w-2 h-2 bg-purple-800 rounded-full"></div>
                </div>
                <div className="bg-black rounded p-2 mb-2 font-mono">
                  <div className="text-green-400 text-lg font-bold">4,200L</div>
                  <div className="text-green-300 text-xs">Actual</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-sm">-</div>
                  <div className="text-slate-400 text-xs">Vendidos hoy</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {tankData.map((tank) => (
                <TankMeter key={tank.id} tank={tank} />
              ))}
            </div>

            {/* Resumen compacto */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <BarChart3 size={16} />
                Resumen General
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {tankData.filter(t => t.status === 'normal').length}
                  </div>
                  <div className="text-slate-400 text-xs">Normales</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">
                    {tankData.filter(t => t.status === 'warning').length}
                  </div>
                  <div className="text-slate-400 text-xs">Alertas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {tankData.reduce((acc, tank) => acc + tank.current, 0).toLocaleString()}L
                  </div>
                  <div className="text-slate-400 text-xs">Total Actual</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round(tankData.reduce((acc, tank) => acc + tank.level, 0) / tankData.length)}%
                  </div>
                  <div className="text-slate-400 text-xs">Promedio</div>
                </div>
              </div>
            </div>

            {/* Barra de progreso general */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-300">Nivel general de inventario</span>
                <span className="text-sm text-slate-400">66.5% restante</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: '66.5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-full">
      {/* Header mejorado */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Grifo</h1>
          <p className="text-sm text-slate-400 mt-1">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          {/* Filtros de tiempo */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            {[
              { key: 'today', label: 'Hoy' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mes' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                  selectedPeriod === period.key
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              <Download size={18} />
            </button>
            <button className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Ventas Totales"
          value={`S/ ${currentData.totalSales.toLocaleString()}`}
          subtitle={`${selectedPeriod === 'today' ? 'Hoy' : selectedPeriod === 'week' ? 'Esta semana' : 'Este mes'}`}
          icon={DollarSign}
          color="from-green-500 to-green-600"
          trend={12.5}
        />
        <StatCard
          title="Clientes Atendidos"
          value={currentData.totalCustomers.toLocaleString()}
          subtitle="Clientes únicos"
          icon={Users}
          color="from-blue-700 to-blue-800"
          trend={8.3}
        />
        <StatCard
          title="Galones Vendidos"
          value={`${currentData.totalGallons.toLocaleString()} gal`}
          subtitle="Combustible total"
          icon={Fuel}
          color="from-purple-700 to-purple-800"
          trend={15.7}
        />
        <StatCard
          title="Empleados Activos"
          value={currentData.activeEmployees}
          subtitle="En servicio"
          icon={Clock}
          color="from-orange-500 to-orange-600"
          trend={0}
        />
      </div>

      {/* Sección principal con gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Panel de combustibles con medidores */}
        <div className="xl:col-span-2 bg-slate-800 rounded-2xl p-4 lg:p-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h3 className="text-xl lg:text-2xl font-bold text-white">Ventas por Combustible</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <BarChart3 size={16} />
              <span>Tiempo real</span>
            </div>
          </div>

          {/* Botones de dispensadores */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'dispenser1', label: 'Dispensador 1' },
              { key: 'dispenser2', label: 'Dispensador 2' },
              { key: 'dispenser3', label: 'Dispensador 3' }
            ].map((dispenser) => (
              <button
                key={dispenser.key}
                onClick={() => setSelectedDispenser(dispenser.key)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  selectedDispenser === dispenser.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                {dispenser.label}
              </button>
            ))}
          </div>

          {/* Mostrar medidores por dispensador o resumen general */}
          {selectedDispenser === 'all' ? (
            // Vista general con barras de progreso y medidores
            <div className="space-y-4 lg:space-y-6">
              {/* Medidores compactos para vista general */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Regular</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="bg-black rounded p-2 mb-2 font-mono">
                    <div className="text-green-400 text-lg font-bold">
                      2969.8 gal
                    </div>
                    <div className="text-green-300 text-xs">
                      Ant: 2871.7 gal
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">98.1 gal</div>
                    <div className="text-slate-400 text-xs">Vendidos hoy</div>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Premium</span>
                    <div className="w-2 h-2 bg-green-700 rounded-full"></div>
                  </div>
                  <div className="bg-black rounded p-2 mb-2 font-mono">
                    <div className="text-green-400 text-lg font-bold">
                      1794.6 gal
                    </div>
                    <div className="text-green-300 text-xs">
                      Ant: 1747.0 gal
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">47.6 gal</div>
                    <div className="text-slate-400 text-xs">Vendidos hoy</div>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Total Diesel</span>
                    <div className="w-2 h-2 bg-purple-700 rounded-full"></div>
                  </div>
                  <div className="bg-black rounded p-2 mb-2 font-mono">
                    <div className="text-green-400 text-lg font-bold">
                      1207.3 gal
                    </div>
                    <div className="text-green-300 text-xs">
                      Ant: 1175.6 gal
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm">31.7 gal</div>
                    <div className="text-slate-400 text-xs">Vendidos hoy</div>
                  </div>
                </div>
              </div>

              {/* Barras de progreso existentes */}
              {currentDispenserData && currentDispenserData.map((fuel: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${fuel.color}`}></div>
                      <span className="text-white font-medium">{fuel.type}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-slate-300">{fuel.gallons} gal</span>
                      <span className="text-green-400 font-semibold">S/ {fuel.amount}</span>
                      <span className="text-slate-400">{fuel.level}%</span>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${fuel.color} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${fuel.level}%` }}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full opacity-80"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vista de medidores por dispensador específico
            <DispenserMeterPanel dispenserId={selectedDispenser} />
          )}
        </div>

        {/* Panel de notificaciones */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg lg:text-xl font-bold text-white">Notificaciones</h3>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-orange-500" />
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {currentData.notifications.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            {currentData.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${
                  notification.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : notification.type === 'success'
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-blue-500/10 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{notification.time}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notification.priority === 'alta'
                          ? 'bg-red-500/20 text-red-400'
                          : notification.priority === 'media'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nueva sección de tanques desplegable (ahora va aquí, después de ventas y notificaciones) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700">
        <div 
          className="flex justify-between items-center p-4 lg:p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
          onClick={() => setTanksPanelOpen(!tanksPanelOpen)}
        >
          <div className="flex items-center gap-4">
            <h3 className="text-xl lg:text-2xl font-bold text-white">Estado de Tanques</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Fuel size={16} />
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Indicadores de estado rápido */}
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" title="3 tanques normales"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full" title="1 tanque bajo"></div>
            </div>
            {tanksPanelOpen ? (
              <ChevronUp size={20} className="text-slate-400" />
            ) : (
              <ChevronDown size={20} className="text-slate-400" />
            )}
          </div>
        </div>

        {/* Contenido desplegable */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          tanksPanelOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-4 pb-4 lg:px-6 lg:pb-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              {tankData.map((tank) => (
                <TankCard key={tank.id} tank={tank} />
              ))}
            </div>

            {/* Botón ver detalladamente */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowTankMeters(true)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <Gauge size={16} />
                Ver Detalladamente
              </button>
            </div>

            {/* Resumen de conexiones */}
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Link size={16} />
                Mapa de Conexiones
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="text-slate-300 font-medium">Dispensador 1</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Regular</span>
                    <span className="px-2 py-1 bg-green-700/20 text-green-300 rounded text-xs">Premium</span>
                    <span className="px-2 py-1 bg-purple-800/20 text-purple-300 rounded text-xs">Diesel 2</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 font-medium">Dispensador 2</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Regular</span>
                    <span className="px-2 py-1 bg-green-700/20 text-green-300 rounded text-xs">Premium</span>
                    <span className="px-2 py-1 bg-purple-700/20 text-purple-300 rounded text-xs">Diesel</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300 font-medium">Dispensador 3</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Regular</span>
                    <span className="px-2 py-1 bg-purple-700/20 text-purple-300 rounded text-xs">Diesel</span>
                    <span className="px-2 py-1 bg-purple-800/20 text-purple-300 rounded text-xs">Diesel 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transacciones recientes */}
      <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-xl lg:text-2xl font-bold text-white">Transacciones Recientes</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={prevTransactions}
                disabled={currentIndex === 0}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              <button 
                onClick={nextTransactions}
                disabled={currentIndex + 3 >= currentData.recentTransactions.length}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        </div>
        
        {/* Vista móvil: Tarjetas */}
        <div className="sm:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-700 rounded-lg p-3">
                <LoadingSkeleton />
              </div>
            ))
          ) : (
            visibleTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-slate-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{transaction.pump}</span>
                  <span className="text-green-400 font-semibold">S/ {transaction.amount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{transaction.fuel}</span>
                  <span className="text-slate-400">{transaction.date}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{transaction.gallons} gal</span>
                  <span className="text-slate-400">{transaction.time}</span>
                </div>
                <div className="text-sm text-slate-400">{transaction.liters}L</div>
              </div>
            ))
          )}
        </div>

        {/* Vista desktop: Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 text-slate-400 font-medium">ID</th>
                <th className="text-left py-3 text-slate-400 font-medium">Fecha</th>
                <th className="text-left py-3 text-slate-400 font-medium">Hora</th>
                <th className="text-left py-3 text-slate-400 font-medium">Surtidor</th>
                <th className="text-left py-3 text-slate-400 font-medium">Combustible</th>
                <th className="text-left py-3 text-slate-400 font-medium">Galones</th>
                <th className="text-right py-3 text-slate-400 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    <td className="py-3"><LoadingSkeleton /></td>
                    <td className="py-3"><LoadingSkeleton /></td>
                    <td className="py-3"><LoadingSkeleton /></td>
                    <td className="py-3"><LoadingSkeleton /></td>
                    <td className="py-3"><LoadingSkeleton /></td>
                    <td className="py-3"><LoadingSkeleton /></td>
                  </tr>
                ))
              ) : (
                visibleTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 text-slate-300">#{transaction.id}</td>
                    <td className="py-3 text-slate-300">{transaction.date}</td>
                    <td className="py-3 text-slate-300">{transaction.time}</td>
                    <td className="py-3 text-slate-300">{transaction.pump}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.fuel === 'Regular' ? 'bg-red-500/20 text-red-400' :
                        transaction.fuel === 'Premium' ? 'bg-green-700/20 text-green-300' :
                        transaction.fuel === 'Diesel' ? 'bg-purple-700/20 text-purple-300' :
                        'bg-slate-600/20 text-slate-300'
                      }`}>
                        {transaction.fuel}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{transaction.gallons} gal</td>
                    <td className="py-3 text-right text-green-400 font-semibold">S/ {transaction.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de medidores */}
      <TankMetersModal />
    </div>
  );
};

export default GrifoDashboard;