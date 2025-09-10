import { PrismaClient } from '@prisma/client';

// Cache de clientes Prisma por tenant
const tenantPrismaClients = new Map<string, PrismaClient>();

export class TenantDatabaseService {
  private static instance: TenantDatabaseService;

  static getInstance(): TenantDatabaseService {
    if (!TenantDatabaseService.instance) {
      TenantDatabaseService.instance = new TenantDatabaseService();
    }
    return TenantDatabaseService.instance;
  }

  // Obter cliente Prisma para um tenant específico
  getTenantPrisma(tenantId: string): PrismaClient {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    // Verificar se já existe um cliente no cache
    if (tenantPrismaClients.has(tenantId)) {
      return tenantPrismaClients.get(tenantId)!;
    }

    // Criar novo cliente Prisma com schema específico do tenant
    const schemaName = `tenant_${tenantId.replace(/-/g, '')}`;
    
    // Como não temos acesso direto ao search path no Prisma,
    // vamos usar a abordagem de SQL raw para operações específicas por tenant
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Adicionar ao cache
    tenantPrismaClients.set(tenantId, prisma);
    
    return prisma;
  }

  // Executar query raw com schema do tenant
  async executeInTenantSchema<T>(
    tenantId: string, 
    query: string, 
    params: any[] = []
  ): Promise<T[]> {
    const prisma = this.getTenantPrisma(tenantId);
    const schemaName = `tenant_${tenantId.replace(/-/g, '')}`;
    
    // Substituir placeholder ${schema} pela schema real do tenant
    const finalQuery = query.replace(/\$\{schema\}/g, schemaName);
    
    try {
      const result = await prisma.$queryRawUnsafe<T[]>(finalQuery, ...params);
      return result;
    } catch (error) {
      console.error(`Error executing query in tenant ${tenantId}:`, error);
      throw error;
    }
  }

  // Limpar cache de conexões (para graceful shutdown)
  async cleanup() {
    for (const [tenantId, client] of tenantPrismaClients.entries()) {
      try {
        await client.$disconnect();
        tenantPrismaClients.delete(tenantId);
      } catch (error) {
        console.error(`Error disconnecting client for tenant ${tenantId}:`, error);
      }
    }
  }
}

// Instância singleton
export const tenantDB = TenantDatabaseService.getInstance();