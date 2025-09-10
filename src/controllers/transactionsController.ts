import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0.01, 'Amount must be greater than zero'),
  categoryId: z.string().min(1, 'Category is required'),
  category: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.enum(['pix', 'credit_card', 'debit_card', 'bank_transfer', 'boleto', 'cash', 'check']).optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']).default('confirmed'),
  projectId: z.string().optional(),
  projectTitle: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

const updateTransactionSchema = createTransactionSchema.partial();

export class TransactionsController {
  async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Only COMPOSTA and GERENCIAL can access financial data
      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Financial data not available for this account type',
        });
      }

      // Mock transactions data
      const mockTransactions = [
        {
          id: 'trans-1',
          type: 'income',
          amount: 5500,
          category_id: 'honorarios',
          category: '⚖️ Honorários advocatícios',
          description: 'Honorários - Ação Previdenciária João Santos',
          date: '2024-01-15T00:00:00Z',
          payment_method: 'pix',
          status: 'confirmed',
          tags: ['Previdenciário', 'João Santos', 'INSS'],
          project_id: 'project-1',
          project_title: 'Ação Previdenciária - João Santos',
          client_id: 'client-1',
          client_name: 'João Santos',
          is_recurring: false,
          created_by: req.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Pagamento recebido via PIX',
        }
      ];

      res.json({
        transactions: mockTransactions,
        pagination: {
          page: 1,
          limit: 50,
          total: mockTransactions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Financial data not available for this account type',
        });
      }

      const { id } = req.params;

      const mockTransaction = {
        id,
        type: 'income',
        amount: 5500,
        description: 'Honorários advocatícios',
        status: 'confirmed',
      };

      res.json({ transaction: mockTransaction });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        error: 'Failed to fetch transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Financial operations not available for this account type',
        });
      }

      const validatedData = createTransactionSchema.parse(req.body);

      const mockTransaction = {
        id: 'trans-' + Date.now(),
        ...validatedData,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: mockTransaction,
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(400).json({
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Financial operations not available for this account type',
        });
      }

      const { id } = req.params;
      const validatedData = updateTransactionSchema.parse(req.body);

      const mockTransaction = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      res.json({
        message: 'Transaction updated successfully',
        transaction: mockTransaction,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(400).json({
        error: 'Failed to update transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.accountType === 'SIMPLES') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Financial operations not available for this account type',
        });
      }

      const { id } = req.params;

      res.json({
        message: 'Transaction deleted successfully',
      });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        error: 'Failed to delete transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const transactionsController = new TransactionsController();