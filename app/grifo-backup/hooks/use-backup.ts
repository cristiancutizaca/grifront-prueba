import { useState } from 'react';
import { initialBackupHistory, initialBackupConfig } from '../data/initial-data';
import { BackupConfig, BackupHistory } from '../types/backup-config';

export function useBackup() {
    const [backupconfig, setBackupConfig] = useState<BackupConfig>(initialBackupConfig);

    const [historialBackup, setBackupHistory] = useState<BackupHistory[]>(initialBackupHistory);

    const [error, setError] = useState<string | null>(null);

    // Manejar cambios de datos de la interfaz de configuración del backup
    const handleTipoBackupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateBackupConfig({
            ...backupconfig,
            tipo_backup_seleccionado: e.target.value
        });
    };

    // Actualizar configuración de backup
    const updateBackupConfig = (updatedBackupConfig: Partial<BackupConfig>) => {
        try {
            setBackupConfig((prev) => ({
                ...prev,
                ...updatedBackupConfig,
                updated_at: new Date().toISOString(),
            }));
            setError(null);
        } catch (err) {
            setError('Error al actualizar la configuración de backup');
        }
    };
    const handleOptionChange = (optionType: string) => {
        const updatedOptions = backupconfig.opciones.map(option => 
            option.type === optionType 
                ? { ...option, is_active: !option.is_active } 
                : option
        );
        
        updateBackupConfig({
            ...backupconfig,
            opciones: updatedOptions
        });
    };
    // Calcular el próximo backup según la frecuencia
    const calcularProximoBackup = (): string => {
        const ahora = new Date();
        const [horas, minutos] = backupconfig.hora.split(':').map(Number);
        
        let proximaFecha = new Date(ahora);
        proximaFecha.setHours(horas, minutos, 0, 0);

        // Si la hora ya pasó hoy, programar para mañana
        if (proximaFecha <= ahora) {
            proximaFecha.setDate(proximaFecha.getDate() + 1);
        }

        const frecuencia = backupconfig.frecuencia_seleccionada;
        
        switch (frecuencia) {
            case 'Diario':
                break;
                
            case 'Semanal':
                const diaSemana = backupconfig.dia_especifico;
                if (diaSemana) {
                    const diasSemana = {
                        'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
                        'Viernes': 5, 'Sábado': 6, 'Domingo': 0
                    };
                    const diaObjetivo = diasSemana[diaSemana as keyof typeof diasSemana];
                    
                    if (diaObjetivo !== undefined) {
                        const diaActual = proximaFecha.getDay();
                        let diasParaSumar = diaObjetivo - diaActual;
                        
                        // Si el día ya pasó esta semana, ir a la próxima semana
                        if (diasParaSumar <= 0) {
                            diasParaSumar += 7;
                        }
                        
                        proximaFecha.setDate(proximaFecha.getDate() + diasParaSumar);
                    }
                }
                break;
                
            case 'Mensual':
                const diaMes = backupconfig.dia_especifico;
                if (diaMes) {
                    const diaObjetivo = parseInt(diaMes);
                    const diaActual = proximaFecha.getDate();
                    
                    // Si el día ya pasó este mes, ir al próximo mes
                    if (diaObjetivo <= diaActual) {
                        proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                    }
                    
                    // Establecer el día del mes
                    proximaFecha.setDate(diaObjetivo);
                }
                break;
                
            case 'Anual':
                const diaAnual = backupconfig.dia_especifico;
                const mesAnual = backupconfig.mes;
                
                if (diaAnual && mesAnual) {
                    const meses = {
                        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3,
                        'Mayo': 4, 'Junio': 5, 'Julio': 6, 'Agosto': 7,
                        'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
                    };
                    
                    const mesObjetivo = meses[mesAnual as keyof typeof meses];
                    const diaObjetivo = parseInt(diaAnual);
                    
                    if (mesObjetivo !== undefined) {
                        // Establecer el mes y día objetivo
                        proximaFecha.setMonth(mesObjetivo);
                        proximaFecha.setDate(diaObjetivo);
                        
                        // Si la fecha ya pasó este año, ir al próximo año
                        if (proximaFecha <= ahora) {
                            proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);
                        }
                    }
                }
                break;
                
            case 'Desactivado':
                return 'Backup desactivado';
                
            default:
                break;
        }

        return proximaFecha.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) + ' - ' + proximaFecha.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return {
        backupconfig,
        updateBackupConfig,
        handleTipoBackupChange,
        handleOptionChange,
        calcularProximoBackup,
        
        historialBackup,
    }
}
