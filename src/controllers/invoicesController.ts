import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const createInvoiceSchema = z.object({
  number: z.string().min(1, 'Invoice number is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  status: z.enum(['draft', 'sent', 'viewed', 'approved', 'rejected', 'pending', 'paid', 'overdue', 'cancelled']).default('draft'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    amount: z.number(),
    tax: z.number().optional(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

export class InvoicesController {
  async getInvoices(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Only COMPOSTA and GERENCIAL can access billing data
      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Billing data not available for this account type',
        });
      }

      // Mock invoices data
      const mockInvoices = [
        {
          id: 'inv-1',
          number: 'INV-001',
          title: 'Fatura de Serviços Jurídicos',
          description: 'Serviços prestados em Janeiro 2024',
          client_id: 'client-1',
          client_name: 'Maria Silva Santos',
          client_email: 'maria@silva.com.br',
          client_phone: '(11) 99999-1234',
          amount: 2750,
          currency: 'BRL',
          status: 'pending',
          due_date: '2024-02-20T00:00:00Z',
          items: [
            {
              id: '1',
              description: 'Consulta jurídica especializada',
              quantity: 2,
              rate: 500,
              amount: 1000,
              tax: 0,
            }
          ],
          tags: ['Fatura', 'Serviços Jurídicos'],
          created_by: req.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      res.json({
        invoices: mockInvoices,
        pagination: {
          page: 1,
          limit: 50,
          total: mockInvoices.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({
        error: 'Failed to fetch invoices',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Billing data not available for this account type',
        });
      }

      const { id } = req.params;

      const mockInvoice = {
        id,
        number: 'INV-001',
        title: 'Fatura de Serviços',
        amount: 2750,
        status: 'pending',
      };

      res.json({ invoice: mockInvoice });
    } catch (error) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        error: 'Failed to fetch invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Billing operations not available for this account type',
        });
      }

      const validatedData = createInvoiceSchema.parse(req.body);

      const mockInvoice = {
        id: 'inv-' + Date.now(),
        ...validatedData,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      res.status(201).json({
        message: 'Invoice created successfully',
        invoice: mockInvoice,
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      res.status(400).json({
        error: 'Failed to create invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Billing operations not available for this account type',
        });
      }

      const { id } = req.params;
      const validatedData = updateInvoiceSchema.parse(req.body);

      const mockInvoice = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      res.json({
        message: 'Invoice updated successfully',
        invoice: mockInvoice,
      });
    } catch (error) {
      console.error('Update invoice error:', error);
      res.status(400).json({
        error: 'Failed to update invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Billing operations not available for this account type',
        });
      }

      const { id } = req.params;

      res.json({
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      console.error('Delete invoice error:', error);
      res.status(500).json({
        error: 'Failed to delete invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getInvoiceStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.json({
          totalInvoices: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
        });
      }

      // Mock invoice stats
      const mockStats = {
        totalInvoices: 45,
        totalAmount: 125000,
        paidAmount: 98000,
        pendingAmount: 22000,
        overdueAmount: 5000,
        paidCount: 38,
        pendingCount: 6,
        overdueCount: 1,
      };

      res.json(mockStats);
    } catch (error) {
      console.error('Get invoice stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch invoice statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const invoicesController = new InvoicesController();