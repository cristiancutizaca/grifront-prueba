'use client';

/**
 * TurnosContent — calcado a la UI de VentasContent, manteniendo el fondo de Turnos.
 * Cambios CLAVE para igualar los montos:
 *  - Se intenta leer el MONTO BRUTO desde sale.notes (JSON o texto) igual que VentasContent.
 *  - Si no hay en notes, se usa final_amount; si no, neto + IGV.
 *  - Se muestra siempre __display_amount si existe.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTurnos } from './hooks/use-turnos';
import UserService from '../../src/services/userService';
import { jwtDecode } from 'jwt-decode';

/* ======================
   1) TURNOS Y UTILIDADES
   ====================== */
type ShiftName = 'Leon' | 'Tarde' | 'Buho';
type ShiftWindow = { start: string; end: string };

const SHIFT_HOURS: Record<ShiftName, ShiftWindow> = {
  Leon:  { start: '05:00', end: '12:00' },
  Tarde: { start: '12:00', end: '19:00' },
  Buho:  { start: '19:00', end: '05:00' }, // cruza medianoche
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number); return h * 60 + m;
};
const inRange = (t: number, s: number, e: number) => (s <= e ? t >= s && t < e : t >= s || t < e);

function resolveShiftName(when: Date): ShiftName {
  const t = when.getHours() * 60 + when.getMinutes();
  for (const [name, w] of Object.entries(SHIFT_HOURS) as [ShiftName, ShiftWindow][]) {
    if (inRange(t, toMinutes(w.start), toMinutes(w.end))) return name;
  }
  return 'Leon';
}
function getShiftRange(name: ShiftName, now: Date) {
  const { start, end } = SHIFT_HOURS[name];
  const s = toMinutes(start), e = toMinutes(end);
  const t = now.getHours() * 60 + now.getMinutes();
  const from = new Date(now), to = new Date(now);
  from.setHours(Math.floor(s / 60), s % 60, 0, 0);
  to.setHours(Math.floor(e / 60), e % 60, 0, 0);
  if (s > e && t < e) from.setDate(from.getDate() - 1);
  if (s > e && t >= s) to.setDate(to.getDate() + 1);
  return { from, to };
}

/* ======================
   2) TIPOS Y CLIENTE API
   ====================== */
type Producto = 'Regular' | 'Premium' | 'Diesel';

type VentaAPI = {
  sale_id: number | string;
  sale_timestamp?: string;
  status?: string;

  // cliente
  client_id?: number;
  client_name?: string;
  client?: any;
  customer_name?: string;
  customer?: string;
  full_name?: string;

  // surtidor / boquilla
  nozzle_id?: number;
  nozzle_number?: number | string;
  nozzle?: { nozzle_number?: number | string; pump?: { pump_number?: number | string } };
  pump_number?: number | string;
  pump?: { pump_number?: number | string; name?: string; code?: string };
  dispenser?: { code?: string; name?: string };

  // producto/cantidades/montos
  product_name?: string;
  product?: { product_name?: string; name?: string };
  fuel?: { name?: string };
  producto?: { nombre?: string } | string;

  saleDetails?: Array<{
    quantity?: number | string;
    unit_price?: number | string;
    subtotal?: number | string;
    product?: { product_name?: string; name?: string };
    nozzle?: { pump?: { pump_number?: number | string } };
    pump?: { pump_number?: number | string; name?: string; code?: string };
    dispenser?: { code?: string; name?: string };
    fuel?: { name?: string };
  }>;
  details?: Array<any>;

  quantity?: number | string;
  gallons?: number | string;  galones?: number | string;  qty?: number | string; total_gallons?: number | string;
  liters?: number | string;   litros?: number | string;   volume?: number | string; volumen?: number | string;
  unit_price?: number | string;
  total_amount?: number | string;  // NETO
  final_amount?: number | string;  // BRUTO (si viene)
  price?: number | string; precio_unitario?: number | string; precio_galon?: number | string; price_per_gallon?: number | string;

  payment_method?: string;
  paymentMethod?: { method_name?: string };

  // fechas alternativas
  created_at?: string;
  sale_date?: string;

  // notes (de aquí a veces sale el BRUTO exacto como en VentasContent)
  notes?: string;

  // helper UI
  __display_amount?: number;

  [k: string]: any;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/,'');
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const h: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}
async function apiGET<T=any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/* ===========================
   3) NORMALIZADORES/HELPERS
   =========================== */
