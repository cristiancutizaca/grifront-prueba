import React, { useState, useEffect } from "react";
import { Fuel } from "lucide-react";
import { useProducts } from "./hooks/use-products";
import { useTanques } from "./hooks/use-tanks";
import { useSurtidores } from "./hooks/use-surtidores";
import { useDispensador } from "./hooks/use-dispendador";
import SectionHeader from "./components/sectionHeader";
import SectionDataTable from "./components/sectionDataTable";

const DispensadorContent: React.FC = () => {
  const {
    dispensadores,
    showModal,
    editingDispensador,
    form,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    filteredTanks,
    filteredProducts,
    selectedProduct,
  } = useDispensador();

  const {
    products
  } = useProducts();

  const {
    tanks
  } = useTanques();

  const {
    surtidores
  } = useSurtidores();

  return (
    <div>
      <SectionHeader
        title="Gestión de Dispensador"
        subtitle="Administra los dispensadores del grifo"
        icon={<Fuel className="w-5 h-5 sm:w-6 sm:h-6" />}
        onAddClick={() => handleOpenModal()}
        addLabel="Agregar Dispensador"
      />

      {/* Tabla de dispensadores */}
      <SectionDataTable
        headers={[
          "Número de Dispensador",
          "Nombre del Surtidor",
          "Nombre del Tanque",
          "Nombre del Producto",
          "Acciones",
        ]}
        rows={dispensadores.map((disp) => {
          const surtidor = surtidores.find(
            (s) => s.pump_id === disp.pump_id
          );
          const producto = products.find(
            (p) => p.product_id === disp.product_id
          );
          const tanque = tanks.find((t) => t.tank_id === disp.tank_id);

          return (
            <tr key={disp.nozzle_id} className="hover:bg-slate-700/30">
              <td className="px-4 py-3 text-slate-300">
                {disp.nozzle_number}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {surtidor?.pump_name ?? "-"}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {tanque?.tank_name ?? "-"}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {producto?.name ?? "-"}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => handleOpenModal(disp)}
                  className="text-blue-400 hover:text-blue-300 mr-2 font-bold"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(disp.nozzle_id)}
                  className="text-red-400 hover:text-red-300 font-bold"
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          );
        })}
        emptyMessage="No hay dispensadores registrados."
      />

      {/* Modal de edición/creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white flex-1">
                {editingDispensador
                  ? "Editar Dispensador"
                  : "Agregar Dispensador"}
              </h2>
              {editingDispensador && (
                <div className="px-4 py-3 text-xs text-slate-400 space-y-1 md:mr-4 flex-1 max-w-md">
                  <p className="flex items-center gap-2">
                    📅 <span className="font-medium">Creado:</span>
                    <span className="text-slate-300">
                      {new Date(editingDispensador.created_at).toLocaleString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    🔄 <span className="font-medium">Actualizado:</span>
                    <span className="text-slate-300">
                      {editingDispensador.updated_at ? new Date(editingDispensador.updated_at).toLocaleString(
                        "es-PE",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      ) : "No disponible"}
                    </span>
                  </p>
                </div>
              )}
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                aria-label="Cerrar modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Número de Dispensador
                </label>
                <input
                  type="number"
                  name="nozzle_number"
                  value={form.nozzle_number || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Número de dispensador"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Surtidor
                </label>
                <select
                  name="pump_id"
                  value={form.pump_id || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {surtidores.map((s) => (
                    <option key={s.pump_id} value={s.pump_id}>
                      {s.pump_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Producto
                </label>
                <select
                  name="tank_id"
                  value={form.tank_id || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {filteredTanks.map((t) => {
                    const product = products.find((p) => p.product_id === t.product_id);
                    return (
                      <option key={t.tank_id} value={t.tank_id}>
                        {product ? `${product.name}` : ''} - ({t.tank_name})
                      </option>
                    );
                  })}
                </select>
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

export default DispensadorContent;
