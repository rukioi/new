import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

// Validation schemas
const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  actorId: z.string().uuid().optional(),
  type: z.enum(['task', 'invoice', 'system', 'client', 'project']),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  message: z.string().min(1, 'Message is required'),
  payload: z.any().optional(),
  link: z.string().optional(),
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
});

export class NotificationsController {
  async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Mock notifications for development
      const mockNotifications = [
        {
          id: 'notif-1',
          userId: req.user.id,
          type: 'client',
          title: 'Novo cliente adicionado',
          message: 'Maria Silva Santos foi adicionada ao CRM',
          payload: { clientId: 'client-1', createdBy: 'Dr. Silva' },
          link: '/crm',
          read: false,
          isActive: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 'notif-2',
          userId: req.user.id,
          type: 'invoice',
          title: 'Fatura vencendo em 3 dias',
          message: 'Fatura INV-001 vence em 3 dias',
          payload: { invoiceId: 'inv-1', amount: 2500 },
          link: '/cobranca',
          read: false,
          isActive: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: 'notif-3',
          userId: req.user.id,
          type: 'task',
          title: 'Nova tarefa atribuída',
          message: 'Revisar contrato foi atribuída a você',
          payload: { taskId: 'task-1', assignedBy: 'Dr. Silva' },
          link: '/tarefas',
          read: true,
          isActive: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      ];

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';
      const type = req.query.type as string;

      let filteredNotifications = mockNotifications;

      if (unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.read);
      }

      if (type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === type);
      }

      const total = filteredNotifications.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

      res.json({
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Mock unread count
      const unreadCount = 2;

      res.json({ unreadCount });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        error: 'Failed to get unread count',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createNotification(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = createNotificationSchema.parse(req.body);

      const mockNotification = {
        id: 'notif-' + Date.now(),
        ...validatedData,
        actorId: validatedData.actorId || req.user.id,
        read: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        message: 'Notification created successfully',
        notification: mockNotification,
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(400).json({
        error: 'Failed to create notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const validatedData = markAsReadSchema.parse(req.body);

      if (validatedData.markAll) {
        res.json({ message: 'All notifications marked as read' });
      } else if (id) {
        res.json({ message: 'Notification marked as read' });
      } else if (validatedData.notificationIds) {
        res.json({ message: 'Notifications marked as read' });
      } else {
        res.status(400).json({ error: 'No notification ID or markAll flag provided' });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(400).json({
        error: 'Failed to mark notification as read',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(400).json({
        error: 'Failed to delete notification',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const notificationsController = new NotificationsController();