const parseNum = (v: any): number | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  if (typeof v === 'string') {
    const s = v.replace(/[^\d,.,-]/g, '').replace(',', '.');
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};
const pickNum = (...vals: any[]): number | undefined => {
  for (const x of vals) {
    const n = parseNum(x);
    if (n != null && Number.isFinite(n)) return n;
  }
  return undefined;
};

// IGV — para convertir neto<->bruto cuando notes no trae el bruto explícito
const IGV = 0.18;
const grossFromNet = (net?: number) => net == null ? undefined : +(net * (1 + IGV)).toFixed(2);
const netFromGross  = (gross?: number) => gross == null ? undefined : +(gross / (1 + IGV)).toFixed(2);

// ==== PARSER DE NOTES (como en VentasContent) ====
// 1) Si notes es JSON, buscamos campos tipo: gross, bruto, amount_paid, total, importe, monto, etc.
// 2) Si es texto, buscamos etiquetas (gross|bruto|pago|pagado|importe|monto) y cantidades "S/ 999.99".
// 3) Si encontramos varias, nos quedamos con la MÁS ALTA (suele ser el total bruto pagado).
function parseGrossFromNotes(notes?: string): number | undefined {
  if (!notes) return undefined;

  // JSON
  const tryJson = notes.trim();
  if (tryJson.startsWith('{') || tryJson.startsWith('[')) {
    try {
      const obj = JSON.parse(tryJson);
      let best: number | undefined;
      const visit = (v: any) => {
        if (v && typeof v === 'object') {
          for (const [k, val] of Object.entries(v)) {
            if (typeof val === 'number') {
              if (/(gross|brut|pagado|paid|importe|monto|total)/i.test(k)) {
                best = Math.max(best ?? 0, val);
              }
            } else if (typeof val === 'string') {
              const n = parseNum(val);
              if (n != null && /(gross|brut|pagado|paid|importe|monto|total)/i.test(k)) {
                best = Math.max(best ?? 0, n);
              }
            } else {
              visit(val);
            }
          }
        } else if (Array.isArray(v)) {
          v.forEach(visit);
        }
      };
      visit(obj);
      if (best != null && best > 0) return +best.toFixed(2);
    } catch { /* sigue con texto */ }
  }

  // TEXTO: primero intento con etiqueta específica
  const tagged = notes.match(/(?:bruto|gross|pago(?:\s*total)?|pagado|importe|monto)\s*[:=]?\s*(?:S\/\s*)?([0-9]+(?:[.,][0-9]{1,2})?)/i);
  if (tagged) {
    const val = parseNum(tagged[1]);
    if (val != null) return +val.toFixed(2);
  }

  // TEXTO: si no hay etiqueta, tomo la cifra monetaria más alta
  const all: number[] = [];
  const re = /(?:S\/\s*)?([0-9]+(?:[.,][0-9]{1,2})?)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(notes))) {
    const n = parseNum(m[1]);
    if (n != null) all.push(n);
  }
  if (all.length) return +Math.max(...all).toFixed(2);

  return undefined;
}

function resolveClientNameFromEntity(c: any): string {
  const full = c?.full_name?.trim();
  if (full) return full;
  const company = c?.company_name?.trim();
  if (company) return company;
  const composed = [c?.first_name || c?.firstname || c?.name, c?.last_name || c?.lastname]
    .filter(Boolean)
    .join(' ')
    .trim();
  return composed || 'Cliente';
}

function resolveClientName(v: any): string {
  const c = v.client || {};
  const full = v.client_name || v.full_name || c.full_name;
  if (full) return String(full);
  const composed = [c.first_name || c.firstname || c.name, c.last_name || c.lastname].filter(Boolean).join(' ').trim();
  if (composed) return composed;
  if (c.company_name) return c.company_name;
  if (v.customer_name) return v.customer_name;
  if (v.customer) return v.customer;
  return 'Cliente';
}

function resolveUnitPrice(v: VentaAPI): number | undefined {
  return pickNum(
    v.unit_price, v.price_per_gallon, v.price, v.precio_unitario, v.precio_galon,
    v.saleDetails?.[0]?.unit_price, v.details?.[0]?.unit_price
  );
}

