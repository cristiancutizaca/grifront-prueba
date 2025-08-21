import { useEffect, useState } from "react";
import { SurtidoresTanques } from "../types/surtidores-tanques";
import PumpsTanksService from "../../../src/services/PumpsTanksService";

export function useSurtidoresTanques() {
    const [surtidoresTanques, setSurtidoresTanques] = useState<SurtidoresTanques[]>([]);

    const [selectedTanks, setSelectedTanks] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSurtidoresTanques();
    }, []);

    // Cargar surtidores tanques desde la API cuando el hook se monta
    const fetchSurtidoresTanques = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await PumpsTanksService.getAllPumpTanks();
            setSurtidoresTanques(data);
        } catch (err: any) {
            setError(err.message || "Error al cargar los surtidores y tanques");
        } finally {
            setLoading(false);
        }
    };

    const toggleTankSelection = (tankId: number) => {
        setSelectedTanks(prev =>
            prev.includes(tankId)
                ? prev.filter(id => id !== tankId)
                : [...prev, tankId]
        );
    };

    const assignTanksToPump = async (pumpId: number, tankIds: number[]) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            await PumpsTanksService.assignTanksToPump(pumpId, tankIds);
            setSuccess(true);
            // Recargar las relaciones después de asignar
            await fetchSurtidoresTanques();
        } catch (err: any) {
            setError(err.message || "Error al asignar tanques");
        } finally {
            setLoading(false);
        }
    };

    function getTankNamesByPumpId(
        pumpId: number,
        surtidoresTanques: SurtidoresTanques[],
        ): string[] {
            const relaciones = surtidoresTanques.filter(
                (rel) => rel.pump.pump_id === pumpId
            );
            return relaciones.map(rel => rel.tank.tank_name);
    }

    function getTankIdsByPumpId(
        pumpId: number,
        relaciones: SurtidoresTanques[]
        ): number[] {
            return relaciones
                .filter(rel => rel.pump.pump_id === pumpId)
                .map(rel => rel.tank.tank_id);
    }

    return {
        surtidoresTanques,
        selectedTanks,
        setSelectedTanks,
        toggleTankSelection,
        getTankNamesByPumpId,
        getTankIdsByPumpId,
        assignTanksToPump,
        fetchSurtidoresTanques,
    };
}