import { Fuel } from "lucide-react";
import React from "react";
import { useSurtidores } from "./hooks/use-surtidores";
import { useTanques } from "./hooks/use-tanks";
import { useProducts } from "./hooks/use-products";
import { useSurtidoresTanques } from "./hooks/use-surtidores-tanks";
import SectionHeader from "./components/sectionHeader";
import SectionDataTable from "./components/sectionDataTable";

const SurtidoresContent: React.FC = () => {
  const {
    surtidores,
    editingSurtidor,
    form,
    showModal,
    handleDelete,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
  } = useSurtidores();

  const {
    surtidoresTanques,
    selectedTanks,
    toggleTankSelection,
    getTankNamesByPumpId,
    getTankIdsByPumpId,
    setSelectedTanks,
    assignTanksToPump,
    fetchSurtidoresTanques,
  } = useSurtidoresTanques();

  const {
    tanks,
  } = useTanques();

  const {
    products,
  } = useProducts();

  return (
    <div>
      <SectionHeader
        title="Gestión de Surtidores"
        subtitle="Administra los surtidores del grifo"
        icon={<Fuel className="w-5 h-5 sm:w-6 sm:h-6" />}
        onAddClick={() => handleOpenModal()}
        addLabel="Agregar Surtidor"
      />

      {/* Tabla de surtidores */}
      <SectionDataTable
        headers={[
          "Nombre del Surtidor",
          "Número de Surtidor",
          "Tanques Asignados",
          "Acciones",
        ]}
        rows={surtidores.map((surtidor) => {
          const nombresTanques = getTankNamesByPumpId(
            surtidor.pump_id,
            surtidoresTanques,
          );

          return (
          <tr key={surtidor.pump_id} className="hover:bg-slate-700/30">
            <td className="px-4 py-3 text-slate-300">{surtidor.pump_name}</td>
            <td className="px-4 py-3 text-slate-300">{surtidor.pump_number}</td>
            <td className="px-4 py-3 text-slate-300">
              {nombresTanques.length > 0
                ? nombresTanques.join(", ")
                : "Sin tanques asignados"}
            </td>
            <td className="px-4 py-3 text-center">
              <button
                onClick={() => handleOpenModal(surtidor, setSelectedTanks, getTankIdsByPumpId, surtidoresTanques)}
                className="text-blue-400 hover:text-blue-300 mr-2 font-bold"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(surtidor.pump_id)}
                className="text-red-400 hover:text-red-300 font-bold"
                title="Eliminar"
              >
                🗑️
              </button>
            </td>
          </tr>
        );
      })}
        emptyMessage="No hay surtidores registrados."
      />

      {/* Modal de edición/creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white flex-1">
                {editingSurtidor ? "Editar Surtidor" : "Agregar Surtidor"}
              </h2>
              {editingSurtidor && (
                <div className="px-4 py-3 text-xs text-slate-400 space-y-1 md:mr-4 flex-1 max-w-md">
                  <p className="flex items-center gap-2">
                    📅 <span className="font-medium">Creado:</span>
                    <span className="text-slate-300">
                      {new Date(editingSurtidor.created_at).toLocaleString(
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
                      {new Date(editingSurtidor.updated_at).toLocaleString(
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
                </div>
              )}
              {/* Botón cerrar */}
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
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre del Surtidor */}
                <div>
                  <label className="text-sm text-gray-300">
                    Nombre del Surtidor
                  </label>
                  <input
                    type="text"
                    name="pump_name"
                    value={form.pump_name || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 text-white rounded"
                  />
                </div>
                {/* Número del Surtidor */}
                <div>
                  <label className="text-sm text-gray-300">
                    Número del Surtidor
                  </label>
                  <input
                    type="text"
                    name="pump_number"
                    value={form.pump_number || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 text-white rounded"
                  />
                </div>
                {/* Ubicación del Surtidor */}
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-300">
                    Ubicación del Surtidor
                  </label>
                  <input
                    type="text"
                    name="location_description"
                    value={form.location_description || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 text-white rounded"
                  />
                </div>

                {/* Lista de tanques */}
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-300 mb-2 block font-semibold">
                    Seleccionar Tanques
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {tanks && tanks.length > 0 ? (
                      tanks.map((tank) => {
                        const isSelected = selectedTanks.includes(tank.tank_id);
                        const product = products.find(
                          (p) => p.product_id === tank.product_id
                        );
                        return (
                          <button
                            key={tank.tank_id}
                            type="button"
                            onClick={() => toggleTankSelection(tank.tank_id)}
                            className={`text-left rounded-xl p-4 border transition-all shadow-lg ${
                              isSelected
                                ? "bg-blue-600 border-blue-400 shadow-blue-500/20"
                                : "bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-gray-600"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-white">
                                {tank.tank_name}
                              </div>
                              {isSelected && (
                                <div className="text-blue-400 text-lg">✓</div>
                              )}
                            </div>
                            <p className="text-sm text-slate-300">
                              Producto: {product ? product.name : "Sin producto"}
                            </p>
                            {tank.location && (
                              <p className="text-xs text-slate-400 mt-1">
                                📍 {tank.location}
                              </p>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center text-gray-400 py-6">
                        No hay tanques disponibles.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSave(selectedTanks, assignTanksToPump, fetchSurtidoresTanques)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingSurtidor ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurtidoresContent;
