import { database, TenantDatabase } from '../config/database';

export class TenantService {
  async createTenant(name: string): Promise<string> {
    const tenantData = {
      name,
      schema_name: `tenant_${Date.now()}`,
      is_active: true,
      plan_type: 'basic',
      max_users: 5,
      max_storage: 1073741824, // 1GB
    };

    const tenant = await database.createTenant(tenantData);
    return tenant.id;
  }

  async getTenantDatabase(tenantId: string): Promise<TenantDatabase> {
    return new TenantDatabase(tenantId);
  }

  async getAllTenants() {
    return await database.getAllTenants();
  }

  async updateTenant(id: string, updateData: any) {
    return await database.updateTenant(id, updateData);
  }

  async deleteTenant(id: string) {
    return await database.deleteTenant(id);
  }

  async getTenantStats(tenantId: string) {
    // Mock stats for now
    return {
      clients: 0,
      projects: 0,
      tasks: 0,
      transactions: 0,
      invoices: 0,
    };
  }
}

export const tenantService = new TenantService();