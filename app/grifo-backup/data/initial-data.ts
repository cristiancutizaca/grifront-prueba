import { BackupConfig, BackupHistory } from "../types/backup-config";

export const initialBackupConfig: BackupConfig = {
    tipo_backup_seleccionado: 'Backup Completo',
    frecuencia_seleccionada: 'Diario',
    hora: '12:00:00',
    tipo_backup: ['Backup Completo', 'Solo Ventas', 'Solo Configuración', 'Solo Usuarios'],
    frecuencia: ['Diario', 'Semanal', 'Mensual', 'Anual', 'Desactivado'],
    opciones: [
        { is_active: true, type: 'Notificar por email' },
        { is_active: false, type: 'Mantener 30 días' },
        { is_active: true, type: 'Backup en la nube' }
    ],
};

export const initialBackupHistory: BackupHistory[] = [
    {
        id: 1,
        date_time: "2022-01-01T01:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 2,
        date_time: "2022-01-02T02:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 3,
        date_time: "2022-01-03T03:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 4,
        date_time: "2022-01-04T06:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 5,
        date_time: "2022-01-05T08:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 6,
        date_time: "2022-01-06T03:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 7,
        date_time: "2022-01-07T12:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 8,
        date_time: "2022-01-08T14:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 9,
        date_time: "2022-01-09T23:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 10,
        date_time: "2022-01-10T14:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 11,
        date_time: "2022-01-11T09:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 12,
        date_time: "2022-01-12T08:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 13,
        date_time: "2022-01-13T18:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 14,
        date_time: "2022-01-14T16:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 15,
        date_time: "2022-01-15T05:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 16,
        date_time: "2022-01-16T02:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 17,
        date_time: "2022-01-17T09:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 18,
        date_time: "2022-01-18T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 19,
        date_time: "2022-01-19T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 20,
        date_time: "2022-01-20T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 21,
        date_time: "2022-01-21T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 22,
        date_time: "2022-01-22T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 23,
        date_time: "2022-01-23T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 24,
        date_time: "2022-01-24T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 25,
        date_time: "2022-01-25T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 26,
        date_time: "2022-01-26T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 27,
        date_time: "2022-01-27T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 28,
        date_time: "2022-01-28T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 29,
        date_time: "2022-01-29T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 30,
        date_time: "2022-01-30T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 31,
        date_time: "2022-01-31T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 32,
        date_time: "2022-02-01T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 33,
        date_time: "2022-02-02T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 34,
        date_time: "2022-02-03T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 35,
        date_time: "2022-02-04T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 36,
        date_time: "2022-02-05T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 37,
        date_time: "2022-02-06T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 38,
        date_time: "2022-02-07T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 39,
        date_time: "2022-02-08T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 40,
        date_time: "2022-02-09T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 41,
        date_time: "2022-02-10T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 42,
        date_time: "2022-02-11T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 43,
        date_time: "2022-02-12T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 44,
        date_time: "2022-02-13T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 45,
        date_time: "2022-02-14T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 46,
        date_time: "2022-02-15T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 47,
        date_time: "2022-02-16T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 48,
        date_time: "2022-02-17T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 49,
        date_time: "2022-02-18T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 50,
        date_time: "2022-02-19T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 51,
        date_time: "2022-02-20T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 52,
        date_time: "2022-02-21T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 53,
        date_time: "2022-02-22T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 54,
        date_time: "2022-02-23T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 55,
        date_time: "2022-02-24T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 56,
        date_time: "2022-02-25T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 57,
        date_time: "2022-02-26T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 58,
        date_time: "2022-02-27T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 59,
        date_time: "2022-02-28T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 60,
        date_time: "2022-03-01T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 61,
        date_time: "2022-03-02T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 62,
        date_time: "2022-03-03T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 63,
        date_time: "2022-03-04T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 64,
        date_time: "2022-03-05T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 65,
        date_time: "2022-03-06T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 66,
        date_time: "2022-03-07T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 67,
        date_time: "2022-03-08T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 68,
        date_time: "2022-03-09T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 69,
        date_time: "2022-03-10T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 70,
        date_time: "2022-03-11T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 71,
        date_time: "2022-03-12T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 72,
        date_time: "2022-03-13T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 73,
        date_time: "2022-03-14T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 74,
        date_time: "2022-03-15T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 75,
        date_time: "2022-03-16T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 76,
        date_time: "2022-03-17T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 77,
        date_time: "2022-03-18T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 78,
        date_time: "2022-03-19T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 79,
        date_time: "2022-03-20T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 80,
        date_time: "2022-03-21T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 81,
        date_time: "2022-03-22T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 82,
        date_time: "2022-03-23T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 83,
        date_time: "2022-03-24T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 84,
        date_time: "2022-03-25T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 85,
        date_time: "2022-03-26T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 86,
        date_time: "2022-03-27T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 87,
        date_time: "2022-03-28T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 88,
        date_time: "2022-03-29T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 89,
        date_time: "2022-03-30T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 90,
        date_time: "2022-03-31T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 91,
        date_time: "2022-04-01T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 92,
        date_time: "2022-04-02T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 93,
        date_time: "2022-04-03T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 94,
        date_time: "2022-04-04T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 95,
        date_time: "2022-04-05T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 96,
        date_time: "2022-04-06T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 97,
        date_time: "2022-04-07T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 98,
        date_time: "2022-04-08T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 99,
        date_time: "2022-04-09T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 100,
        date_time: "2022-04-10T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 101,
        date_time: "2022-04-11T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 102,
        date_time: "2022-04-12T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 103,
        date_time: "2022-04-13T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 104,
        date_time: "2022-04-14T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 105,
        date_time: "2022-04-15T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 106,
        date_time: "2022-04-16T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 107,
        date_time: "2022-04-17T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 108,
        date_time: "2022-04-18T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 109,
        date_time: "2022-04-19T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 110,
        date_time: "2022-04-20T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 111,
        date_time: "2022-04-21T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 112,
        date_time: "2022-04-22T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 113,
        date_time: "2022-04-23T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 114,
        date_time: "2022-04-24T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 115,
        date_time: "2022-04-25T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 116,
        date_time: "2022-04-26T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 117,
        date_time: "2022-04-27T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 118,
        date_time: "2022-04-28T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 119,
        date_time: "2022-04-29T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 120,
        date_time: "2022-04-30T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 121,
        date_time: "2022-05-01T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 122,
        date_time: "2022-05-02T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 123,
        date_time: "2022-05-03T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 124,
        date_time: "2022-05-04T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 125,
        date_time: "2022-05-05T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 126,
        date_time: "2022-05-06T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 127,
        date_time: "2022-05-07T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 128,
        date_time: "2022-05-08T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 129,
        date_time: "2022-05-09T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 130,
        date_time: "2022-05-10T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 131,
        date_time: "2022-05-11T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 132,
        date_time: "2022-05-12T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 133,
        date_time: "2022-05-13T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 134,
        date_time: "2022-05-14T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 135,
        date_time: "2022-05-15T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 136,
        date_time: "2022-05-16T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 137,
        date_time: "2022-05-17T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 138,
        date_time: "2022-05-18T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 139,
        date_time: "2022-05-19T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 140,
        date_time: "2022-05-20T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 141,
        date_time: "2022-05-21T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 142,
        date_time: "2022-05-22T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 143,
        date_time: "2022-05-23T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 144,
        date_time: "2022-05-24T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 145,
        date_time: "2022-05-25T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 146,
        date_time: "2022-05-26T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 147,
        date_time: "2022-05-27T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 148,
        date_time: "2022-05-28T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 149,
        date_time: "2022-05-29T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 150,
        date_time: "2022-05-30T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 151,
        date_time: "2022-05-31T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 152,
        date_time: "2022-06-01T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 153,
        date_time: "2022-06-02T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 154,
        date_time: "2022-06-03T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 155,
        date_time: "2022-06-04T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 156,
        date_time: "2022-06-05T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 157,
        date_time: "2022-06-06T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 158,
        date_time: "2022-06-07T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 159,
        date_time: "2022-06-08T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 160,
        date_time: "2022-06-09T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 161,
        date_time: "2022-06-10T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 162,
        date_time: "2022-06-11T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 163,
        date_time: "2022-06-12T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 164,
        date_time: "2022-06-13T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 165,
        date_time: "2022-06-14T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 166,
        date_time: "2022-06-15T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 167,
        date_time: "2022-06-16T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 168,
        date_time: "2022-06-17T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 169,
        date_time: "2022-06-18T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 170,
        date_time: "2022-06-19T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 171,
        date_time: "2022-06-20T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 172,
        date_time: "2022-06-21T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 173,
        date_time: "2022-06-22T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 174,
        date_time: "2022-06-23T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 175,
        date_time: "2022-06-24T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 176,
        date_time: "2022-06-25T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 177,
        date_time: "2022-06-26T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 178,
        date_time: "2022-06-27T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 179,
        date_time: "2022-06-28T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 180,
        date_time: "2022-06-29T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 181,
        date_time: "2022-06-30T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 182,
        date_time: "2022-07-01T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 183,
        date_time: "2022-07-02T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 184,
        date_time: "2022-07-03T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 185,
        date_time: "2022-07-04T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 186,
        date_time: "2022-07-05T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 187,
        date_time: "2022-07-06T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 188,
        date_time: "2022-07-07T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 189,
        date_time: "2022-07-08T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 190,
        date_time: "2022-07-09T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 191,
        date_time: "2022-07-10T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 192,
        date_time: "2022-07-11T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 193,
        date_time: "2022-07-12T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 194,
        date_time: "2022-07-13T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 195,
        date_time: "2022-07-14T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 196,
        date_time: "2022-07-15T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    },
    {
        id: 197,
        date_time: "2022-07-16T00:00:00Z",
        type: "Completo",
        status: "✅ Exitoso"
    },
    {
        id: 198,
        date_time: "2022-07-17T00:00:00Z",
        type: "Automático",
        status: "✅ Exitoso"
    },
    {
        id: 199,
        date_time: "2022-07-18T00:00:00Z",
        type: "Completo",
        status: "❌ Fallido"
    },
    {
        id: 200,
        date_time: "2022-07-19T00:00:00Z",
        type: "Automático",
        status: "❌ Fallido"
    }
];
