import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pdsgfvjhtunnzvtlrihw.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkc2dmdmpodHVubnp2dGxyaWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NTkwMzIsImV4cCI6MjA3MzAzNTAzMn0.XJzgbqFnUzzLWJgaowHMwtLex2rrV5KZZKBP0PePhQU';

// Main Supabase client for all operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

// Database operations using Supabase
export class Database {
  private static instance: Database;

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async testConnection() {
    try {
      const { data, error } = await supabase.from('tenants').select('count').limit(1);
      if (error) {
        console.warn('Database connection test failed:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  // Admin operations
  async findAdminByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding admin by email:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in findAdminByEmail:', error);
      return null;
    }
  }

  async createAdminUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  async updateAdminLastLogin(id: string) {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating admin last login:', error);
      throw error;
    }
  }

  // User operations
  async findUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error finding user by email:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error in findUserByEmail:', error);
      return null;
    }
  }

  async createUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select(`
          *,
          tenant:tenants(*)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserLastLogin(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user last login:', error);
      throw error;
    }
  }

  // Tenant operations
  async getAllTenants() {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all tenants:', error);
      return [];
    }
  }

  async createTenant(tenantData: any) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, updateData: any) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string) {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      throw error;
    }
  }

  // Registration keys operations
  async getAllRegistrationKeys() {
    try {
      const { data, error } = await supabase
        .from('registration_keys')
        .select(`
          *,
          tenant:tenants(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting registration keys:', error);
      return [];
    }
  }

  async createRegistrationKey(keyData: any) {
    try {
      const { data, error } = await supabase
        .from('registration_keys')
        .insert(keyData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating registration key:', error);
      throw error;
    }
  }

  async revokeRegistrationKey(id: string) {
    try {
      const { error } = await supabase
        .from('registration_keys')
        .update({ revoked: true })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error revoking registration key:', error);
      throw error;
    }
  }

  async findValidRegistrationKeys() {
    try {
      const { data, error } = await supabase
        .from('registration_keys')
        .select('*')
        .eq('revoked', false)
        .gt('uses_left', 0)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding valid registration keys:', error);
      return [];
    }
  }

  async updateRegistrationKeyUsage(id: string, updateData: any) {
    try {
      const { error } = await supabase
        .from('registration_keys')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating registration key usage:', error);
      throw error;
    }
  }

  // Refresh tokens operations
  async createRefreshToken(tokenData: any) {
    try {
      const { data, error } = await supabase
        .from('refresh_tokens')
        .insert(tokenData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating refresh token:', error);
      throw error;
    }
  }

  async createAdminRefreshToken(tokenData: any) {
    try {
      const { data, error } = await supabase
        .from('admin_refresh_tokens')
        .insert(tokenData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating admin refresh token:', error);
      throw error;
    }
  }

  async findActiveRefreshTokens(userId: string) {
    try {
      const { data, error } = await supabase
        .from('refresh_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding active refresh tokens:', error);
      return [];
    }
  }

  async findActiveAdminRefreshTokens(adminId: string) {
    try {
      const { data, error } = await supabase
        .from('admin_refresh_tokens')
        .select('*')
        .eq('admin_id', adminId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error finding active admin refresh tokens:', error);
      return [];
    }
  }

  async deactivateRefreshToken(id: string) {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating refresh token:', error);
      throw error;
    }
  }

  async deactivateAdminRefreshToken(id: string) {
    try {
      const { error } = await supabase
        .from('admin_refresh_tokens')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating admin refresh token:', error);
      throw error;
    }
  }

  async deactivateAllUserTokens(userId: string) {
    try {
      const { error } = await supabase
        .from('refresh_tokens')
        .update({ is_active: false })
        .eq('user_id', userId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating all user tokens:', error);
      throw error;
    }
  }

  async deactivateAllAdminTokens(adminId: string) {
    try {
      const { error } = await supabase
        .from('admin_refresh_tokens')
        .update({ is_active: false })
        .eq('admin_id', adminId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating all admin tokens:', error);
      throw error;
    }
  }

  // API Config operations
  async getTenantApiConfigs() {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .select(`
          *,
          tenant:tenants(name, is_active)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting tenant API configs:', error);
      return [];
    }
  }

  async getTenantApiConfig(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .select(`
          *,
          tenant:tenants(name, is_active)
        `)
        .eq('tenant_id', tenantId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting tenant API config:', error);
      return null;
    }
  }

  async createTenantApiConfig(configData: any) {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .insert(configData)
        .select(`
          *,
          tenant:tenants(name, is_active)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating tenant API config:', error);
      throw error;
    }
  }

  async updateTenantApiConfig(tenantId: string, updateData: any) {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .update(updateData)
        .eq('tenant_id', tenantId)
        .select(`
          *,
          tenant:tenants(name, is_active)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tenant API config:', error);
      throw error;
    }
  }

  async deleteTenantApiConfig(tenantId: string) {
    try {
      const { error } = await supabase
        .from('tenant_settings')
        .delete()
        .eq('tenant_id', tenantId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tenant API config:', error);
      throw error;
    }
  }
}

export const database = Database.getInstance();

// Tenant-specific database operations
export class TenantDatabase {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  async query(sql: string, params: any[] = []) {
    // For now, return mock data since we're using Supabase
    console.log('Tenant query:', sql, params);
    return [];
  }

  async findMany(table: string, where: any = {}, options: any = {}) {
    console.log('Tenant findMany:', table, where, options);
    return [];
  }

  async findById(table: string, id: string) {
    console.log('Tenant findById:', table, id);
    return null;
  }

  async create(table: string, data: any) {
    console.log('Tenant create:', table, data);
    return { id: 'mock-id', ...data };
  }

  async update(table: string, id: string, data: any) {
    console.log('Tenant update:', table, id, data);
    return { id, ...data };
  }

  async delete(table: string, id: string) {
    console.log('Tenant delete:', table, id);
    return { id };
  }

  async count(table: string, where: any = {}) {
    console.log('Tenant count:', table, where);
    return 0;
  }

  async getDashboardMetrics(accountType: string) {
    if (accountType === 'SIMPLES') {
      return {
        revenue: 0,
        expenses: 0,
        balance: 0,
        clients: 0,
        projects: 0,
        tasks: 0,
      };
    }

    return {
      revenue: 45280,
      expenses: 12340,
      balance: 32940,
      clients: 127,
      projects: 23,
      tasks: 89,
    };
  }
}