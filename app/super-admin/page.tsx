'use client';

import React, { useState } from 'react';
import Layout from '../../src/components/Layout';
import ClientsContent from '../grifo-clientes/clients-content';
import ConfigurationContent from '../grifo-configuracion/configuration-content';
import VentasContent from '../grifo-ventas/ventas-content';
import CreditosContent from '../grifo-creditos/creditos-content';
import InventarioContent from '../grifo-inventario/inventario-content';
import ReportesContent from '../grifo-reportes/reportes-content';
import EmpleadosContent from '../grifo-empleados/empleados-content';
import TurnosContent from '../grifo-turnos/turnos-content';
import BackupContent from "../grifo-backup/backup-content";

const modules = [
  { name: '👥 Clientes', description: 'Registro, seguimiento y categorización automática.', key: 'clientes' },
  { name: '⚙️ Configuración', description: 'Parámetros generales del grifo, backup y restauración.', key: 'configuracion' },
  { name: '🧑‍💼 Empleados', description: 'Gestión de empleados y permisos por rol.', key: 'empleados' },
  { name: '🛒 Ventas', description: 'Registro de ventas, control de precios y modificaciones.', key: 'ventas' },
  { name: '💳 Créditos', description: 'Historial, límites y alertas de morosidad.', key: 'creditos' },
  { name: '💵 Pagos', description: 'Registro y conciliación con ventas o deudas.', key: 'pagos' },
  { name: '📦 Almacén', description: 'Gestión de productos, tanques, kardex.', key: 'almacen' },
  { name: '📑 Gastos/Compras', description: 'Registro y control de gastos con comprobantes.', key: 'gastos' },
  { name: '⏰ Turnos', description: 'Gestión de horarios, apertura y cierre de caja por turno.', key: 'turnos' },
  { name: '📊 Reportes', description: 'Reportes gráficos, exportaciones y envío automático.', key: 'reportes' },
  { name: '📦 Configuración de Backup', description: 'Configuración y gestión de backups del sistema.', key: 'backup' },
];


const ModuleComponents: Record<string, React.ReactNode> = {
  clientes: <ClientsContent />,
  configuracion: <ConfigurationContent />,
  empleados: <EmpleadosContent />,
  ventas: <VentasContent />,
  creditos: <CreditosContent />,
  pagos: <div className="text-white">💵 Interfaz de Pagos</div>,
  almacen: <InventarioContent />,
  gastos: <div className="text-white">📑 Interfaz de Gastos/Compras</div>,
  turnos: <TurnosContent />,
  reportes: <ReportesContent />,
  backup: <BackupContent />,
};

const SuperAdminPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  return (
    <Layout currentPage="super-admin">
      <div className="p-6 text-white min-h-screen bg-gray-900">
        <h1 className="text-3xl font-bold mb-4">Panel del Super Administrador</h1>
        <p className="text-gray-400 mb-10">Gestiona todos los módulos del sistema de grifo desde aquí.</p>

        {!selectedModule ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.key}
                onClick={() => setSelectedModule(mod.key)}
                className="cursor-pointer bg-gray-800 hover:bg-blue-700 transition-all duration-200 p-5 rounded-lg shadow-md"
              >
                <h2 className="text-xl font-semibold mb-2 text-white">{mod.name}</h2>
                <p className="text-sm text-gray-300">{mod.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelectedModule(null)}
              className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ← Volver al Panel
            </button>
            <div className="bg-gray-800 p-6 rounded shadow-md">
              {ModuleComponents[selectedModule]}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SuperAdminPage;
