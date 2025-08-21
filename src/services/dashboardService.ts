import apiService from './apiService';

export interface DashboardStats {
  ventas_hoy: {
    total_ventas: number;
    total_ingresos: number;
    total_litros: number;
  };
  ventas_mes: {
    total_ventas: number;
    total_ingresos: number;
    total_litros: number;
  };
  clientes: {
    total_clientes: number;
    clientes_activos: number;
    nuevos_clientes_mes: number;
  };
  inventario: {
    productos_stock_bajo: number;
    tanques_nivel_bajo: number;
    valor_inventario: number;
  };
  creditos: {
    creditos_activos: number;
    credito_total_otorgado: number;
    credito_total_usado: number;
    pagos_vencidos: number;
  };
  bombas: {
    bombas_activas: number;
    bombas_mantenimiento: number;
    bombas_fuera_servicio: number;
  };
}

export interface SalesChart {
  labels: string[];
  ventas: number[];
  ingresos: number[];
}

export interface ProductSales {
  producto_id: number;
  nombre_producto: string;
  cantidad_vendida: number;
  ingresos: number;
  porcentaje_ventas: number;
}

export interface RecentActivity {
  id: number;
  tipo: 'venta' | 'pago' | 'inventario' | 'alerta';
  descripcion: string;
  monto?: number;
  fecha: string;
  usuario?: string;
}

export interface TankStatus {
  tanque_id: number;
  numero_tanque: string;
  producto: string;
  nivel_actual: number;
  capacidad_total: number;
  porcentaje_llenado: number;
  estado: 'normal' | 'bajo' | 'critico';
}

export interface PumpStatus {
  bomba_id: number;
  numero_bomba: string;
  estado: 'activa' | 'mantenimiento' | 'fuera_servicio';
  ventas_hoy: number;
  ultimo_mantenimiento?: string;
}

export interface AlertSummary {
  total_alertas: number;
  alertas_criticas: number;
  alertas_inventario: number;
  alertas_credito: number;
  alertas_mantenimiento: number;
}

class DashboardService {
  private endpoint = '/dashboard';

  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>(`${this.endpoint}/estadisticas`);
  }

  async getSalesChart(periodo: 'dia' | 'semana' | 'mes' = 'semana'): Promise<SalesChart> {
    return apiService.get<SalesChart>(`${this.endpoint}/ventas-chart?periodo=${periodo}`);
  }

  async getTopProducts(limit: number = 5): Promise<ProductSales[]> {
    return apiService.get<ProductSales[]>(`${this.endpoint}/productos-top?limit=${limit}`);
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    return apiService.get<RecentActivity[]>(`${this.endpoint}/actividad-reciente?limit=${limit}`);
  }

  async getTankStatus(): Promise<TankStatus[]> {
    return apiService.get<TankStatus[]>(`${this.endpoint}/estado-tanques`);
  }

  async getPumpStatus(): Promise<PumpStatus[]> {
    return apiService.get<PumpStatus[]>(`${this.endpoint}/estado-bombas`);
  }

  async getAlertSummary(): Promise<AlertSummary> {
    return apiService.get<AlertSummary>(`${this.endpoint}/resumen-alertas`);
  }

  async getDailySalesComparison(): Promise<{
    hoy: number;
    ayer: number;
    variacion_porcentual: number;
  }> {
    return apiService.get<any>(`${this.endpoint}/comparacion-ventas-diarias`);
  }

  async getMonthlySalesComparison(): Promise<{
    mes_actual: number;
    mes_anterior: number;
    variacion_porcentual: number;
  }> {
    return apiService.get<any>(`${this.endpoint}/comparacion-ventas-mensuales`);
  }

  async getEmployeePerformance(): Promise<Array<{
    empleado_id: number;
    nombre_empleado: string;
    ventas_hoy: number;
    ventas_mes: number;
    ingresos_generados: number;
  }>> {
    return apiService.get<any>(`${this.endpoint}/rendimiento-empleados`);
  }

  async getShiftSummary(): Promise<{
    turno_actual: {
      inicio: string;
      empleado: string;
      ventas: number;
      ingresos: number;
    };
    turnos_anteriores: Array<{
      fecha: string;
      empleado: string;
      ventas: number;
      ingresos: number;
      duracion: string;
    }>;
  }> {
    return apiService.get<any>(`${this.endpoint}/resumen-turnos`);
  }

  async getWeatherInfo(): Promise<{
    temperatura: number;
    condicion: string;
    humedad: number;
    viento: number;
  }> {
    return apiService.get<any>(`${this.endpoint}/clima`);
  }

  async getSystemHealth(): Promise<{
    estado_general: 'bueno' | 'advertencia' | 'critico';
    base_datos: 'conectada' | 'desconectada';
    bombas_conectadas: number;
    sensores_activos: number;
    ultimo_backup: string;
  }> {
    return apiService.get<any>(`${this.endpoint}/salud-sistema`);
  }
}

export default new DashboardService();

