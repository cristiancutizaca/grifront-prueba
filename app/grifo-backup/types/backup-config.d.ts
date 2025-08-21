export interface BackupOption {
    is_active: boolean;
    type: string;
}

export interface BackupConfig {
    tipo_backup_seleccionado?: string;
    frecuencia_seleccionada?: string;
    hora: string;
    dia_especifico?: string;
    mes?: string;
    tipo_backup: string[];
    frecuencia: string[];
    opciones: BackupOption[];
}

export interface BackupHistory {
    id: number;
    date_time: string;
    type: string;
    status: '✅ Exitoso' | '❌ Fallido';
}
