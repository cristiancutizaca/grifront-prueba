import { useState, useEffect } from "react";
import { Surtidores } from "../types/surtidores";
import PumpService from "../../../src/services/pumpService";
import { SurtidoresTanques } from "../types/surtidores-tanques";
import PumpsTanksService from "../../../src/services/pumpsTanksService";

export function useSurtidores() {
  const [surtidores, setSurtidores] = useState<Surtidores[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [editingSurtidor, setEditingSurtidor] = useState<Surtidores | null>(null);

  const [form, setForm] = useState<Partial<Surtidores>>({
    pump_id: 0,
    pump_number: "",
    pump_name: "",
    location_description: "",
    created_at: "",
    updated_at: "",
  });

  // Cargar surtidores desde la API cuando el hook se monta
  useEffect(() => {
    const fetchSurtidores = async () => {
      try {
        setLoading(true);
        const data = await PumpService.getAllPumps();
        setSurtidores(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los surtidores");
      } finally {
        setLoading(false);
      }
    };
    fetchSurtidores();
  }, []);

  /* Abre el modal: permite agregar un nuevo surtidor o editar uno existente. */
  const handleOpenModal = (
    surtidor?: Surtidores,
    setSelectedTanks?: (ids: number[]) => void,
    getTankIdsByPumpId?: (pumpId: number, relaciones: SurtidoresTanques[]) => number[],
    relaciones?: SurtidoresTanques[]
  ) => {
    if (surtidor) {
      setEditingSurtidor(surtidor);
      setForm(surtidor);

      if (setSelectedTanks && getTankIdsByPumpId && relaciones) {
        const tankIds = getTankIdsByPumpId(surtidor.pump_id, relaciones);
        setSelectedTanks(tankIds);
      }
    } else {
      setEditingSurtidor(null);
      setForm({
        pump_id: 0,
        pump_number: "",
        pump_name: "",
        location_description: "",
        created_at: "",
        updated_at: "",
      });

      if (setSelectedTanks) {
        setSelectedTanks([]);
      }
    }

    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSurtidor(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* Guarda el surtidor: crea uno nuevo o actualiza uno existente. */
  const handleSave = async (
    selectedTanks?: number[],
    assignTanksToPump?: (pumpId: number, tankIds: number[]) => Promise<void>,
    refreshRelations?: () => Promise<void>
  ) => {
    if (!form.pump_name || !form.pump_number) {
      setError("El nombre y número son obligatorios");
      return;
    }

    const payload = {
      ...form,
      pump_id: undefined,
      created_at: undefined,
      updated_at: undefined,
      location_description: form.location_description?.trim() || null,
    };

    try {
      setLoading(true);
      let pumpId: number;

      if (editingSurtidor) {
        // Actualizar datos del surtidor
        const updatedSurtidor = await PumpService.updatePump(
          editingSurtidor.pump_id,
          payload
        );
        pumpId = updatedSurtidor.pump_id;

        // Actualizar las relaciones de tanques
        if (selectedTanks && selectedTanks.length > 0) {
          await PumpsTanksService.replaceTanksForPump(pumpId, selectedTanks);
        }

        setSurtidores((prev) =>
          prev.map((s) =>
            s.pump_id === updatedSurtidor.pump_id ? updatedSurtidor : s
          )
        );
      } else {
        // Agregar un nuevo surtidor
        const newSurtidor = await PumpService.createPump(payload);
        pumpId = newSurtidor.pump_id;

        setSurtidores((prev) => [...prev, newSurtidor]);

        if (assignTanksToPump && selectedTanks && selectedTanks.length > 0) {
          await assignTanksToPump(pumpId, selectedTanks);
        }
      }

      // Recargar las relaciones después de guardar
      if (refreshRelations) {
        await refreshRelations();
      }

      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Error al guardar el surtidor");
    } finally {
      setLoading(false);
    }
  };

  /* Elimina un surtidor por su ID. */
  const handleDelete = async (pump_id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este surtidor?")) {
      try {
        setLoading(true);
        await PumpService.deletePump(pump_id);
        setSurtidores((prev) => prev.filter((s) => s.pump_id !== pump_id));
      } catch (err: any) {
        setError(err.message || "Error al eliminar el surtidor");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    surtidores,
    form,
    showModal,
    editingSurtidor,
    loading,
    error,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    setForm,
  };
}