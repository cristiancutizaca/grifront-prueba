'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  CreditCard,
  DollarSign,
  Fuel,
  RefreshCcw,
  Search,
  Calendar,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import saleService from '../../src/services/saleService';
import clientService, { Client as BaseClient } from '../../src/services/clientService';
import pumpService from '../../src/services/pumpService';
import nozzleService from '../../src/services/nozzleService';
import { Dispensador as Nozzle } from '../../app/grifo-inventario/types/dispensadores';

/* ---------- HELPERS / CONST ---------- */
import { decodeUserIdFromJWT } from '../../src/utils/jwt';
import { fmtTime, fmtDateTime, toLocalDateInputValue } from '../../src/utils/dates';
import { asArray } from '../../src/utils/arrays';
import { cleanNotes } from '../../src/utils/text';
import { getPumpNumericOrder } from '../../src/utils/pumps';
import { parseGrossFromNotes } from '../../src/utils/sales';
import { IGV_BY_FUEL, toFuelType, type FuelType } from '../../src/constants/fuels';
import { PAYMENT_OPTIONS, getPaymentLabel, type PaymentKey } from '../../src/constants/payments';
import { mapClient } from '../../src/utils/clients';

/* ------------------------------ Tipos ------------------------------ */
interface PumpInfo {
  pump_id: number;
  pump_name: string;
  nozzles: any[];
}

interface Client extends BaseClient {
  id: number;
}

type PumpData = {
  pump_id?: number;
  id?: number;
  pump_name?: string;
  pump_number?: string;
  nombre?: string;
  nozzles?: any[];
};

interface Product {
  id: number;
  nombre: FuelType;
  precio: number;
  tipo: string;
}

/* ==================================================================== */

