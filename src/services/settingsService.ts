import ApiService from "./apiService";
import { Settings, UpdateSettings } from "../../app/grifo-configuracion/types/settings";

class SettingsService {
    private api = ApiService;
    private basePoint = "/settings";

    async getSettings(): Promise<Settings> {
        return await this.api.get<Settings>(`${this.basePoint}`);
    }

    async updateSettings(settings: UpdateSettings): Promise<void> {
        await this.api.put<Settings>(`${this.basePoint}`, settings);
    }
}

export default new SettingsService();