function resolveProductName(v: VentaAPI): string {
  return (
    v.product_name ||
    v.product?.product_name ||
    v.product?.name ||
    v.fuel?.name ||
    (typeof v.producto === 'string' ? v.producto : v.producto?.nombre) ||
    v.saleDetails?.[0]?.product?.product_name ||
    v.saleDetails?.[0]?.product?.name ||
    v.details?.[0]?.product?.name ||
    v.details?.[0]?.fuel?.name ||
    '—'
  );
}

function resolvePumpNumberFromAny(v: any): string | number | undefined {
  const direct = v.nozzle?.pump?.pump_number ?? v.pump?.pump_number ?? v.pump_number;
  if (direct != null) return direct;

  const d = Array.isArray(v.details) && v.details.length ? v.details[0] :
            (Array.isArray(v.saleDetails) && v.saleDetails.length ? v.saleDetails[0] : undefined);
  const fromDetail =
    d?.nozzle?.pump?.pump_number ?? d?.pump?.pump_number ?? d?.pump_number;
  if (fromDetail != null) return fromDetail;

  const code = v.pump?.code ?? d?.pump?.code ?? v.dispenser?.code ?? d?.dispenser?.code ?? v.dispenser_code;
  if (code) return code;

  const name = v.pump?.name ?? d?.pump?.name ?? v.dispenser?.name ?? d?.dispenser?.name;
  if (name) return name;

  return undefined;
}

// Formatea SIEMPRE “Surtidor 001” (3 dígitos) y evita “0-1”
function formatPumpLabelStrict(v: VentaAPI): string {
  const raw = resolvePumpNumberFromAny(v);
  if (raw == null || raw === '') return 'Surtidor —';
  const num = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
  if (Number.isFinite(num)) return `Surtidor ${String(num).padStart(3, '0')}`;
  return `Surtidor ${String(raw)}`;
}

function getInitial(name: string) {
  const s = (name || '—').trim();
  return s ? s[0].toUpperCase() : '—';
}

function resolveGallons(v: VentaAPI): number {
  const direct = pickNum(v.quantity, v.gallons, v.galones, v.qty, v.total_gallons, v.volume, v.volumen);
  if (direct != null) return direct;

  const det: any[] = Array.isArray(v.saleDetails) && v.saleDetails.length ? v.saleDetails :
                     (Array.isArray(v.details) ? v.details : []);
  if (det.length) {
    const sum = det.reduce((acc, d) => acc + (pickNum(d?.quantity, d?.gallons, d?.galones, d?.qty, d?.volume, d?.volumen) ?? 0), 0);
    if (sum > 0) return sum;
  }

  const liters = pickNum(v.liters, v.litros);
  if (liters != null) return liters / 3.785411784;

  const price  = resolveUnitPrice(v);
  if (price) {
    const netAmount =
      pickNum(v.total_amount, v.saleDetails?.[0]?.subtotal, v.details?.[0]?.subtotal) ??
      netFromGross(pickNum(v.final_amount));
    if (netAmount) return netAmount / price;
  }

  return 0;
}

// MONTO BRUTO (con IGV) SI NO VINO DE notes/final_amount
function resolveAmount(v: VentaAPI): number {
  const gross = pickNum(v.final_amount);
  if (gross != null) return gross;

  const net = pickNum(v.total_amount, v.saleDetails?.[0]?.subtotal, v.details?.[0]?.subtotal);
  if (net != null) return grossFromNet(net)!;

  const g = resolveGallons(v);
  const p = resolveUnitPrice(v) ?? 0;
  return +(g * p * (1 + IGV)).toFixed(2);
}

function resolveDateISO(v: VentaAPI): string {
  return v.sale_timestamp || v.created_at || v.sale_date || '';
}

/* ===================================================
   4) FETCH VENTAS + ÍNDICE
   =================================================== */

async function fetchVentas(limit: number): Promise<VentaAPI[]> {
  try {
    const raw = await apiGET<any>(`/sales/recent?limit=${limit}`);
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw)) return raw;
  } catch {}
  try {
    const raw = await apiGET<any>(`/sales?limit=${limit}`);
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw)) return raw;
  } catch {}
  try {
    const raw = await apiGET<any>(`/ventas/recientes?limit=${limit}`);
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw)) return raw;
  } catch {}
  return [];
}

