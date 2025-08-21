import React, { ChangeEvent } from 'react';
import { useBackup } from "./hooks/use-backup";
import { formatDateTime } from "../../src/utils/formatDateTime";

const BackupContent: React.FC = () => {
  const {
    backupconfig,
    historialBackup,
    updateBackupConfig,
    handleTipoBackupChange,
    calcularProximoBackup,
  } = useBackup();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Backup Manual */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-4 lg:mb-6">
            💾 BACKUP MANUAL
          </h2>
          <div className="h-1 bg-white mb-4 lg:mb-6"></div>

          <div className="space-y-4 lg:space-y-6">
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4 text-center">
              <span className="text-slate-300 text-base lg:text-lg">
                ÚLTIMO BACKUP
              </span>
              <div className="text-xl lg:text-2xl font-bold text-white mt-2">
                {formatDateTime(
                  historialBackup[historialBackup.length - 1]?.date_time ?? ""
                )}
              </div>
              <div
                className={`font-bold mt-1 text-sm lg:text-base ${
                  historialBackup[historialBackup.length - 1]?.status ===
                  "✅ Exitoso"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {historialBackup[historialBackup.length - 1]?.status ??
                  "Sin estado"}
              </div>
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 lg:py-4 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              💾 CREAR BACKUP AHORA
            </button>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 lg:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              📥 RESTAURAR BACKUP
            </button>

            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 lg:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              ⬇️ DESCARGAR ÚLTIMO BACKUP
            </button>
          </div>
        </div>

        {/* Configuración Automática */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-4 lg:mb-6">
            ⚙️ BACKUP AUTOMÁTICO
          </h2>
          <div className="h-1 bg-slate-600 mb-4 lg:mb-6"></div>

          <div className="space-y-3 lg:space-y-4">
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <label className="text-white font-bold block mb-2">
                TIPO DE BACKUP
              </label>
              <select
                value={
                  backupconfig.tipo_backup_seleccionado ||
                  backupconfig.tipo_backup[0]
                }
                onChange={handleTipoBackupChange}
                className="w-full bg-slate-600 text-white p-3 rounded-lg border-2 border-slate-500 focus:border-purple-400"
              >
                {backupconfig.tipo_backup.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <label className="text-white font-bold text-base lg:text-lg mb-2 block">
                FRECUENCIA
              </label>
              <select
                value={
                  backupconfig.frecuencia_seleccionada ||
                  backupconfig.frecuencia[0]
                }
                onChange={(e) => {
                  updateBackupConfig({
                    ...backupconfig,
                    frecuencia_seleccionada: e.target.value,
                  });
                }}
                className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-purple-400 focus:outline-none text-sm lg:text-base"
              >
                {backupconfig.frecuencia.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {backupconfig.frecuencia_seleccionada &&
              backupconfig.frecuencia_seleccionada !== "Desactivado" && (
                <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
                  <label className="text-white font-bold text-base lg:text-lg mb-2 block">
                    HORA PROGRAMADA
                  </label>
                  <input
                    type="time"
                    value={backupconfig.hora}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      updateBackupConfig({
                        ...backupconfig,
                        hora: e.target.value,
                      });
                    }}
                    className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-purple-400 focus:outline-none text-sm lg:text-base"
                  />
                </div>
              )}

            {backupconfig.frecuencia_seleccionada &&
              (backupconfig.frecuencia_seleccionada === "Semanal" ||
                backupconfig.frecuencia_seleccionada === "Mensual" ||
                backupconfig.frecuencia_seleccionada === "Anual") && (
                <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
                  <label className="text-white font-bold text-base lg:text-lg mb-2 block">
                    DÍA ESPECÍFICO
                  </label>
                  <select
                    value={backupconfig.dia_especifico || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      updateBackupConfig({
                        ...backupconfig,
                        dia_especifico: e.target.value,
                      });
                    }}
                    className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-purple-400 focus:outline-none text-sm lg:text-base"
                  >
                    {backupconfig.frecuencia_seleccionada === "Semanal" && (
                      <>
                        <option value="">Seleccione un día</option>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </>
                    )}
                    {backupconfig.frecuencia_seleccionada === "Mensual" && (
                      <>
                        <option value="">Seleccione un día</option>
                        {[...Array(31)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </>
                    )}
                    {backupconfig.frecuencia_seleccionada === "Anual" && (
                      <>
                        <option value="">Seleccione un día</option>
                        {[...Array(31)].map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}

            {backupconfig.frecuencia_seleccionada === "Anual" && (
              <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
                <label className="text-white font-bold text-base lg:text-lg mb-2 block">
                  MES
                </label>
                <select
                  value={backupconfig.mes || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    updateBackupConfig({
                      ...backupconfig,
                      mes: e.target.value,
                    });
                  }}
                  className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-purple-400 focus:outline-none text-sm lg:text-base"
                >
                  <option value="">Seleccione un mes</option>
                  <option value="Enero">Enero</option>
                  <option value="Febrero">Febrero</option>
                  <option value="Marzo">Marzo</option>
                  <option value="Abril">Abril</option>
                  <option value="Mayo">Mayo</option>
                  <option value="Junio">Junio</option>
                  <option value="Julio">Julio</option>
                  <option value="Agosto">Agosto</option>
                  <option value="Septiembre">Septiembre</option>
                  <option value="Octubre">Octubre</option>
                  <option value="Noviembre">Noviembre</option>
                  <option value="Diciembre">Diciembre</option>
                </select>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <span className="text-white font-bold text-base lg:text-lg mb-3 block">
                OPCIONES
              </span>
              <div className="space-y-2">
                {backupconfig.opciones.map((opcion, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={opcion.is_active}
                      onChange={() => {
                        const nuevasOpciones = [...backupconfig.opciones];
                        nuevasOpciones[index].is_active =
                          !nuevasOpciones[index].is_active;
                        updateBackupConfig({
                          ...backupconfig,
                          opciones: nuevasOpciones,
                        });
                      }}
                      className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600"
                    />
                    <span className="text-white text-sm lg:text-base">
                      {opcion.type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 lg:p-4 text-center ${
                backupconfig.frecuencia_seleccionada === "Desactivado"
                  ? "bg-yellow-800"
                  : "bg-green-800"
              }`}
            >
              <div
                className={`font-bold text-base lg:text-lg ${
                  backupconfig.frecuencia_seleccionada === "Desactivado"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {backupconfig.frecuencia_seleccionada === "Desactivado"
                  ? "🟡 BACKUP DESACTIVADO"
                  : "🟢 BACKUP AUTOMÁTICO ACTIVO"}
              </div>

              {backupconfig.frecuencia_seleccionada &&
                backupconfig.frecuencia_seleccionada !== "Desactivado" && (
                  <div className="text-white text-xs lg:text-sm mt-1">
                    Próximo: {calcularProximoBackup()}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Backups */}
      <div className="mt-10 bg-slate-800 rounded-2xl p-4 lg:p-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-white text-center mb-4 lg:mb-6">
          📜 HISTORIAL DE BACKUPS
        </h2>
        <div className="h-1 bg-slate-600 mb-4"></div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm lg:text-base text-white">
            <thead className="bg-slate-700 text-left">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {historialBackup.map((history, idx) => (
                <tr key={idx} className="hover:bg-slate-700">
                  <td className="p-3">{formatDateTime(history.date_time)}</td>
                  <td className="p-3">{history.type}</td>
                  <td className="p-3">
                    {history.status === "✅ Exitoso" ? (
                      <span className="text-green-400 font-bold">
                        {history.status}
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold">
                        {history.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-1 px-3 rounded text-xs">
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BackupContent;