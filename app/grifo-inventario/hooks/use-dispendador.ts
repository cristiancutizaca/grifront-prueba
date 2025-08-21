import { useState, useEffect } from "react";
import { useSurtidores } from "./use-surtidores";
import { useTanques } from "./use-tanks";
import { useProducts } from "./use-products";
import { useSurtidoresTanques } from "./use-surtidores-tanks";
import { Dispensador } from "../types/dispensadores";
import NozzleService from "../../../src/services/nozzleService";
import { Tanks } from "../types/tanques";
import { Product } from "../types/productos";

export function useDispensador() {
  const [dispensadores, setDispensadores] = useState<Dispensador[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [editingDispensador, setEditingDispensador] = useState<Dispensador | null>(null);

  const [filteredTanks, setFilteredTanks] = useState<Tanks[]>([]);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [form, setForm] = useState<Partial<Dispensador>>({
    nozzle_number: 0,
    pump_id: 0,
    tank_id: 0,
    product_id: 0,
  });

  const { surtidores } = useSurtidores();
  const { tanks } = useTanques();
  const { products } = useProducts();
  const { surtidoresTanques, getTankIdsByPumpId } = useSurtidoresTanques();

  const handleOpenModal = (dispensador?: Dispensador) => {
    if (dispensador) {
      setEditingDispensador(dispensador);
      setForm(dispensador);
    } else {
      setEditingDispensador(null);
      setForm({
        nozzle_number: 0,
        pump_id: surtidores[0]?.pump_id || 1,
        tank_id: tanks[0]?.tank_id || 1,
        product_id: products[0]?.product_id || 1,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDispensador(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.endsWith("_id") || name === "nozzle_number"
      ? Number(value)
      : value,
  }));
  };

  // Cargar dispensadores desde la API cuando el hook se monta
  useEffect(() => {
    const fetchDispensadores = async () => {
      try {
        setLoading(true);
        const data = await NozzleService.getAllNozzles();
        setDispensadores(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los dispensadores");
      } finally {
        setLoading(false);
      }
    };
    fetchDispensadores();
  }, []);

  useEffect(() => {
    if (!form.pump_id) return;

    const tankIds = getTankIdsByPumpId(form.pump_id, surtidoresTanques);
    const tanksForPump = tanks.filter((t) => tankIds.includes(t.tank_id));
    setFilteredTanks(tanksForPump);

    const productIds = tanksForPump.map((t) => t.product_id);
    const productsForPump = products.filter((p) => productIds.includes(p.product_id));
    setFilteredProducts(productsForPump);

    if (!tankIds.includes(form.tank_id || 0)) {
      setForm((prev) => ({ ...prev, tank_id: tanksForPump[0]?.tank_id || 0 }));
    }
    if (!productIds.includes(form.product_id || 0)) {
      setForm((prev) => ({ ...prev, product_id: productsForPump[0]?.product_id || 0 }));
    }
  }, [form.pump_id, surtidoresTanques, tanks, products]);

  useEffect(() => {
    if (!form.tank_id) {
      setSelectedProduct(null);
      return;
    }
    const tank = tanks.find(t => t.tank_id === form.tank_id);
    if (tank) {
      const product = products.find(p => p.product_id === tank.product_id) || null;
      setSelectedProduct(product);
      setForm(prev => ({ ...prev, product_id: product?.product_id || 0 }));
    }
  }, [form.tank_id, tanks, products]);

  /* Guarda el dispensador: crea uno nuevo o actualiza uno existente. */
  const handleSave = async () => {
    if (!form.nozzle_number || !form.pump_id || !form.tank_id || !form.product_id) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const payload = {
      pump_id: form.pump_id!,
      product_id: form.product_id!,
      tank_id: form.tank_id!,
      nozzle_number: form.nozzle_number!,
    };

    try {
      setLoading(true);
      if (editingDispensador) {
        // Actualizar dispensador existente
        const updatedDispensador = await NozzleService.updateNozzle(editingDispensador.nozzle_id, {
          ...payload,
          nozzle_id: editingDispensador.nozzle_id,
        });
        setDispensadores((prev) =>
          prev.map((d) =>
            d.nozzle_id === editingDispensador.nozzle_id ? updatedDispensador : d
          )
        );
        setEditingDispensador(null);
      } else {
        // Crear nuevo dispensador
        const newDispensador = await NozzleService.createNozzle(payload);
        setDispensadores((prev) => [...prev, newDispensador]);
      }
    handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Error al guardar el dispensador");
    } finally {
      setLoading(false);
    }
  };

  /* Elimina un dispensador por su ID. */
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este dispensador?")) {
      try {
        setLoading(true);
        await NozzleService.deleteNozzle(id);
        setDispensadores((prev) => prev.filter((d) => d.nozzle_id !== id));
      } catch (err: any) {
        setError(err.message || "Error al eliminar el dispensador");
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    dispensadores,
    showModal,
    editingDispensador,
    loading,
    form,
    handleOpenModal,
    handleCloseModal,
    handleChange,
    handleSave,
    handleDelete,
    filteredTanks,
    filteredProducts,
    selectedProduct,
  };
}
