import { TenantDatabase } from '../config/database';
import { prisma } from '../config/database';

export interface CreateNotificationRequest {
  userId: string;
  actorId?: string;
  type: 'task' | 'invoice' | 'system' | 'client' | 'project';
  title: string;
  message: string;
  payload?: any;
  link?: string;
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  type: string;
  title: string;
  message: string;
  payload: any;
  link?: string;
  read: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationService {
  private tenantDb: TenantDatabase;

  constructor(tenantId: string) {
    this.tenantDb = new TenantDatabase(tenantId);
  }

  async create(request: CreateNotificationRequest): Promise<Notification> {
    try {
      const notification = await this.tenantDb.create('notifications', {
        user_id: request.userId,
        actor_id: request.actorId,
        type: request.type,
        title: request.title,
        message: request.message,
        payload: JSON.stringify(request.payload || {}),
        link: request.link,
        read: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Log audit trail
      await this.logAuditTrail(
        request.actorId || request.userId,
        'notifications',
        notification.id,
        'CREATE',
        null,
        notification
      );

      return this.mapToNotification(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async findByUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
      type?: string;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const { unreadOnly = false, limit = 50, offset = 0, type } = options;

      let whereConditions = ['user_id = $1', 'is_active = true'];
      const params = [userId];

      if (unreadOnly) {
        whereConditions.push('read = false');
      }

      if (type) {
        whereConditions.push(`type = $${params.length + 1}`);
        params.push(type);
      }

      const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

      // Get notifications
      const notifications = await this.tenantDb.query(`
        SELECT * FROM \${schema}.notifications 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `, params);

      // Get total count
      const totalResult = await this.tenantDb.query(`
        SELECT COUNT(*) as total
        FROM \${schema}.notifications 
        ${whereClause}
      `, params);

      const total = parseInt(totalResult[0]?.total || 0);

      return {
        notifications: notifications.map(this.mapToNotification),
        total,
      };
    } catch (error) {
      console.error('Error finding notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      const oldNotification = await this.tenantDb.findById('notifications', notificationId);
      
      if (!oldNotification || oldNotification.user_id !== userId) {
        throw new Error('Notification not found or access denied');
      }

      const updatedNotification = await this.tenantDb.update('notifications', notificationId, {
        read: true,
        updated_at: new Date(),
      });

      // Log audit trail
      await this.logAuditTrail(
        userId,
        'notifications',
        notificationId,
        'UPDATE',
        oldNotification,
        updatedNotification
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.tenantDb.query(`
        UPDATE \${schema}.notifications 
        SET read = true, updated_at = NOW()
        WHERE user_id = $1 AND read = false AND is_active = true
      `, [userId]);

      // Log audit trail
      await this.logAuditTrail(
        userId,
        'notifications',
        'bulk',
        'UPDATE',
        { action: 'mark_all_as_read' },
        { userId, timestamp: new Date() }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    try {
      const notification = await this.tenantDb.findById('notifications', notificationId);
      
      if (!notification || notification.user_id !== userId) {
        throw new Error('Notification not found or access denied');
      }

      await this.tenantDb.update('notifications', notificationId, {
        is_active: false,
        updated_at: new Date(),
      });

      // Log audit trail
      await this.logAuditTrail(
        userId,
        'notifications',
        notificationId,
        'DELETE',
        notification,
        null
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const result = await this.tenantDb.query(`
        SELECT COUNT(*) as count
        FROM \${schema}.notifications 
        WHERE user_id = $1 AND read = false AND is_active = true
      `, [userId]);

      return parseInt(result[0]?.count || 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Static method to create notifications across different tenants
  static async createForTenant(
    tenantId: string,
    request: CreateNotificationRequest
  ): Promise<void> {
    const service = new NotificationService(tenantId);
    await service.create(request);
  }

  // Helper method to create system notifications
  static async createSystemNotification(
    tenantId: string,
    userId: string,
    title: string,
    message: string,
    payload?: any
  ): Promise<void> {
    await NotificationService.createForTenant(tenantId, {
      userId,
      type: 'system',
      title,
      message,
      payload,
    });
  }

  private mapToNotification(data: any): Notification {
    return {
      id: data.id,
      userId: data.user_id,
      actorId: data.actor_id,
      type: data.type,
      title: data.title,
      message: data.message,
      payload: typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload,
      link: data.link,
      read: data.read,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private async logAuditTrail(
    userId: string,
    tableName: string,
    recordId: string,
    operation: string,
    oldData: any,
    newData: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          tenantId: this.tenantDb['tenantId'], // Access private property
          tableName,
          recordId,
          operation,
          oldData: oldData || undefined,
          newData: newData || undefined,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }
}