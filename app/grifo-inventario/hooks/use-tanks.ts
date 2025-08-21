import { useState, useEffect } from "react";
import TanksService from "../../../src/services/tanksService";
import { Tanks } from "../types/tanques";

export function useTanques() {
  const [tanks, setTanks] = useState<Tanks[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [editingTank, setEditingTank] = useState<Tanks | null>(null);

  const [form, setForm] = useState<Partial<Tanks>>({
    tank_name: "",
    product_id: 0,
    total_capacity: "",
    location: "",
    description: "",
  });

  const handleOpenModal = (tank?: Tanks) => {
    if (tank) {
      setEditingTank(tank);
      setForm(tank);
    } else {
      setEditingTank(null);
      setForm({
        tank_name: "",
        product_id: 0,
        total_capacity: "",
        location: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTank(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    if (name === "product_id") {
      const numValue = Number(value);
      if (isNaN(numValue) || !Number.isInteger(numValue)) {
        setError("product_id debe ser un número entero válido");
        return;
      }
      processedValue = numValue.toString();
    } else if (type === "number") {
      processedValue = value;
    } else if (name === "total_capacity") {
      const decimalValue = parseFloat(value);
      if (isNaN(decimalValue) || !/^\d*\.?\d+$/.test(value)) {
        setError("total_capacity debe ser un número decimal válido");
        return;
      }
      processedValue = value;
    }

    setError(null);
    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Cargar tanques desde la API cuando el hook se monta
  useEffect(() => {
    const fetchTanks = async () => {
      try {
        setLoading(true);
        const data = await TanksService.getAllTanks();
        setTanks(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los tanques");
      } finally {
        setLoading(false);
      }
    };
    fetchTanks();
  }, []);

  /* Guarda el tanque: crea uno nuevo o actualiza uno existente. */
  const handleSave = async () => {
    if (!form.tank_name || !form.total_capacity) {
      setError("El nombre y la capacidad son obligatorios");
      return;
    }

    const payload = {
      ...form,
      product_id: Number(form.product_id),
      total_capacity: form.total_capacity,
    };

    try {
      setLoading(true);
      if (editingTank) {
        // Actualizar tanque existente
        const updatedTank = await TanksService.updateTank(
          editingTank.tank_id,
          payload
        );
        setTanks((prev) =>
          prev.map((t) =>
            t.tank_id === updatedTank.tank_id ? updatedTank : t
          )
        );
      } else {
        // Crear nuevo tanque
        const newTank = await TanksService.createTank(payload);
        const formattedTank = {
          ...newTank,
          total_capacity: parseFloat(newTank.total_capacity).toFixed(3),
        };
        setTanks((prev) => [...prev, formattedTank]);
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Error al guardar el tanque");
    } finally {
      setLoading(false);
    }
  };

  /* Elimina un tanque por su ID. */
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este tanque?")) {
      try {
        setLoading(true);
        await TanksService.deleteTank(id);
        setTanks((prev) => prev.filter((t) => t.tank_id !== id));
      } catch (err: any) {
        setError(err.message || "Error al eliminar el tanque");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    tanks,
    form,
    showModal,
    editingTank,
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