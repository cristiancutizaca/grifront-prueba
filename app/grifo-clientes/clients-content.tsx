'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil as EditIcon, Trash2 as DeleteIcon } from 'lucide-react';
import CreateClientModal from './components/CreateClientModal';
import EditClientModal from './components/EditClientModal';
import clientService, { Client } from '../../src/services/clientService';

const getTipoCliente = (client: Client) => {
  // Siempre retorna 'persona' o 'empresa'
  return client.client_type === 'empresa' || client.tipo_cliente === 'empresa'
    ? 'empresa'
    : 'persona';
};

const ClientsContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Creditos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes al montar
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getAllClients();
        setClients(data);
      } catch (error) {
        alert('Error cargando clientes');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);


  // Crear cliente desde modal
  const handleCreateClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setShowCreateModal(false);
  };

  // Guardar edición de cliente
  const handleSaveClient = async (updatedClient: Client) => {
    try {
      // 🔥 FORZAR TIPADO para que no explote el backend:
      const clientType: 'persona' | 'empresa' =
        updatedClient.client_type === 'empresa' || updatedClient.tipo_cliente === 'empresa'
          ? 'empresa'
          : 'persona';

      // Actualiza usando los campos principales y fuerza los strings
      const dataToSend = {
        ...updatedClient,
        client_type: clientType,
        first_name: updatedClient.first_name ? String(updatedClient.first_name) : '',
        last_name: updatedClient.last_name ? String(updatedClient.last_name) : '',
        company_name: updatedClient.company_name ? String(updatedClient.company_name) : '',
        category: updatedClient.category ? String(updatedClient.category) : '',
        document_type: updatedClient.document_type ? String(updatedClient.document_type) : '',
        document_number: updatedClient.document_number ? String(updatedClient.document_number) : '',
        address: updatedClient.address ? String(updatedClient.address) : '',
        phone: updatedClient.phone ? String(updatedClient.phone) : '',
        email: updatedClient.email ? String(updatedClient.email) : '',
        birth_date: updatedClient.birth_date ? String(updatedClient.birth_date) : undefined,
        notes: updatedClient.notes ? String(updatedClient.notes) : '',
      };

      const updated = await clientService.updateClient({ ...dataToSend, client_id: updatedClient.client_id });
      setClients(prevClients =>
        prevClients.map(client =>
          client.client_id === updated.client_id ? updated : client
        )
      );
      setEditingClient(null);
    } catch {
      alert('Error actualizando cliente');
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente?')) return;
    try {
      await clientService.deleteClient(clientId);
      setClients(prev => prev.filter(c => c.client_id !== clientId));
    } catch {
      alert('Error eliminando cliente');
    }
  };

  // Filtrado (mejorable según tus filtros reales)
  const filteredClients = clients.filter(client =>
  (`${client.first_name ?? client.nombre ?? ''} ${client.last_name ?? client.apellido ?? ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.document_number ?? client.documento ?? '').includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="text-white text-center py-10">Cargando clientes...</div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 lg:space-y-6 bg-blue">
      {/* Header */}
      <button
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus size={20} />
        <span>Añadir nuevo cliente</span>
      </button>

      {/* Modal de crear cliente */}
      {showCreateModal && (
        <CreateClientModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onClientCreated={handleCreateClient}
        />
      )}

      {/* Modal de editar cliente */}
      <EditClientModal
        isOpen={!!editingClient}
        client={editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleSaveClient}
      />

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-slate-400 text-sm mb-1">Buscar</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre o documento"
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Filtro</label>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            <option value="Creditos">Créditos</option>
            <option value="Contacts">Contactos</option>
            <option value="Frequents">Frecuentes</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 text-sm mb-1">Filtro</label>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            <option value="Frecuentes">Frecuentes ∨</option>
            <option value="Persona">Persona</option>
            <option value="Empresa">Empresa</option>
          </select>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Nombres y Apellidos</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Documento</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Tipo de Cliente</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Categoría</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Teléfono</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Correo</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Límite Crédito</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.client_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer">
                      <td className="py-3 px-4">
                        <span className="text-white">
                          {getTipoCliente(client) === 'persona'
                            ? `${client.first_name ?? client.nombre ?? ''} ${client.last_name ?? client.apellido ?? ''}`
                            : client.company_name || client.nombre}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{client.document_number ?? client.documento}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoCliente(client) === 'persona' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                          {getTipoCliente(client) === 'persona' ? 'Natural' : 'Empresa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{client.category || '---'}</td>
                      <td className="py-3 px-4 text-slate-300">{client.phone ?? client.telefono}</td>
                      <td className="py-3 px-4 text-slate-300">{client.email}</td>
                      <td className="py-3 px-4 text-slate-300">{client.limite_credito ?? 0}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-2 h-full">
                          <button onClick={() => setEditingClient(client)} className="text-blue-500 hover:text-blue-600 flex items-center">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDeleteClient(client.client_id)} className="text-red-500 hover:text-red-600 flex items-center">
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination aquí si necesitas */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsContent;
