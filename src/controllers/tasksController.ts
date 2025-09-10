import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  projectId: z.string().optional(),
  projectTitle: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  assignedTo: z.string().min(1, 'Assigned to is required'),
  status: z.enum(['not_started', 'in_progress', 'completed', 'on_hold', 'cancelled']).default('not_started'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  progress: z.number().min(0).max(100).default(0),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    completed: z.boolean(),
    createdAt: z.string(),
    completedAt: z.string().optional(),
  })).default([]),
});

const updateTaskSchema = createTaskSchema.partial();

export class TasksController {
  async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Mock tasks data
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Revisar contrato de prestação de serviços',
          description: 'Analisar cláusulas contratuais',
          start_date: '2024-01-20T00:00:00Z',
          end_date: '2024-01-25T00:00:00Z',
          status: 'in_progress',
          priority: 'high',
          assigned_to: 'Dr. Silva',
          project_id: 'project-1',
          project_title: 'Ação Previdenciária - João Santos',
          client_id: 'client-1',
          client_name: 'João Santos',
          tags: ['Contrato', 'Revisão', 'Urgente'],
          estimated_hours: 4,
          actual_hours: 2.5,
          progress: 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Cliente solicitou urgência',
          subtasks: [],
        }
      ];

      res.json({
        tasks: mockTasks,
        pagination: {
          page: 1,
          limit: 50,
          total: mockTasks.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        error: 'Failed to fetch tasks',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const mockTask = {
        id,
        title: 'Revisar contrato',
        status: 'in_progress',
        progress: 60,
      };

      res.json({ task: mockTask });
    } catch (error) {
      console.error('Get task error:', error);
      res.status(500).json({
        error: 'Failed to fetch task',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = createTaskSchema.parse(req.body);

      const mockTask = {
        id: 'task-' + Date.now(),
        ...validatedData,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      res.status(201).json({
        message: 'Task created successfully',
        task: mockTask,
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(400).json({
        error: 'Failed to create task',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const validatedData = updateTaskSchema.parse(req.body);

      const mockTask = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      res.json({
        message: 'Task updated successfully',
        task: mockTask,
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(400).json({
        error: 'Failed to update task',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      res.json({
        message: 'Task deleted successfully',
      });
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({
        error: 'Failed to delete task',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getTaskStats(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Mock task stats
      const mockStats = {
        total: 89,
        notStarted: 15,
        inProgress: 32,
        completed: 38,
        onHold: 3,
        cancelled: 1,
        overdue: 5,
        completionRate: 43,
        averageProgress: 67,
        averageCompletionTime: 8,
      };

      res.json(mockStats);
    } catch (error) {
      console.error('Get task stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch task statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const tasksController = new TasksController();