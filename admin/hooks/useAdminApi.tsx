
import { useState } from 'react';

export interface GlobalMetrics {
  tenants: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  registrationKeys: Array<{
    accountType: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    level: string;
    message: string;
    tenantName?: string;
    createdAt: string;
  }>;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  planType: string;
  planExpiresAt?: string;
  userCount: number;
  maxUsers: number;
  isActive: boolean;
  stats: {
    clients: number;
    projects: number;
    tasks: number;
  };
  createdAt: string;
  lastActivity: string;
}

export interface RegistrationKey {
  id: string;
  key: string;
  accountType: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export function useAdminApi() {
  const [isLoading, setIsLoading] = useState(false);

  const getGlobalMetrics = async (): Promise<GlobalMetrics> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMetrics: GlobalMetrics = {
      tenants: {
        total: 15,
        active: 12,
      },
      users: {
        total: 247,
      },
      registrationKeys: [
        { accountType: 'basic', count: 5 },
        { accountType: 'premium', count: 3 },
        { accountType: 'enterprise', count: 2 },
      ],
      recentActivity: [
        {
          id: '1',
          level: 'info',
          message: 'New tenant registered successfully',
          tenantName: 'Law Firm ABC',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        },
        {
          id: '2',
          level: 'warn',
          message: 'High CPU usage detected',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          level: 'error',
          message: 'Failed login attempt detected',
          tenantName: 'Legal Solutions XYZ',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        },
        {
          id: '4',
          level: 'info',
          message: 'System backup completed successfully',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
        },
      ],
    };
    
    setIsLoading(false);
    return mockMetrics;
  };

  const getTenants = async (): Promise<Tenant[]> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTenants: Tenant[] = [
      {
        id: '1',
        name: 'Law Firm ABC',
        domain: 'lawfirmabc.legalsaas.com',
        status: 'active',
        planType: 'premium',
        planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        userCount: 25,
        maxUsers: 50,
        isActive: true,
        stats: {
          clients: 45,
          projects: 12,
          tasks: 89,
        },
        createdAt: '2024-01-15T10:00:00Z',
        lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '2',
        name: 'Legal Solutions XYZ',
        domain: 'legalsolutions.legalsaas.com',
        status: 'active',
        planType: 'enterprise',
        planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
        userCount: 45,
        maxUsers: 100,
        isActive: true,
        stats: {
          clients: 78,
          projects: 23,
          tasks: 156,
        },
        createdAt: '2024-02-01T14:30:00Z',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '3',
        name: 'Small Practice Law',
        domain: 'smallpractice.legalsaas.com',
        status: 'inactive',
        planType: 'basic',
        planExpiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        userCount: 5,
        maxUsers: 10,
        isActive: false,
        stats: {
          clients: 8,
          projects: 2,
          tasks: 15,
        },
        createdAt: '2024-01-20T09:15:00Z',
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ];
    
    setIsLoading(false);
    return mockTenants;
  };

  const getRegistrationKeys = async (): Promise<RegistrationKey[]> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockKeys: RegistrationKey[] = [
      {
        id: '1',
        key: 'REG-BASIC-2024-001',
        accountType: 'basic',
        maxUses: 10,
        currentUses: 3,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        createdAt: '2024-01-01T00:00:00Z',
        isActive: true,
      },
      {
        id: '2',
        key: 'REG-PREMIUM-2024-001',
        accountType: 'premium',
        maxUses: 5,
        currentUses: 1,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        createdAt: '2024-01-15T12:00:00Z',
        isActive: true,
      },
      {
        id: '3',
        key: 'REG-ENTERPRISE-2024-001',
        accountType: 'enterprise',
        maxUses: 3,
        currentUses: 0,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
        createdAt: '2024-02-01T08:30:00Z',
        isActive: true,
      },
    ];
    
    setIsLoading(false);
    return mockKeys;
  };

  const createTenant = async (tenantData: Partial<Tenant>): Promise<Tenant> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTenant: Tenant = {
      id: Date.now().toString(),
      name: tenantData.name || 'New Tenant',
      domain: tenantData.domain || 'newtenant.legalsaas.com',
      status: 'active',
      planType: tenantData.planType || 'basic',
      planExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      userCount: 0,
      maxUsers: 10,
      isActive: true,
      stats: {
        clients: 0,
        projects: 0,
        tasks: 0,
      },
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    setIsLoading(false);
    return newTenant;
  };

  const createRegistrationKey = async (keyData: Partial<RegistrationKey>): Promise<RegistrationKey> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`,
        },
        body: JSON.stringify({
          accountType: keyData.accountType,
          usesAllowed: keyData.maxUses || 1,
          singleUse: true,
          expiresAt: keyData.expiresAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create registration key');
      }

      const result = await response.json();
      
      const newKey: RegistrationKey = {
        id: result.metadata.id || Date.now().toString(),
        key: result.key,
        accountType: result.metadata.accountType,
        maxUses: result.metadata.usesAllowed,
        currentUses: 0,
        expiresAt: result.metadata.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      setIsLoading(false);
      return newKey;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const deleteTenant = async (tenantId: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getGlobalMetrics,
    getTenants,
    getRegistrationKeys,
    createTenant,
    createRegistrationKey,
    deleteTenant,
  };
}
