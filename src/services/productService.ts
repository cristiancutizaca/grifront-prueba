import apiService from './apiService';
import { Product } from "../../app/grifo-inventario/types/productos";

export interface CreateProductDto extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: number;
}

class ProductService {
  private endpoint = '/products';

  async getAllProducts(): Promise<Product[]> {
    return apiService.get<Product[]>(this.endpoint);
  }

  async getProductById(id: number): Promise<Product> {
    return apiService.get<Product>(`${this.endpoint}/${id}`);
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    return apiService.post<Product>(this.endpoint, product);
  }

  async updateProduct(product: UpdateProductDto): Promise<Product> {
    return apiService.patch<Product>(`${this.endpoint}/${product.id}`, product);
  }

  async deleteProduct(id: number): Promise<void> {
    console.log("Llamando a DELETE con ID:", id);
    return apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}

export default new ProductService();
