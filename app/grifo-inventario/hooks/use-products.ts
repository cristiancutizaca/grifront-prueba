import { useState, useEffect } from "react";
import { Product } from "../types/productos";
import { categories, fuelTypes, units } from "../data/initial-data";
import productService from "../../../src/services/productService";

export function useProducts() {
  // Estado para la lista de productos
  const [products, setProducts] = useState<Product[]>([]);

  // Estado para el indicador de carga
  const [loading, setLoading] = useState(true);

  // Estado para errores
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar si el modal de producto está abierto
  const [showModal, setShowModal] = useState(false);

  // Producto que se está editando
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estado del formulario del producto para crear o editar
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: categories[categories.length - 1],
    fuel_type:
      fuelTypes[fuelTypes.length - 1] === "Ninguno"
        ? ""
        : fuelTypes[fuelTypes.length - 1],
    unit: units[units.length - 1],
    unit_price: 0,
    is_active: true,
  });

  /**
   * Abre el modal para crear o editar un producto.
   * Si se pasa un producto, se llena el formulario con sus datos.
   */
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setForm(product);
    } else {
      setEditingProduct(null);
      setForm({
        name: "",
        description: "",
        category: categories[categories.length - 1],
        fuel_type:
          fuelTypes[fuelTypes.length - 1] === "Ninguno"
            ? ""
            : fuelTypes[fuelTypes.length - 1],
        unit: units[units.length - 1],
        unit_price: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  /* Cierra el modal y limpia el estado de edición. */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  /* Maneja los cambios en los inputs del formulario. */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Cargar productos desde la API cuando el hook se monta
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* Guarda el producto: crea uno nuevo o actualiza uno existente. */
  const handleSave = async () => {
    if (!form.name || !form.unit_price) return;

    try {
      if (editingProduct) {
        // Actualizar producto existente
        const updated = await productService.updateProduct({
          ...form,
          id: editingProduct.product_id,
        });
        setProducts((prev) =>
          prev.map((p) => (p.product_id === updated.product_id ? updated : p))
        );
      } else {
        // Crear nuevo producto
        const payload = {
          ...form,
          unit_price: Number(form.unit_price),
          fuel_type: form.category !== "Combustible" ? "otro" : form.fuel_type
        };
        const created = await productService.createProduct(payload as any);
        setProducts((prev) => [...prev, created]);
      }
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Error al guardar el producto");
    }
  };

  /* Elimina un producto por su ID. */
  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este producto?")) {
      try {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.product_id !== id));
      } catch (err: any) {
        setError(err.message || "Error al eliminar el producto");
      }
    }
  };

  return {
    products,
    form,
    showModal,
    editingProduct,
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
