import ApiService from "./apiService";
import { discount } from "../../app/grifo-configuracion/types/discounts";

class DiscountService {
    private api = ApiService;
    private basePoint = "/discounts";

    async getDiscounts(): Promise<discount[]> {
        return await this.api.get<discount[]>(this.basePoint);
    }

    async updateDiscount(id: number, data: Partial<discount>): Promise<discount> {
        return await this.api.patch<discount>(`${this.basePoint}/${id}`, data);
    }

    async deleteDiscount(id: number): Promise<void> {
        await this.api.delete(`${this.basePoint}/${id}`);
    }
}

export default new DiscountService();
