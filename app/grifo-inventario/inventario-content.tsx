"use client";

import dynamic from "next/dynamic";
import React from "react";
import moment from "moment";
import "moment/locale/es";
moment.locale("es");
const ProductsContent = dynamic(() => import("./products-content"));
const TanksContent = dynamic(() => import("./tanks-content"));
const SurtidoresContent = dynamic(() => import("./surtidores-content"));
const PistolasContent = dynamic(() => import("./dispensadores-content"));
import { useInventario } from "./hooks/use-inventario";
import { useProducts } from "./hooks/use-products";

const GrifoInventarioContent: React.FC = () => {
  const {
    currentTime,
    currentMonth,
    daysInMonth,
    startDay,
    selectedTank,
    setSelectedTank,
    gallons,
    setGallons,
    registrarMovimiento,
    tanks,
  } = useInventario();

  const {
    products,
  } = useProducts();

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-blue min-h-screen">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mb-4 lg:mb-6">
          <div className="lg:col-span-4 flex flex-col lg:h-full space-y-3 lg:space-y-4">
            {/* Hora */}
            <div className="flex-1 bg-slate-800 p-3 lg:p-4 rounded-lg flex flex-col justify-center items-center">
              <h2 className="text-white text-lg lg:text-xl font-bold">HORA</h2>
              <p className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
                {currentTime ?? "Cargando..."}
              </p>
            </div>
            {/* Inventario */}
            <div className="flex-1 bg-slate-800 p-3 lg:p-4 rounded-lg flex flex-col justify-center items-center">
              <h2 className="text-white text-lg lg:text-xl font-bold">
                INVENTARIO
              </h2>
            </div>
          </div>

          {/* Calendario */}
          <div className="lg:col-span-8 bg-slate-800 p-3 lg:p-4 rounded-lg">
            <h2 className="text-green-400 text-center text-lg lg:text-xl font-bold mb-3 lg:mb-4">
              {currentMonth.format("MMMM").toUpperCase()}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-white text-xs sm:text-sm">
              {["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"].map((day) => (
                <div key={day} className="font-bold text-green-400 p-1">
                  {day}
                </div>
              ))}

              {Array(startDay)
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`}></div>
                ))}

              {/* Días del mes actual */}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday =
                  moment().date() === day &&
                  moment().month() === currentMonth.month();
                return (
                  <div
                    key={day}
                    className={`p-1 lg:p-2 rounded-full text-yellow-400 ${
                      isToday ? "bg-green-700" : ""
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sección Central: Combustible y Entrada de Galones */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-4 mb-4 lg:mb-6">
          {/* Combustible */}
          <div className="xl:col-span-8 bg-slate-800 p-3 lg:p-4 rounded-lg">
            <h2 className="text-white text-center text-lg lg:text-xl font-bold mb-3 lg:mb-4">
              COMBUSTIBLE
            </h2>
            <div className="space-y-3 lg:space-y-4">
              {tanks.map((tank, i) => {
                const product = products.find((p) => p.product_id === tank.product_id);

                const capacidadTotal = parseInt(tank.total_capacity);
                const cantidadActual = parseInt(tank.current_stock) || 0;

                const porcentaje = Math.max((cantidadActual / capacidadTotal) * 100, 5);

                const barColors = ["bg-red-500", "bg-green-500", "bg-fuchsia-500"];
                const barColor = barColors[i % barColors.length];
                return (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1 lg:mb-2">
                      <p className="text-white text-base lg:text-lg">
                        {product ? product.name : "Producto desconocido"} ({tank.tank_name ?? ''})
                      </p>
                      <span className="text-gray-300 text-sm lg:text-base font-semibold">
                        {cantidadActual.toLocaleString()} GAL / {capacidadTotal.toLocaleString()} GAL
                      </span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-10 lg:h-12 flex items-center p-1 relative overflow-hidden">
                      <div
                        className={`${barColor} h-8 lg:h-10 rounded-full flex items-center justify-center transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      >
                        <span className="text-white font-bold text-sm lg:text-base">
                          {cantidadActual.toLocaleString()} GAL
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Entrada - Salida de Galones */}
          <div className="xl:col-span-4 bg-slate-800 p-3 lg:p-4 rounded-lg flex flex-col gap-4">
            {/* Selector de tanque */}
            <div className="bg-gray-700 p-2 rounded-lg">
              <select
                className="w-full bg-gray-800 text-white p-2 rounded-lg text-lg"
                value={selectedTank ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTank(value ? parseInt(value, 10) : null);
                }}
              >
                <option value="" disabled>
                  Selecciona un tanque
                </option>
                {tanks.map((tank) => (
                  <option key={tank.tank_id} value={tank.tank_id}>
                    {tank.tank_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable de galones */}
            <div className="bg-gray-700 p-3 lg:p-4 rounded-lg text-white text-center text-2xl sm:text-3xl lg:text-4xl font-bold">
              <input
                type="number"
                value={gallons}
                onChange={(e) => setGallons(Number(e.target.value))}
                className="w-full bg-gray-600 text-center focus:outline-none rounded-lg"
              />
              <span className="text-sm lg:text-lg ml-2">GAL</span>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={() => registrarMovimiento("OUT")}
                className="bg-red-600 text-white p-2 lg:p-3 rounded-lg text-lg lg:text-xl font-bold flex-grow hover:bg-red-700 transition-colors duration-200"
              >
                VACIAR
              </button>
              <button
                onClick={() => registrarMovimiento("IN")}
                className="bg-green-600 text-white p-2 lg:p-3 rounded-lg text-lg lg:text-xl font-bold flex-grow hover:bg-green-700 transition-colors duration-200"
              >
                LLENAR
              </button>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Tabla de Cantidades */}
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
          <div className="hidden sm:grid grid-cols-4 gap-4 text-white font-bold text-sm lg:text-base border-b border-gray-700 pb-2 mb-2">
            <div>TANQUE</div>
            <div>CANTIDAD (GAL)</div>
            <div>FECHA</div>
            <div>HORA</div>
          </div>

          {/* Vista móvil - tarjetas */}
          <div className="sm:hidden space-y-3">
            {tanks.length > 0 ? (
              tanks.map((registro, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg shadow-md">
                  <div className="font-bold text-lg text-white mb-1">
                    {registro.total_capacity} Galones
                  </div>
                  <div className="text-gray-300 text-sm">
                    <p><span className="font-medium">Tanque:</span> {registro.tank_name}</p>
                    <div className="flex justify-between mt-1">
                      <span>{moment(registro.created_at).format("DD/MM/YYYY")}</span>
                      <span>{moment(registro.created_at).format("hh:mm A")}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No hay registros aún.
              </div>
            )}
          </div>

          {/* Vista tablet/desktop - tabla */}
          <div className="hidden sm:block text-white text-sm lg:text-base">
            {tanks.length > 0 ? (
              tanks.map((registro, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 gap-4 py-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <div className="font-medium">{registro.tank_name}</div>
                  <div className="font-medium">{registro.total_capacity} Galones</div>
                  <div className="text-gray-300">{moment(registro.created_at).format("DD/MM/YYYY")}</div>
                  <div className="text-gray-300">{moment(registro.created_at).format("hh:mm A")}</div>
                </div>
              ))
            ) : (
              <div className="text-center col-span-4 text-gray-400 py-4">
                No hay registros aún.
              </div>
            )}
          </div>
        </div>

      </div>

      <br />
      <ProductsContent />

      <br />
      <TanksContent />

      <br />
      <SurtidoresContent />

      <br />
      <PistolasContent />
    </div>
  );
};

export default GrifoInventarioContent;