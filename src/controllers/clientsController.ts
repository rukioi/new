import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().min(1, 'Phone is required'),
  organization: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  budget: z.number().min(0).optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  status: z.string().default('active'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

export class ClientsController {
  async getClients(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Mock clients data
      const mockClients = [
        {
          id: 'client-1',
          name: 'Maria Silva Santos',
          email: 'maria@silva.com.br',
          phone: '(11) 99999-1234',
          organization: 'Silva & Associates',
          address: {
            street: 'Rua Augusta, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01305-000',
            country: 'Brasil',
          },
          budget: 15000,
          currency: 'BRL',
          status: 'active',
          tags: ['Direito Civil', 'Premium'],
          notes: 'Cliente premium',
          created_by: req.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      res.json({
        clients: mockClients,
        pagination: {
          page: 1,
          limit: 50,
          total: mockClients.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({
        error: 'Failed to fetch clients',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      // Mock client data
      const mockClient = {
        id,
        name: 'Maria Silva Santos',
        email: 'maria@silva.com.br',
        phone: '(11) 99999-1234',
        status: 'active',
      };

      res.json({
        client: mockClient,
        related: {
          projects: [],
          tasks: [],
        },
      });
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({
        error: 'Failed to fetch client',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = createClientSchema.parse(req.body);

      const mockClient = {
        id: 'client-' + Date.now(),
        ...validatedData,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      res.status(201).json({
        message: 'Client created successfully',
        client: mockClient,
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(400).json({
        error: 'Failed to create client',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const validatedData = updateClientSchema.parse(req.body);

      const mockClient = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      res.json({
        message: 'Client updated successfully',
        client: mockClient,
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(400).json({
        error: 'Failed to update client',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteClient(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      res.json({
        message: 'Client deleted successfully',
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        error: 'Failed to delete client',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const clientsController = new ClientsController();