const GrifoNewSale: React.FC = () => {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('Premium');
  const [quantity, setQuantity] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('CASH');
  const [discount, setDiscount] = useState<string>('0');
  const [observations, setObservations] = useState<string>('');
  const [taxRate, setTaxRate] = useState<number>(0.18);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);

  /** Modo de ingreso */
  const [entryMode, setEntryMode] = useState<'GALLONS' | 'AMOUNT'>('GALLONS');
  const [manualAmount, setManualAmount] = useState<string>('');

  /** Cliente */
  const [showClientSearch, setShowClientSearch] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Productos / surtidores
  const [pumpNozzles, setPumpNozzles] = useState<any[]>([]);
  const [selectedPumpId, setSelectedPumpId] = useState<number | null>(null);
  const [pumpList, setPumpList] = useState<PumpInfo[]>([]);
  const [nozzleByProduct, setNozzleByProduct] = useState<Record<number, number>>({});
  const [currentPumpNozzles, setCurrentPumpNozzles] = useState<Nozzle[]>([]);
  const [selectedNozzleId, setSelectedNozzleId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [products] = useState<Product[]>([
    { id: 1, nombre: 'Diesel', precio: 3.0, tipo: 'diesel' },
    { id: 2, nombre: 'Premium', precio: 4.01, tipo: 'gasolina' },
    { id: 3, nombre: 'Regular', precio: 4.0, tipo: 'gasolina' },
  ]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loadingRecentSales, setLoadingRecentSales] = useState(false);

  const RECENT_LIMIT = 25;

  /** Paginación local */
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(recentSales.length / PAGE_SIZE));
  const pageSales = useMemo(
    () => recentSales.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [recentSales, currentPage]
  );

  const clientById = useMemo(() => {
    const m = new Map<number, Client>();
    clients.forEach((c) => m.set(Number(c.id), c));
    return m;
  }, [clients]);

  /** Crédito */
  const [isCredit, setIsCredit] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState<string>('');

  /* --------------------------- Carga inicial --------------------------- */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const userId = decodeUserIdFromJWT();
        setCurrentUserId(userId);

        const [clientsData, pumpsDataRaw] = await Promise.all([
          clientService.getAllClients(),
          pumpService.getAllPumps(),
        ]);

        const mappedClients = clientsData.map(mapClient);
        setClients(mappedClients);
        setFilteredClients(mappedClients.slice(0, 10));

        const pumpsArr = Array.isArray(pumpsDataRaw) ? (pumpsDataRaw as any[]) : [];
        pumpsArr.sort((a, b) => getPumpNumericOrder(a) - getPumpNumericOrder(b));

        const pumpObjects: PumpInfo[] = pumpsArr.map((p: PumpData, idx) => {
          const id = Number(p?.pump_id ?? p?.id ?? idx + 1);
          const num = getPumpNumericOrder(p);
          const name = String(
            p?.pump_name ?? p?.nombre ?? p?.pump_number ?? `Surtidor ${String(num).padStart(3, '0')}`
          );
          return { pump_id: id, pump_name: name, nozzles: [] };
        });

        setPumpList(pumpObjects);
        if (pumpObjects.length > 0) await handlePumpSelect(pumpObjects[0].pump_id);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  /** Ajusta página si cambia el total */
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  /* ------------------- Selección de surtidor/productos ------------------- */
  const handlePumpSelect = async (pumpId: number) => {
    if (!pumpId || isNaN(pumpId)) return;
    setSelectedPumpId(pumpId);
    setSelectedProduct(null);
    setSelectedNozzleId(null);
    setError(null);

    try {
      const allNozzlesRaw = await nozzleService.getAllNozzles();
      const nozzlesArr: Nozzle[] = asArray<Nozzle>(allNozzlesRaw);
      const pumpNozzlesOnly = (nozzlesArr || []).filter((n) => Number(n.pump_id) === Number(pumpId));
      setCurrentPumpNozzles(pumpNozzlesOnly);

      const directMap: Record<number, number> = {};
      for (const nz of pumpNozzlesOnly) {
        const pid = Number(
          (nz as any).product_id ?? (nz as any).producto?.id ?? (nz as any).product?.product_id
        );
        if (pid) directMap[pid] = Number(nz.nozzle_id);
      }
      setNozzleByProduct(directMap);

      const res: any = await pumpService.getProductsFromPump(pumpId);
      const list = Array.isArray(res) ? res : res?.products ?? [];

      const virtualNozzles = (list as any[]).map((p, idx) => {
        const product_id = Number(p?.product_id ?? p?.id);
        const precio = Number(p?.unit_price ?? p?.precio ?? 0);
        const nombre = String(p?.name ?? p?.fuel_type ?? 'Regular');
        return {
          nozzle_id: directMap[product_id] ?? `P${product_id}_${idx}`,
          producto: {
            id: product_id,
            nombre: toFuelType(nombre),
            precio,
            tipo: String(p?.category ?? p?.fuel_type ?? ''),
          },
        };
      });

      setPumpNozzles(virtualNozzles);
    } catch (e) {
      console.error(e);
      setPumpNozzles([]);
      setCurrentPumpNozzles([]);
      setNozzleByProduct({});
    }
  };

  /* ---------------------- Cálculos por GALONES ---------------------- */
  useEffect(() => {
    if (entryMode !== 'GALLONS') return;
    const qty = Number(quantity) || 0;
    const price = selectedProduct?.precio || 0;
    const disc = Number(discount) || 0;

    const tax = IGV_BY_FUEL[selectedFuel] ?? 0.18;
    setTaxRate(tax);

    const sub = Math.max(0, qty * price - disc);
    const taxVal = sub * tax;
    setTaxAmount(taxVal);
    setSubtotal(sub + taxVal);
  }, [entryMode, quantity, selectedFuel, discount, selectedProduct]);

  /* ---------------------- Cálculos por IMPORTE ---------------------- */
  useEffect(() => {
    if (entryMode !== 'AMOUNT') return;
    const price = selectedProduct?.precio || 0;
    const disc = Number(discount) || 0;
    const amountIn = Number(manualAmount) || 0;

    const tax = IGV_BY_FUEL[selectedFuel] ?? 0.18;
    setTaxRate(tax);

    const paidGross = Math.max(0, amountIn - disc);
    const netFinal = paidGross > 0 ? paidGross / (1 + tax) : 0;
    const qty = price > 0 ? netFinal / price : 0;

    setTaxAmount(netFinal * tax);
    setSubtotal(paidGross);
    const qStr = qty > 0 ? qty.toFixed(2) : '';
    if (qStr !== quantity) setQuantity(qStr);
  }, [entryMode, manualAmount, selectedFuel, discount, selectedProduct]);

  /* ----------------------- Cliente (buscador) ----------------------- */
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearchTerm(`${client.nombre} ${client.apellido}`);
    setShowClientDropdown(false);
  };

  const toggleClientMode = () => {
    setShowClientSearch((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedClient(null);
        setClientSearchTerm('');
        setShowClientDropdown(false);
      }
      return next;
    });
  };

  /* ------------------ Selección de producto + boquilla ------------------ */
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedFuel(product.nombre);
    setError(null);

    let candidate = nozzleByProduct[product.id];
    if (!candidate && currentPumpNozzles.length) {
      const match = currentPumpNozzles.find(
        (nz) => Number((nz as any).product_id) === Number(product.id)
      );
      candidate = match ? Number(match.nozzle_id) : candidate;
    }
    if (!candidate && currentPumpNozzles.length) {
      candidate = Number(currentPumpNozzles[0].nozzle_id);
    }
    setSelectedNozzleId(candidate || null);
  };

  /* --------------------- Totales (payload) --------------------- */
  const totalsForPayload = useMemo(() => {
    const qty = Number(quantity) || 0;
    const price = selectedProduct?.precio || 0;
    const disc = Number(discount) || 0;
    const total_amount = qty * price;
    const final_amount = Math.max(0, total_amount - disc);
    return { total_amount, discount_amount: disc, final_amount };
  }, [quantity, selectedProduct, discount]);

  /* ---------------------- Selector de pago ---------------------- */
  const handlePaymentSelect = (key: PaymentKey) => {
    setPaymentMethod(key);
    const credit = key === 'CREDIT';
    setIsCredit(credit);
    if (credit) {
      const plus30 = new Date();
      plus30.setDate(plus30.getDate() + 30);
      setDueDate(toLocalDateInputValue(plus30));
    } else {
      setDueDate('');
    }
  };

  /* -------------------------- Registrar venta -------------------------- */
  const handleSubmit = async () => {
    try {
      if (!currentUserId) {
        setError('No se pudo identificar al usuario (token). Inicie sesión nuevamente.');
        return;
      }
      if (!selectedProduct || !selectedPumpId) {
        setError('Debe seleccionar surtidor y producto.');
        return;
      }
      if (Number(quantity) <= 0) {
        setError('La cantidad debe ser mayor a 0');
        return;
      }

      if (paymentMethod === 'CREDIT') {
        if (!selectedClient) {
          setError('Para ventas a crédito, seleccione un cliente.');
          return;
        }
        if (!dueDate) {
          setError('Seleccione la fecha de vencimiento del crédito.');
          return;
        }
      }

      let nozzle_id: number | null =
        selectedNozzleId ?? nozzleByProduct[selectedProduct.id] ?? null;

      if ((nozzle_id == null || Number.isNaN(nozzle_id)) && currentPumpNozzles.length) {
        const match = currentPumpNozzles.find(
          (nz) => Number((nz as any).product_id) === Number(selectedProduct.id)
        );
        nozzle_id = match ? Number((match as any).nozzle_id) : null;
      }
      if ((nozzle_id == null || Number.isNaN(nozzle_id)) && currentPumpNozzles.length) {
        nozzle_id = Number((currentPumpNozzles[0] as any).nozzle_id);
      }
      if (nozzle_id == null || Number.isNaN(nozzle_id)) {
        setError('No se encontró boquilla para el producto seleccionado en este surtidor.');
        return;
      }

      setLoading(true);
      setError(null);

      const pm = PAYMENT_OPTIONS.find((p) => p.key === paymentMethod)!;

      const rate = IGV_BY_FUEL[selectedProduct?.nombre as keyof typeof IGV_BY_FUEL] ?? 0.18;
      let grossPaid: number;
      if (entryMode === 'AMOUNT') {
        const amountIn = Number(manualAmount || 0);
        const disc = Number(discount || 0);
        grossPaid = Math.max(0, amountIn - disc);
      } else {
        grossPaid = Number(totalsForPayload.final_amount || 0) * (1 + rate);
      }

      const baseNotes = observations || '';
      const notesWithGross = `${baseNotes}${baseNotes ? ' ' : ''}[pagado_bruto=${grossPaid.toFixed(
        2
      )}]`;

      const payload: any = {
        user_id: currentUserId,
        client_id: showClientSearch && selectedClient ? selectedClient.id : null,
        nozzle_id: Number(nozzle_id),
        total_amount: Number(totalsForPayload.total_amount),
        final_amount: Number(totalsForPayload.final_amount),
        payment_method_id: pm.id,
        payment_method: pm.method_name,
        notes: notesWithGross || undefined,
        status: 'completed',
      };

      if (Number(discount) > 0) payload.discount_amount = Number(discount);
      if (paymentMethod === 'CREDIT' && dueDate) payload.due_date = dueDate;

      await saleService.createSale(payload);

      setSuccess('✅ Venta registrada exitosamente');
      await refreshRecentSales();
      resetFormAfterSuccess();
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Error al registrar la venta';
      setError(Array.isArray(msg) ? msg.join(' | ') : String(msg));
    } finally {
      setLoading(false);
    }
  };

  const resetFormAfterSuccess = () => {
    setSelectedClient(null);
    setSelectedProduct(null);
    setSelectedNozzleId(null);
    setClientSearchTerm('');
    setQuantity('');
    setDiscount('0');
    setObservations('');
    setEntryMode('GALLONS');
    setManualAmount('');
    setIsCredit(false);
    setDueDate('');
  };

  const handleCancel = () => {
    if (window.confirm('¿Seguro que desea cancelar la venta?')) {
      setSelectedClient(null);
      setSelectedProduct(null);
      setSelectedNozzleId(null);
      setClientSearchTerm('');
      setQuantity('');
      setDiscount('0');
      setObservations('');
      setSelectedPumpId(null);
      setPumpNozzles([]);
      setCurrentPumpNozzles([]);
      setNozzleByProduct({});
      setPaymentMethod('CASH');
      setEntryMode('GALLONS');
      setManualAmount('');
      setIsCredit(false);
      setDueDate('');
    }
  };

  /* --------------------------- Ventas recientes --------------------------- */
  const refreshRecentSales = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      setRecentSales([]);
      return;
    }

    setLoadingRecentSales(true);
    try {
      const [salesRaw, allNozzlesRaw] = await Promise.all([
        saleService.getRecentSales(RECENT_LIMIT),
        nozzleService.getAllNozzles(),
      ]);

      const sales: any[] = asArray<any>(salesRaw);
      const allNozzles: any[] = asArray<any>(allNozzlesRaw);

      const nozzleMap = new Map<
        number,
        { pump_id?: number; product_name?: string; unit_price?: number }
      >();
      for (const n of allNozzles) {
        const nid = Number(n?.nozzle_id ?? n?.id);
        const pump_id = Number(n?.pump_id ?? n?.pump?.pump_id);
        const product_name = String(n?.product?.name ?? n?.producto?.nombre ?? '') || undefined;
        const unit_price = Number(n?.product?.unit_price ?? n?.producto?.precio ?? NaN);
        nozzleMap.set(nid, {
          pump_id,
          product_name,
          unit_price: Number.isFinite(unit_price) && unit_price > 0 ? unit_price : undefined,
        });
      }

      const priceByFuel: Record<string, number> = {
        Diesel: products.find((p) => p.nombre === 'Diesel')?.precio ?? 0,
        Premium: products.find((p) => p.nombre === 'Premium')?.precio ?? 0,
        Regular: products.find((p) => p.nombre === 'Regular')?.precio ?? 0,
      };
      const pumpNameById = new Map(pumpList.map((p) => [p.pump_id, p.pump_name]));

      const enriched = sales.map((s: any) => {
        const nz = nozzleMap.get(Number(s.nozzle_id));
        const productName = nz?.product_name ?? '—';
        const pumpName =
          pumpNameById.get(nz?.pump_id ?? -1) ??
          (nz?.pump_id ? `Surtidor ${nz.pump_id}` : 'Surtidor —');
        const unitPrice = nz?.unit_price ?? (productName ? priceByFuel[productName] ?? 0 : 0);

        const totalBaseNet = Number(s.total_amount ?? 0);
        const finalNet = Number(s.final_amount ?? s.total_amount ?? 0);
        const discountAmount =
          Number(s.discount_amount ?? (totalBaseNet - finalNet) ?? 0) || 0;

        const gallons = unitPrice > 0 ? totalBaseNet / unitPrice : null;

        let uiClientName: string | undefined =
          s?.client?.name ||
          [s?.client?.first_name, s?.client?.last_name].filter(Boolean).join(' ') ||
          s?.client_name;
        if (!uiClientName && s?.client_id) {
          const c = clientById.get(Number(s.client_id));
          if (c)
            uiClientName =
              [c.nombre, c.apellido].filter(Boolean).join(' ') ||
              c.email ||
              `Cliente ${c.id}`;
        }

        const rate = IGV_BY_FUEL[productName as keyof typeof IGV_BY_FUEL] ?? 0.18;
        let grossPaid = parseGrossFromNotes(s?.notes ?? '');
        if (grossPaid == null) grossPaid = finalNet * (1 + rate);

        const paymentLabel = getPaymentLabel(s);

        return {
          ...s,
          _ui: {
            clientName: uiClientName,
            productName,
            pumpName,
            gallons,
            amountGross: grossPaid,
            time: fmtTime(s.sale_timestamp),
            dateTime: fmtDateTime(s.sale_timestamp),
            discountAmount,
            discountText:
              discountAmount > 0
                ? `Desc: S/ ${discountAmount.toFixed(2)}`
                : 'Sin descuento',
            paymentLabel,
          },
        };
      });

      setRecentSales(enriched);
    } catch (err: any) {
      if (
        String(err?.message || '').toLowerCase().includes('unauthorized') ||
        err?.response?.status === 401
      ) {
        console.warn('Sesión expirada. Inicia sesión nuevamente.');
      } else {
        console.error(err);
      }
      setRecentSales([]);
    } finally {
      setLoadingRecentSales(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;

    refreshRecentSales();
    const interval = setInterval(refreshRecentSales, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientById]);

  /** --- UI: tamaño adaptativo de cards de producto + CENTRADO --- */
  const productCards = useMemo(() => pumpNozzles.filter((nz: any) => nz?.producto), [pumpNozzles]);
  const isCompactCards = productCards.length >= 4; // 4+ compactas, 3- altas
  const productCardH = isCompactCards ? 'h-20 sm:h-24' : 'h-28 sm:h-32';
  const productGridMinH = isCompactCards ? 'min-h-[96px]' : 'min-h-[160px]';

  /* ============================== RENDER ============================== */

  if (loading && clients.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-white">Cargando datos del servidor...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Fondo con gradiente sutil */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(253,186,116,0.08),transparent),radial-gradient(900px_500px_at_100%_10%,rgba(59,130,246,0.06),transparent)]" />

      <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-10">
        {/* Mensajes */}
        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-200 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm sm:text-base">{error}</p>
              <button
                onClick={() => setError(null)}
                className="rounded-md px-2 py-1 text-red-100 hover:bg-red-400/20"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm sm:text-base">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="rounded-md px-2 py-1 text-emerald-100 hover:bg-emerald-400/20"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="rounded-2xl border border-slate-700/60 bg-[#0f172a]/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                <Fuel size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Nueva Venta</h1>
                <p className="text-sm text-slate-400 sm:text-base">Registro rápido de ventas de combustible</p>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-2">
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-center text-slate-300">
                <span className="text-xs uppercase tracking-wide text-slate-400">Turno</span>
                <div className="text-base font-semibold text-white">Mañana</div>
              </div>
              <div className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-center text-slate-300">
                <span className="text-xs uppercase tracking-wide text-slate-400">Empleado</span>
                <div className="text-base font-semibold text-white">Juan Pérez</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 backdrop-blur sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
              <User className="text-blue-400" size={20} /> Cliente
            </h3>
            <button
              onClick={toggleClientMode}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                showClientSearch
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {showClientSearch ? 'Desactivar búsqueda' : 'Activar búsqueda'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Buscador */}
            <div
              className={`relative flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/70 px-5 py-5 shadow-inner ${
                !showClientSearch ? 'opacity-60' : ''
              }`}
            >
              <Search size={18} className="text-blue-400" />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => setShowClientDropdown(true)}
                  className={`w-full rounded-lg border border-slate-600 bg-slate-700/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 ${
                    !showClientSearch ? 'cursor-not-allowed' : ''
                  }`}
                  placeholder="Buscar cliente por nombre o DNI..."
                  autoComplete="off"
                  disabled={!showClientSearch}
                  readOnly={!showClientSearch}
                />
                {showClientDropdown && filteredClients.length > 0 && showClientSearch && (
                  <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                    {filteredClients.map((client) => (
                      <button
                        type="button"
                        key={client.id}
                        onClick={() => {
                          handleClientSelect(client);
                        }}
                        className="block w-full px-3 py-2 text-left text-white hover:bg-slate-700"
                      >
                        <div className="font-medium">
                          {client.nombre} {client.apellido}
                        </div>
                        <div className="text-xs text-slate-400">{client.documento}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info cliente */}
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-5 text-sm text-slate-300">
              <div>
                <div className="text-slate-400">Nombre</div>
                <div className="truncate text-base font-semibold text-white">
                  {showClientSearch
                    ? selectedClient
                      ? `${selectedClient.nombre} ${selectedClient.apellido}`
                      : '—'
                    : 'Sin cliente'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">DNI</div>
                <div className="text-base font-semibold text-white">
                  {showClientSearch ? (selectedClient ? selectedClient.documento : '—') : '—'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Email</div>
                <div className="truncate text-base font-semibold text-white">
                  {showClientSearch
                    ? selectedClient
                      ? selectedClient.email || 'No disponible'
                      : '—'
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Surtidores + productos */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 sm:p-7 md:col-span-2">
            <div className="mb-2 flex flex-col items-center gap-3">
              <h3 className="m-0 flex items-center gap-2 text-lg font-semibold text-white">
                <Fuel size={18} className="text-yellow-400" /> Tipo de combustible
              </h3>

              {/* Selector de surtidor (puede quedar donde lo tienes, no es el foco) */}
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                {pumpList.map((pump) => (
                  <button
                    key={pump.pump_id}
                    onClick={() => handlePumpSelect(pump.pump_id)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold shadow-sm transition-colors ${
                      selectedPumpId === pump.pump_id
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {pump.pump_name}
                  </button>
                ))}
              </div>
            </div>

            {/* GRID de productos CENTRADO */}
            <div className={`mt-4 ${productGridMinH} flex flex-wrap justify-center gap-4`}>
              {productCards.length > 0 ? (
                productCards.map((noz: any) => {
                  const p = noz.producto!;
                  const isSelected = selectedProduct?.id === p.id;

                  // Base pill compacta, con gradiente por tipo
                  const base =
                    `w-[210px] sm:w-[230px] ${productCardH} rounded-2xl ring-1 ring-white/10 shadow-md transition-all duration-150 ` +
                    `flex items-center gap-3 px-4 text-white hover:-translate-y-0.5 hover:shadow-lg`;

                  let theme = '';
                  if (p.nombre === 'Regular')
                    theme = isSelected
                      ? 'bg-gradient-to-br from-red-500 to-red-700'
                      : 'bg-gradient-to-br from-red-500/90 to-red-700/90 hover:from-red-500 hover:to-red-700';
                  else if (p.nombre === 'Premium')
                    theme = isSelected
                      ? 'bg-gradient-to-br from-emerald-600 to-green-700'
                      : 'bg-gradient-to-br from-emerald-600/90 to-green-700/90 hover:from-emerald-600 hover:to-green-700';
                  else if (p.nombre === 'Diesel')
                    theme = isSelected
                      ? 'bg-gradient-to-br from-violet-600 to-purple-700'
                      : 'bg-gradient-to-br from-violet-600/90 to-purple-700/90 hover:from-violet-600 hover:to-purple-700';

                  return (
                    <button
                      key={noz.nozzle_id}
                      onClick={() => {
                        const formattedProduct: Product = {
                          id: Number(p.id),
                          nombre: toFuelType(String(p.nombre)),
                          precio: Number(p.precio),
                          tipo: String(p.tipo),
                        };
                        handleProductSelect(formattedProduct);
                      }}
                      className={`${base} ${theme} ${isSelected ? 'ring-2 ring-amber-300/60' : ''}`}
                      title={`${p.nombre} - S/ ${Number(p.precio).toFixed(2)}`}
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur-[2px]">
                        <Fuel size={18} />
                      </div>

                      <div className="flex-1 text-left leading-tight">
                        <div className="text-[13px] font-semibold">{p.nombre}</div>
                        <div className="text-[11px] opacity-90">S/ {Number(p.precio).toFixed(2)}</div>
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold">
                          Seleccionado
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400">
                  {selectedPumpId
                    ? 'No hay productos disponibles para este surtidor.'
                    : 'Seleccione un surtidor para ver los productos disponibles'}
                </div>
              )}
            </div>
          </div>

          {/* Panel de precios */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
            <h3 className="mb-4 flex items-center justify-center gap-2 text-lg font-semibold text-white">
              <Fuel size={18} className="text-yellow-400" /> Precios de Combustible
            </h3>
            <div className="space-y-3">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3"
                >
                  <span className="text-slate-300">{product.nombre}</span>
                  <span className="text-lg font-semibold text-white">S/ {product.precio.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selector de modo */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/70 p-1">
            <button
              onClick={() => setEntryMode('GALLONS')}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                entryMode === 'GALLONS' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Ingresar por Galones
            </button>
            <button
              onClick={() => {
                setEntryMode('AMOUNT');
                setManualAmount(subtotal ? subtotal.toFixed(2) : '');
              }}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${
                entryMode === 'AMOUNT' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Importe (S/)
            </button>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Ingreso */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-6 text-center">
            <h3 className="mb-3 text-lg font-semibold text-white">
              {entryMode === 'AMOUNT' ? 'Ingresar importe (S/)' : 'Cantidad de galones'}
            </h3>
            {entryMode === 'AMOUNT' ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                className="mx-auto block h-12 w-44 rounded-lg border border-slate-600 bg-slate-800 px-3 text-center text-xl font-bold text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="S/ 0.00"
              />
            ) : (
              <input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mx-auto block h-12 w-44 rounded-lg border border-slate-600 bg-slate-800 px-3 text-center text-xl font-semibold text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                placeholder="0.00"
              />
            )}
            <div className="mt-2 text-xs text-slate-400">
              {entryMode === 'AMOUNT' ? (
                'Monto con IGV'
              ) : (
                <>
                  Galón:{' '}
                  <span className="font-semibold text-white">
                    {selectedProduct?.nombre || 'No seleccionado'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Precio unitario */}
          <div className="grid place-items-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-6 text-center">
            <span className="text-slate-400">Precio unitario</span>
            <span className="text-xl font-bold text-green-400">
              S/ {(selectedProduct?.precio ?? 0).toFixed(2)}
            </span>
          </div>

          {/* IGV */}
          <div className="grid place-items-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-6 text-center">
            <span className="text-slate-400">Impuesto</span>
            <span className="text-xl font-bold text-blue-400">S/ {taxAmount.toFixed(2)}</span>
            <span className="text-xs text-slate-400">IGV ({Math.round(taxRate * 100)}%)</span>
          </div>

          {/* Total */}
          <div className="grid place-items-center rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-6 text-center">
            <span className="text-slate-400">{entryMode === 'AMOUNT' ? 'Galones' : 'Total'}</span>
            {entryMode === 'AMOUNT' ? (
              <>
                <span className="mb-1 text-2xl font-bold text-orange-400">
                  {Number(quantity || 0).toFixed(2)} gal
                </span>
                <span className="text-xs text-slate-400">Importe (c/desc): S/ {subtotal.toFixed(2)}</span>
              </>
            ) : (
                <>
                  <span className="mb-1 text-2xl font-bold text-orange-400">S/ {subtotal.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">Galones: {quantity || 0}</span>
                </>
            )}
          </div>
        </div>

        {/* Pago / Descuento / Crédito */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Método de pago */}
          <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
            <h3 className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold text-white">
              <CreditCard size={18} className="text-green-400" /> Método de pago
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handlePaymentSelect(opt.key)}
                  className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
                    paymentMethod === opt.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel condicionado */}
          {paymentMethod === 'CREDIT' ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
              <h3 className="mb-3 text-center text-lg font-semibold text-white">Crédito</h3>
              <div className="mb-3 flex justify-center">
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/70 p-1">
                  <button
                    onClick={() => setEntryMode('GALLONS')}
                    className={`rounded-md px-3 py-1 text-sm font-semibold ${
                      entryMode === 'GALLONS' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Galones
                  </button>
                  <button
                    onClick={() => {
                      setEntryMode('AMOUNT');
                      if (!manualAmount) setManualAmount(subtotal ? subtotal.toFixed(2) : '');
                    }}
                    className={`rounded-md px-3 py-1 text-sm font-semibold ${
                      entryMode === 'AMOUNT' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Soles
                  </button>
                </div>
              </div>

              {entryMode === 'AMOUNT' ? (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-300">Importe a crédito (S/)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
                    placeholder="S/ 0.00"
                  />
                  <span className="text-xs text-slate-400">Se calcula automáticamente los galones.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-slate-300">Galones a crédito</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                  <span className="text-xs text-slate-400">Se calcula automáticamente el total.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
              <h3 className="mb-3 text-center text-lg font-semibold text-white">Descuento</h3>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
                placeholder="Ingrese descuento"
              />
            </div>
          )}

          {/* Observaciones o Fecha */}
          {paymentMethod === 'CREDIT' ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
              <h3 className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold text-white">
                <Calendar size={18} className="text-orange-400" /> Fecha de vencimiento
              </h3>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
                min={toLocalDateInputValue(new Date())}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <span className="mt-2 block text-center text-xs text-slate-400">Solo para ventas a crédito.</span>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6">
              <h3 className="mb-3 flex items-center justify-center gap-2 text-lg font-semibold text-white">
                <ClipboardList size={18} className="text-orange-400" /> Observaciones
              </h3>
              <input
                type="text"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white focus:border-orange-500 focus:outline-none"
                placeholder="Ingrese observaciones"
              />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-4 pt-2 sm:flex-row">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
          >
            {loading ? 'Registrando…' : 'Registrar Venta'}
          </button>
        </div>

        {/* Ventas recientes */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <DollarSign size={18} className="text-green-400" /> Ventas recientes
            </h3>
            <button
              onClick={refreshRecentSales}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700 disabled:opacity-50"
              disabled={loadingRecentSales}
              title="Actualizar"
            >
              <RefreshCcw size={14} className={loadingRecentSales ? 'animate-spin' : ''} />
              {loadingRecentSales ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>

          {/* Cabecera */}
          <div className="hidden grid-cols-5 gap-2 border-b border-slate-700 pb-2 text-[11px] uppercase tracking-wide text-slate-400 sm:grid">
            <div className="col-span-2">Cliente / Surtidor</div>
            <div>Producto</div>
            <div className="text-center">Monto</div>
            <div className="text-right">Fecha</div>
          </div>

          {/* Lista */}
          <div className="divide-y divide-slate-700">
            {pageSales.length === 0 && (
              <div className="py-6 text-center text-slate-400">
                {loadingRecentSales ? 'Cargando ventas…' : 'No hay ventas recientes'}
              </div>
            )}

            {pageSales.map((sale: any) => {
              const key = sale.sale_id || sale.id;

              const clientName =
                sale._ui?.clientName ||
                sale.client?.name ||
                [sale.client?.first_name, sale.client?.last_name].filter(Boolean).join(' ') ||
                sale.client_name ||
                'Sin cliente';

              const productName = sale._ui?.productName ?? '—';
              const pumpName = sale._ui?.pumpName ?? '—';
              const gallons = sale._ui?.gallons != null ? Number(sale._ui.gallons).toFixed(2) : '—';
              const paidGross = Number(sale._ui?.amountGross ?? 0).toFixed(2);
              const dateTimeStr = sale._ui?.dateTime ?? fmtDateTime(sale.sale_timestamp);
              const status = sale.status || 'completed';
              const discountText = sale._ui?.discountText ?? 'Sin descuento';
              const paymentLabel = sale._ui?.paymentLabel ?? '—';

              const obsText = cleanNotes(sale?.notes);

              return (
                <div key={key} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-5 sm:items-center">
                  {/* Cliente + Surtidor */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-600 text-xs font-bold text-white">
                      {String(clientName).charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="text-sm text-slate-300">
                      <div className="font-medium text-white">{clientName}</div>
                      <div className="text-xs text-slate-400">{pumpName}</div>
                    </div>
                  </div>

                  {/* Producto + galones */}
                  <div className="text-sm text-slate-300">
                    {productName} · {gallons !== '—' ? `${gallons} gal` : '—'}
                  </div>

                  {/* Pago + Descuento + Método */}
                  <div className="text-center">
                    <div className="text-base text-green-400">S/ {paidGross}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {discountText} · Pago: {paymentLabel}
                    </div>
                  </div>

                  {/* Fecha + estado */}
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="text-xs text-slate-400">{dateTimeStr}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          status === 'completed'
                            ? 'bg-green-700 text-white'
                            : status === 'pending'
                            ? 'bg-yellow-700 text-white'
                            : 'bg-red-700 text-white'
                        }`}
                      >
                        {status === 'completed'
                          ? 'Completada'
                          : status === 'pending'
                          ? 'Pendiente'
                          : 'Cancelada'}
                      </span>
                      {obsText && (
                        <span
                          title={obsText}
                          className="cursor-help rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                        >
                          Obs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {recentSales.length > PAGE_SIZE && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`rounded-md border px-3 py-1 text-xs ${
                    currentPage === n
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrifoNewSale;
