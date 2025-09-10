import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { projectsService } from '../services/projectsService';

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  clientId: z.string().optional(),
  organization: z.string().optional(),
  address: z.string().optional(),
  budget: z.number().min(0).optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  status: z.enum(['contacted', 'proposal', 'won', 'lost']).default('contacted'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).default([]),
  assignedTo: z.array(z.string()).default([]),
  notes: z.string().optional(),
  contacts: z.array(z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    role: z.string(),
  })).default([]),
});

const updateProjectSchema = createProjectSchema.partial();

export class ProjectsController {
  async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      console.log('Fetching projects for tenant:', req.tenantId);

      // Extrair filtros da query
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        assignedTo: req.query.assignedTo ? (req.query.assignedTo as string).split(',') : undefined
      };

      const result = await projectsService.getProjects(req.tenantId, filters);
      
      console.log('Projects fetched successfully:', { count: result.projects.length, total: result.pagination.total });
      
      res.json(result);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        error: 'Failed to fetch projects',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async getProject(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const mockProject = {
        id,
        title: 'Ação Previdenciária - João Santos',
        description: 'Revisão de aposentadoria negada pelo INSS',
        client_name: 'João Santos',
        status: 'proposal',
        tasks: [],
      };

      res.json({ project: mockProject });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        error: 'Failed to fetch project',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = createProjectSchema.parse(req.body);

      const mockProject = {
        id: 'project-' + Date.now(),
        ...validatedData,
        created_by: req.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        progress: 0,
      };

      res.status(201).json({
        message: 'Project created successfully',
        project: mockProject,
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(400).json({
        error: 'Failed to create project',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const validatedData = updateProjectSchema.parse(req.body);

      const mockProject = {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      };

      res.json({
        message: 'Project updated successfully',
        project: mockProject,
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(400).json({
        error: 'Failed to update project',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || !req.tenantId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      res.json({
        message: 'Project deleted successfully',
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        error: 'Failed to delete project',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const projectsController = new ProjectsController();