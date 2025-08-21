'use client';

import React from 'react';
import { useReportConnection } from '../hooks/useReports';

interface ReportsConnectionStatusProps {
    className?: string;
}


export default function ReportsConnectionStatus({ className = '' }: ReportsConnectionStatusProps) {
    const { isConnected, checking, checkConnection, config } = useReportConnection();

    const getStatusColor = () => {
        if (checking) return 'bg-yellow-500';
        if (isConnected === null) return 'bg-gray-500';
        return isConnected ? 'bg-green-500' : 'bg-red-500';
    };

    const getStatusText = () => {
        if (checking) return 'Verificando conexión...';
        if (isConnected === null) return 'Estado desconocido';
        return isConnected ? 'Conectado al backend' : 'Sin conexión al backend';
    };

    const getStatusIcon = () => {
        if (checking) {
            return (
                <svg className="animate-spin h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            );
        }

        if (isConnected === null) {
            return (
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }

        return isConnected ? (
            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ) : (
            <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        );
    };

    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg border ${className}`}>
            {/* Indicador de estado */}
            <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-300">
                    {getStatusText()}
                </span>
            </div>

            {/* Información de configuración */}
            <div className="flex-1 text-xs text-gray-400">
                <div>Modo: {config.mode}</div>
                <div>URL: {config.baseURL}</div>
            </div>

            {/* Botón de reconexión */}
            {!isConnected && !checking && (
                <button
                    onClick={checkConnection}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                    Reintentar
                </button>
            )}
        </div>
    );
}

// Componente compacto para mostrar solo el estado
export function ReportsConnectionIndicator({ className = '' }: ReportsConnectionStatusProps) {
    const { isConnected, checking } = useReportConnection();

    const getStatusColor = () => {
        if (checking) return 'bg-yellow-500';
        if (isConnected === null) return 'bg-gray-500';
        return isConnected ? 'bg-green-500' : 'bg-red-500';
    };

    const getTooltipText = () => {
        if (checking) return 'Verificando conexión con el backend...';
        if (isConnected === null) return 'Estado de conexión desconocido';
        return isConnected ? 'Conectado al backend de reportes' : 'Sin conexión al backend de reportes';
    };

    return (
        <div className={`relative group ${className}`} title={getTooltipText()}>
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${checking ? 'animate-pulse' : ''}`}></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {getTooltipText()}
            </div>
        </div>
    );
}

