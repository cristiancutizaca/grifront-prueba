'use client';
import { useEffect, useState } from 'react';
import { Settings } from '../types/settings';
import { paymentMethod } from '../types/payment-methods';
import { discount } from '../types/discounts';
import settingsService from '../../../src/services/settingsService';
import paymentMethodService from '../../..//src/services/paymentMethodService';
import DiscountService from '../../..//src/services/discountService';

export function useConfiguration() {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [activeTab, setActiveTab] = useState<string>('datos');

    const [configuration, setConfiguration] = useState<Settings | null>(null);

    const [discounts, setDiscounts] = useState<discount[]>([]);

    const [paymentMethods, setPaymentMethods] = useState<paymentMethod[]>([]);

    const [error, setError] = useState<string | null>(null);

    // Cargar configuración desde la API
    useEffect(() => {
        const loadConfiguration = async () => {
            setIsLoading(true);
            try {
                const data = await settingsService.getSettings();
                setConfiguration(data);
            } catch (err: any) {
                setError(err.message || "Error al cargar la configuración");
            } finally {
                setIsLoading(false);
            }
        };

        loadConfiguration();
    }, []);

    // Cargar métodos de pago desde la API
    useEffect(() => {
        const loadPaymentMethods = async () => {
            try {
                const methods = await paymentMethodService.getAll();
                setPaymentMethods(methods);
            } catch (err: any) {
                console.error("Error al cargar métodos de pago:", err.message);
                setError(err.message || "Error al cargar los métodos de pago");
            }
        };

        loadPaymentMethods();
    }, []);

    // Cargar descuentos desde la API
    useEffect(() => {
        const loadDiscounts = async () => {
            try {
                const data = await DiscountService.getDiscounts();
                setDiscounts(data);
            } catch (err: any) {
                console.error("Error al cargar descuentos:", err.message);
                setError(err.message || "Error al cargar los descuentos");
            }
        };

        loadDiscounts();
    }, []);

    // Manejar cambios de datos de la interfaz de configuración
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateConfiguration({ ...configuration, currency: e.target.value });
    };

    // Actualizar configuración
    const updateConfiguration = (updatedConfig: Partial<Settings>) => {
        try {
            setConfiguration((prev) => {
            if (!prev) return prev;

            return {
                ...prev,
                ...updatedConfig,
                updated_at: new Date().toISOString(),
            };

            });
            setError(null);
        } catch (err) {
            setError("Error al actualizar la configuración");
        }
    };

    // Actualizar descuentos
    const updateDiscount = async (id: number, data: Partial<discount>) => {
        try {
            setDiscounts((prev) =>
                prev.map((d) => (d.id === id ? { ...d, ...data } : d))
            );
            setError(null);
        } catch (err) {
            console.error("Error actualizando descuento:", err);
            setError("No se pudo actualizar el descuento");
        }
    };

    // Eliminar descuento
    const deleteDiscount = async (id: number) => {
        try {
            await DiscountService.deleteDiscount(id);
            setDiscounts((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error("Error eliminando descuento:", err);
            setError("No se pudo eliminar el descuento");
        }
    };

    // Métodos de Pago
    const updatePaymentMethods =  async (method: string, checked: boolean) => {
        try {
            const currentMethods = configuration?.payment_methods
                ? configuration.payment_methods.split(', ')
                : [];

            let updatedMethods: string[];
            if (checked) {
                updatedMethods = [...new Set([...currentMethods, method])];
            } else {
                updatedMethods = currentMethods.filter((m) => m !== method);
            }
            updateConfiguration({ payment_methods: updatedMethods.join(', ') });
            setError(null);
        } catch (err) {
            setError('Error al actualizar los métodos de pago');
        }
    };

    const activePaymentMethods = configuration?.payment_methods
        ? configuration.payment_methods.split(', ')
        : [];

    const handleSave = async () => {
        try {
            if (!configuration) {
                setError("No hay configuración cargada");
                return;
            }
    
            setIsLoading(true);
            setError(null);

            const { setting_id, created_at, updated_at, ...payload } = configuration;

            //console.log("Enviando configuración al backend:", payload);
    
            await settingsService.updateSettings(payload);
    
            // Luego actualizamos los métodos de pago
            const currentActive = configuration.payment_methods
                ? configuration.payment_methods.split(', ')
                : [];

            const updatePromises = paymentMethods.map((method) => {
                const shouldBeActive = currentActive.includes(method.method_name);
                if (method.is_active !== shouldBeActive) {
                    return paymentMethodService.update(
                        String(method.payment_method_id),
                        { is_active: shouldBeActive }
                    );
                }
                return null;
            });

            await Promise.all(updatePromises.filter(Boolean));

            // Actualizamos los descuentos en la base de datos
            const discountUpdatePromises = discounts.map((d) =>
                DiscountService.updateDiscount(d.id, {
                    name: d.name,
                    percentage: d.percentage,
                    active: d.active,
                })
            );

            await Promise.all(discountUpdatePromises);
        } catch (err: any) {
            console.error("Error al guardar configuración ❌", err);
            setError("No se pudo guardar la configuración");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleCurrencyChange,
        activeTab,
        setActiveTab,
        
        configuration,
        updateConfiguration,
        
        discounts,
        updateDiscount,
        deleteDiscount,
        
        paymentMethods,
        updatePaymentMethods,
        activePaymentMethods,
        
        error,
        handleSave,
        setError,
    };
}