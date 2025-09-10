import { Request, Response } from 'express';
import { z } from 'zod';
import { database } from '../config/database';

// Validation schemas
const createKeySchema = z.object({
  tenantId: z.string().optional(),
  accountType: z.enum(['SIMPLES', 'COMPOSTA', 'GERENCIAL']),
  usesAllowed: z.number().min(1).default(1),
  expiresAt: z.string().optional(),
  singleUse: z.boolean().default(true),
  metadata: z.any().optional(),
});

const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  planType: z.string().default('basic'),
  maxUsers: z.number().min(1).default(5),
  maxStorage: z.number().min(1).default(1073741824), // 1GB
});

export class AdminController {
  // Registration Keys Management
  async createRegistrationKey(req: Request, res: Response) {
    try {
      const validatedData = createKeySchema.parse(req.body);
      
      const createdBy = (req as any).user?.id || 'admin';

      // Generate a simple key for development
      const key = `REG-${validatedData.accountType}-${Date.now()}`;

      res.status(201).json({
        message: 'Registration key created successfully',
        key, // Return the plain key only once
        metadata: {
          id: 'key-' + Date.now(),
          accountType: validatedData.accountType,
          usesAllowed: validatedData.usesAllowed,
          singleUse: validatedData.singleUse,
          expiresAt: validatedData.expiresAt,
        },
      });
    } catch (error) {
      console.error('Create registration key error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create registration key',
      });
    }
  }

  async getRegistrationKeys(req: Request, res: Response) {
    try {
      const tenantId = req.query.tenantId as string;
      
      // Mock keys for development
      const mockKeys = [
        {
          id: 'key-1',
          accountType: 'GERENCIAL',
          usesAllowed: 1,
          usesLeft: 1,
          singleUse: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          revoked: false,
          createdAt: new Date().toISOString(),
          tenant: null,
          usageCount: 0,
        }
      ];

      res.json({ keys: mockKeys });
    } catch (error) {
      console.error('Get registration keys error:', error);
      res.status(500).json({
        error: 'Failed to fetch registration keys',
      });
    }
  }

  async revokeRegistrationKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      res.json({
        message: 'Registration key revoked successfully',
      });
    } catch (error) {
      console.error('Revoke registration key error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to revoke registration key',
      });
    }
  }

  // Tenant Management
  async getTenants(req: Request, res: Response) {
    try {
      // Mock tenants for development
      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Law Firm Demo',
          schemaName: 'tenant_demo',
          planType: 'premium',
          isActive: true,
          maxUsers: 10,
          userCount: 3,
          createdAt: new Date().toISOString(),
          stats: {
            clients: 25,
            projects: 8,
            tasks: 42,
            transactions: 15,
            invoices: 12,
          },
        }
      ];

      res.json({ tenants: mockTenants });
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({
        error: 'Failed to fetch tenants',
      });
    }
  }

  async createTenant(req: Request, res: Response) {
    try {
      const validatedData = createTenantSchema.parse(req.body);
      
      const mockTenant = {
        id: 'tenant-' + Date.now(),
        name: validatedData.name,
        schemaName: `tenant_${Date.now()}`,
        planType: validatedData.planType,
        isActive: true,
        maxUsers: validatedData.maxUsers,
        userCount: 0,
        createdAt: new Date().toISOString(),
        stats: {
          clients: 0,
          projects: 0,
          tasks: 0,
          transactions: 0,
          invoices: 0,
        },
      };

      res.status(201).json({
        message: 'Tenant created successfully',
        tenant: mockTenant,
      });
    } catch (error) {
      console.error('Create tenant error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to create tenant',
      });
    }
  }

  async deleteTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;

      res.json({
        message: 'Tenant deleted successfully',
      });
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete tenant',
      });
    }
  }

  async updateTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      res.json({
        message: 'Tenant updated successfully',
        tenant: { id, ...updateData },
      });
    } catch (error) {
      console.error('Update tenant error:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update tenant',
      });
    }
  }

  async toggleTenantStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      res.json({
        message: 'Tenant status updated successfully',
        tenant: { id, isActive },
      });
    } catch (error) {
      console.error('Toggle tenant status error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to toggle tenant status',
      });
    }
  }

  // Global Metrics
  async getGlobalMetrics(req: Request, res: Response) {
    try {
      // Mock metrics for development
      const mockMetrics = {
        tenants: {
          total: 5,
          active: 4,
        },
        users: {
          total: 47,
        },
        registrationKeys: [
          { accountType: 'SIMPLES', count: 3 },
          { accountType: 'COMPOSTA', count: 2 },
          { accountType: 'GERENCIAL', count: 1 },
        ],
        recentActivity: [
          {
            id: '1',
            level: 'info',
            message: 'System started successfully',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      res.json(mockMetrics);
    } catch (error) {
      console.error('Get global metrics error:', error);
      res.status(500).json({
        error: 'Failed to fetch global metrics',
      });
    }
  }
}

export const adminController = new AdminController();