type NozzleIndexValue = {
  nozzle_id: number;
  nozzle_number?: number;
  pump_number?: number;
  product_name?: string;
  unit_price?: number;
};

async function buildNozzleIndex(): Promise<Map<number, NozzleIndexValue>> {
  const headers = authHeaders();
  const idx = new Map<number, NozzleIndexValue>();

  const add = (nozzleLike: any, pumpLike?: any) => {
    const nozzle_id = Number(nozzleLike?.nozzle_id ?? nozzleLike?.id);
    if (!Number.isFinite(nozzle_id)) return;

    const nozzle_number = parseNum(nozzleLike?.nozzle_number ?? nozzleLike?.numero ?? nozzleLike?.number);
    const pump_number   = parseNum(
      pumpLike?.pump_number ??
      nozzleLike?.pump_number ??
      nozzleLike?.pump?.pump_number ??
      pumpLike?.number ??
      pumpLike?.code
    );

    const product_name =
      nozzleLike?.product?.name ??
      nozzleLike?.producto?.nombre ??
      nozzleLike?.fuel?.name ??
      pumpLike?.product?.name ??
      undefined;

    const unit_price = parseNum(
      nozzleLike?.product?.unit_price ??
      nozzleLike?.producto?.precio ??
      pumpLike?.product?.unit_price
    );

    const prev = idx.get(nozzle_id) || { nozzle_id };
    idx.set(nozzle_id, {
      nozzle_id,
      nozzle_number: nozzle_number ?? prev.nozzle_number,
      pump_number:   pump_number   ?? prev.pump_number,
      product_name:  product_name  ?? prev.product_name,
      unit_price:    unit_price    ?? prev.unit_price,
    });
  };

  async function fetchJson(url: string) {
    const res = await fetch(url, { headers, cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  try {
    const data = await fetchJson(`${API_BASE}/sales/pumps/products`);
    const arr = Array.isArray(data) ? data : data?.items;
    if (Array.isArray(arr)) {
      for (const pump of arr) {
        const pumpObj = pump?.pump || pump;
        const nozzles = pumpObj?.nozzles || pumpObj?.boquillas || pump?.nozzles || pump?.boquillas || [];
        for (const nz of nozzles) add(nz, pumpObj);
      }
    }
  } catch {}

  if (idx.size === 0) {
    try {
      const list = await fetchJson(`${API_BASE}/nozzles/active`);
      const arr = Array.isArray(list) ? list : list?.items || [];
      for (const n of arr) add(n, n?.pump);
    } catch {}
  }

  if (idx.size === 0) {
    try {
      const list = await fetchJson(`${API_BASE}/nozzles`);
      const arr = Array.isArray(list) ? list : list?.items || [];
      for (const n of arr) add(n, n?.pump);
    } catch {}
  }

  return idx;
}

async function hydrateClients(items: VentaAPI[]): Promise<Map<number, any>> {
  const need = new Set<number>();
  for (const v of items) {
    if (!v.client_name && v.client_id != null) need.add(Number(v.client_id));
  }
  const cache = new Map<number, any>();
  await Promise.all(
    Array.from(need).map(async (id) => {
      try {
        const c = await apiGET<any>(`/clients/${id}`);
        cache.set(id, c);
      } catch {}
    })
  );
  return cache;
}

async function hydrateVentas(items: VentaAPI[]): Promise<VentaAPI[]> {
  const out = [...items];
  const [nozzleIndex, clientMap] = await Promise.all([buildNozzleIndex(), hydrateClients(out)]);

  for (const v of out) {
    // Cliente
    if (!v.client_name) {
      if (v.client) v.client_name = resolveClientNameFromEntity(v.client);
      else if (v.client_id && clientMap.has(Number(v.client_id))) {
        v.client_name = resolveClientNameFromEntity(clientMap.get(Number(v.client_id)));
      } else {
        v.client_name = resolveClientName(v);
      }
    }

    // MONTO BRUTO PREFERENTE desde notes (igual que VentasContent)
    const grossFromNotes = parseGrossFromNotes(v.notes);
    if (grossFromNotes != null) v.__display_amount = grossFromNotes;

    // Surtidor / Producto / Qty con índice
    if (v.nozzle_id && nozzleIndex.has(Number(v.nozzle_id))) {
      const info = nozzleIndex.get(Number(v.nozzle_id))!;
      if (!v.pump_number   && info.pump_number   != null) v.pump_number   = info.pump_number;
      if (!v.nozzle_number && info.nozzle_number != null) v.nozzle_number = info.nozzle_number;
      if (!v.product_name  && info.product_name)           v.product_name  = info.product_name;

      const precio = Number(info.unit_price);
      if ((v.quantity == null || Number(v.quantity) === 0) && precio > 0) {
        const netAmount = pickNum(v.total_amount) ?? netFromGross(pickNum(v.final_amount));
        if (netAmount) v.quantity = Number((netAmount / precio).toFixed(2));
        if (!v.unit_price) v.unit_price = precio;
      }
    }

    if (!v.product_name) v.product_name = resolveProductName(v);
    if (v.quantity == null) v.quantity = Number(resolveGallons(v).toFixed(2));

    // Fallback final para __display_amount
    if (v.__display_amount == null) {
      v.__display_amount = resolveAmount(v);
    }
  }

  return out;
}

/* ======================
   5) COMPONENTE (UI)
   ====================== */
const PAGE_SIZE = 10;

const TurnosContent: React.FC = () => {
  const { cashControl, updateCashControl } = useTurnos();

  // Turno activo
  const [now, setNow] = useState(new Date());
  const turnoActivo = useMemo<ShiftName>(() => resolveShiftName(now), [now]);
  const { from, to } = useMemo(() => getShiftRange(turnoActivo, now), [turnoActivo, now]);
  const fromISO = useMemo(() => from.toISOString(), [from]);
  const toISO   = useMemo(() => to.toISOString(),   [to]);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id); }, []);

  // Empleado actual y lista
  const [empleadoActual, setEmpleadoActual] = useState<any>(null);
  const [empleados, setEmpleados] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) { setEmpleadoActual({ full_name: 'Operador', user_id: 1 }); return; }
        const decoded: any = jwtDecode(token);
        const userId = decoded.user_id || decoded.sub;
        if (userId) {
          const usuarios = await UserService.getUsersByRole('seller');
          const emp = usuarios.find((u: any) => u.user_id === userId);
          setEmpleadoActual(emp || { full_name: 'Operador', user_id: 1 });
        } else setEmpleadoActual({ full_name: 'Operador', user_id: 1 });
      } catch { setEmpleadoActual({ full_name: 'Operador', user_id: 1 }); }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          setEmpleados([{full_name:'Operador 1',user_id:1},{full_name:'Operador 2',user_id:2},{full_name:'Operador 3',user_id:3}]); return;
        }
        const usuarios = await UserService.getUsersByRole('seller');
        setEmpleados(usuarios.length ? usuarios : [{full_name:'Operador 1',user_id:1},{full_name:'Operador 2',user_id:2},{full_name:'Operador 3',user_id:3}]);
      } catch { setEmpleados([{full_name:'Operador 1',user_id:1},{full_name:'Operador 2',user_id:2},{full_name:'Operador 3',user_id:3}]); }
    })();
  }, []);

  // Ventas del turno
  const [ventas, setVentas] = useState<VentaAPI[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadVentas(n = page) {
    setLoading(true);
    try {
      const raw = await fetchVentas(300);

      const fms = Date.parse(fromISO), tms = Date.parse(toISO);
      const filtered = raw.filter(v => {
        const ts = Date.parse(resolveDateISO(v));
        return Number.isFinite(ts) && ts >= fms && ts < tms;
      });

      const hydrated = await hydrateVentas(filtered);

      const ordered = hydrated.sort((a,b) => Date.parse(resolveDateISO(b)) - Date.parse(resolveDateISO(a)));
      const total = ordered.length;
      const start = (n - 1) * PAGE_SIZE;
      const end   = start + PAGE_SIZE;

      setVentas(ordered.slice(start, end));
      setTotalRows(total);
      setPage(n);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadVentas(1); }, [fromISO, toISO]); // eslint-disable-line

  // Totales tarjetas
  const totales = useMemo(() => {
    const base: Record<Producto, { gal: number; sol: number }> = {
      Regular: { gal: 0, sol: 0 },
      Premium: { gal: 0, sol: 0 },
      Diesel:  { gal: 0, sol: 0 },
    };
    for (const v of ventas) {
      const name = resolveProductName(v);
      const bucket: Producto = name === 'Premium' ? 'Premium' : name === 'Diesel' ? 'Diesel' : 'Regular';
      const g = resolveGallons(v);
      const s = v.__display_amount ?? resolveAmount(v);
      base[bucket].gal += g;
      base[bucket].sol += s;
    }
    return base;
  }, [ventas]);

  const turnosUI: { name: ShiftName; emoji: string; desc: string }[] = [
    { name: 'Leon',  emoji: '☁️', desc: '05:00–12:00' },
    { name: 'Tarde', emoji: '✨', desc: '12:00–19:00' },
    { name: 'Buho',  emoji: '🌙', desc: '19:00–05:00' },
  ];
  const totalPaginas = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-900 p-4 space-y-6">
      {/* Header turno */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-white text-xl font-bold">TURNO ACTIVO:</span>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold">{turnoActivo}</span>
            <button onClick={() => loadVentas(page)} className="px-3 py-2 rounded bg-slate-700 text-white hover:bg-slate-600">
              {loading ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turnosUI.map(({ name, emoji, desc }) => {
            const isActive = name === turnoActivo;
            return (
              <div key={name} className={`rounded-2xl p-6 relative border transition-all ${isActive ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/30' : 'bg-gray-700 border-gray-600'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white text-xl font-bold">TURNO</div>
                    <div className="text-white text-lg">{name}</div>
                    <div className="text-slate-200/80 text-xs mt-1">{desc}</div>
                  </div>
                  <div className="text-4xl">{emoji}</div>
                </div>
                {isActive && <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ventas recientes — UI clonada */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">💲</span>
            <h2 className="text-white text-2xl font-bold">Ventas recientes</h2>
          </div>
          <button
            onClick={() => loadVentas(page)}
            className="px-3 py-1.5 rounded-md bg-slate-700 text-white text-sm hover:bg-slate-600 flex items-center gap-2"
          >
            <span className="text-white">↻</span> {loading ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {/* Encabezados */}
        <div className="grid grid-cols-4 md:grid-cols-5 text-xs uppercase tracking-wide text-slate-300/70 pb-2 border-b border-slate-700">
          <div>Cliente / Surtidor</div>
          <div className="hidden md:block">Producto</div>
          <div>Monto</div>
          <div className="hidden md:block">Fecha</div>
          <div>Estado</div>
        </div>

        {/* Filas */}
        <div className="divide-y divide-slate-700">
          {ventas.map((v) => {
            const cliente  = resolveClientName(v);
            const surtidor = formatPumpLabelStrict(v);
            const gal      = resolveGallons(v);
            const prodName = resolveProductName(v);
            const prodLine = `${prodName} · ${gal.toFixed(2)} gal`;
            const monto    = Number(v.__display_amount ?? resolveAmount(v));
            const fechaISO = resolveDateISO(v);
            const fecha    = fechaISO ? new Date(fechaISO).toLocaleString() : '—';
            const ok       = (v.status || '').toLowerCase().startsWith('complet');
            const pay      = v.paymentMethod?.method_name || v.payment_method || '—';

            return (
              <div key={v.sale_id} className="grid grid-cols-4 md:grid-cols-5 items-center py-4 text-white">
                {/* Cliente / Surtidor con avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm">
                    {getInitial(cliente)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{cliente}</div>
                    <div className="text-xs text-slate-400">{surtidor}</div>
                  </div>
                </div>

                {/* Producto */}
                <div className="hidden md:block">
                  <div className="truncate">{prodLine}</div>
                </div>

                {/* Monto bruto + sublínea */}
                <div>
                  <div className="text-emerald-400 font-semibold">S/ {monto.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">Sin descuento · Pago: {pay}</div>
                </div>

                {/* Fecha */}
                <div className="hidden md:block text-slate-300">{fecha}</div>

                {/* Estado */}
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${ok ? 'bg-green-700' : 'bg-slate-600'}`}>
                    {ok ? 'Completada' : (v.status ?? '—')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => page > 1 && loadVentas(page - 1)}
            className={`px-3 py-1 rounded ${page <= 1 ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            ◀ Anterior
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(n => (
            <button
              key={n}
              onClick={() => loadVentas(n)}
              className={`px-3 py-1 rounded ${n === page ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={page >= totalPaginas}
            onClick={() => page < totalPaginas && loadVentas(page + 1)}
            className={`px-3 py-1 rounded ${page >= totalPaginas ? 'bg-slate-800 text-slate-500' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
          >
            Siguiente ▶
          </button>
        </div>
      </div>

      {/* Información del turno y caja */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-white text-xl font-bold mb-4">Información del Turno</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
          <div><span className="text-gray-400">Inicio:</span>
            <div className="font-bold">
              {from.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' - '}
              {from.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
          <div><span className="text-gray-400">Fin estimado:</span>
            <div className="font-bold">
              {to.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' - '}
              {to.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>
          <div><span className="text-gray-400">Estado:</span>
            <div className="font-bold text-green-400">ACTIVO</div>
          </div>
        </div>
      </div>

      {/* Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Apertura */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold text-white text-center mb-3 lg:mb-4">🔓 APERTURA DE CAJA</h2>
          <div className="h-1 bg-green-500 mb-4 lg:mb-6"></div>
          <div className="space-y-3 lg:space-y-4">
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <label className="text-white font-bold text-sm lg:text-base mb-2 block">MONTO INICIAL</label>
              <input
                type="number"
                placeholder="0.00"
                value={cashControl.monto_inicial ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateCashControl({ monto_inicial: value });
                }}
                className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-green-400 focus:outline-none text-sm lg:text-base"
              />
            </div>
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <label className="text-white font-bold text-sm lg:text-base mb-2 block">RESPONSABLE</label>
              <select className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-green-400 focus:outline-none text-sm lg:text-base">
                {empleados.map((e) => (<option key={e.user_id}>{e.full_name}</option>))}
              </select>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 lg:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              🔓 ABRIR CAJA
            </button>
          </div>
        </div>

        {/* Estado */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold text-white text-center mb-3 lg:mb-4">📊 ESTADO ACTUAL</h2>
          <div className="h-1 bg-blue-500 mb-4 lg:mb-6"></div>
          <div className="space-y-3 lg:space-y-4">
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4 text-center">
              <span className="text-slate-300 text-xs lg:text-sm">CAJA ABIERTA</span>
              <div className="text-xl lg:text-2xl font-bold text-green-400">{cashControl.estado_caja ? '✅ ACTIVA' : '❌ DESACTIVA'}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4 text-center">
              <span className="text-slate-300 text-xs lg:text-sm">MONTO INICIAL</span>
              <div className="text-xl lg:text-2xl font-bold text-white">S/ {cashControl.monto_inicial_anterior ?? '0.00'}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4 text-center">
              <span className="text-slate-300 text-xs lg:text-sm">VENTAS ACTUALES</span>
              <div className="text-xl lg:text-2xl font-bold text-blue-400">S/ {cashControl.ventas_actuales ?? '0.00'}</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4 text-center">
              <span className="text-slate-300 text-xs lg:text-sm">TOTAL EN CAJA</span>
              <div className="text-2xl lg:text-3xl font-bold text-green-400">S/ {cashControl.total_en_caja ?? '0.00'}</div>
            </div>
          </div>
        </div>

        {/* Cierre */}
        <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 lg:col-span-2 xl:col-span-1">
          <h2 className="text-xl lg:text-2xl font-bold text-white text-center mb-3 lg:mb-4">🔒 CIERRE DE CAJA</h2>
          <div className="h-1 bg-red-500 mb-4 lg:mb-6"></div>
          <div className="space-y-3 lg:space-y-4">
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <label className="text-white font-bold text-sm lg:text-base mb-2 block">MONTO FÍSICO</label>
              <input
                type="number"
                placeholder="0.00"
                value={cashControl.monto_fisico ?? '0.00'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateCashControl({ monto_fisico: value });
                }}
                className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-red-400 focus:outline-none text-sm lg:text-base"
              />
            </div>
            <div className="bg-slate-700 rounded-lg p-3 lg:p-4">
              <label className="text-white font-bold text-sm lg:text-base mb-2 block">OBSERVACIONES</label>
              <textarea
                rows={5}
                placeholder="Notas del cierre..."
                value={cashControl.observaciones ?? ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  updateCashControl({ observaciones: e.target.value });
                }}
                className="w-full bg-slate-600 text-white p-2 lg:p-3 rounded-lg border-2 border-slate-500 focus:border-red-400 focus:outline-none resize-none text-sm lg:text-base"
              ></textarea>
            </div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 lg:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm lg:text-base">
              🔒 CERRAR CAJA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnosContent;
