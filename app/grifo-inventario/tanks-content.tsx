import React from "react";
import { TangentIcon } from "lucide-react";
import { useTanques } from "./hooks/use-tanks";
import { useProducts } from "./hooks/use-products";
import SectionHeader from "./components/sectionHeader";
import SectionDataTable from "./components/sectionDataTable";

const TanksContent: React.FC = () => {
  const {
    tanks,
    form,
    showModal,
    editingTank,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
  } = useTanques();

  const {
    products
  } = useProducts();

  return (
    <div>
      <SectionHeader
        title="Gestión de Tanques"
        subtitle="Administra los tanques del grifo"
        icon={<TangentIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        onAddClick={() => handleOpenModal()}
        addLabel="Agregar Tanque"
      />

      {/* Tabla de tanques */}
      <SectionDataTable
        headers={[
          "Nombre",
          "Capacidad(gal)",
          "Ubicación",
          "Producto",
          "Acciones",
        ]}
        rows={tanks.map((tank) => (
          <tr key={tank.tank_id} className="hover:bg-slate-700/30 transition-colors">
            <td className="px-4 py-3 text-white font-medium">
              {tank.tank_name}
            </td>
            <td className="px-4 py-3 text-slate-300">{tank.total_capacity}</td>
            <td className="px-4 py-3 text-slate-300">{tank.location}</td>
            <td className="px-4 py-3 text-slate-300">
              {
                products.find((product) => product.product_id === tank.product_id)?.name || "Producto desconocido"
              }
            </td>
            <td className="px-4 py-3 text-center">
              <button
                onClick={() => handleOpenModal(tank)}
                className="text-blue-400 hover:text-blue-300 mr-2 font-bold"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(tank.tank_id)}
                className="text-red-400 hover:text-red-300 font-bold"
                title="Eliminar"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
        emptyMessage="No hay tanques registrados."
      />

      {/* Modal de edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {editingTank ? "Editar Tanque" : "Agregar Tanque"}
              </h2>
              {editingTank && (
                <div className="text-sm text-slate-300">
                  <p>
                    📅 Fecha de Creación:{" "}
                    {new Date(editingTank.created_at).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    🔄 Última Modificación:{" "}
                    {new Date(editingTank.updated_at).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre del Tanque
                </label>
                <input
                  type="text"
                  name="tank_name"
                  value={form.tank_name || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del tanque"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Producto
                </label>
                <select
                  name="product_id"
                  value={form.product_id || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Seleccione un producto</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Capacidad Total (Galones)
                </label>
                <input
                  type="text"
                  name="total_capacity"
                  value={form.total_capacity || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Capacidad total"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ubicación del tanque"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={form.description || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Descripción del tanque"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TanksContent;
