import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { database } from '../config/database';

export interface CreateKeyRequest {
  tenantId?: string;
  accountType: 'SIMPLES' | 'COMPOSTA' | 'GERENCIAL';
  usesAllowed?: number;
  expiresAt?: Date;
  singleUse?: boolean;
  metadata?: any;
}

export class RegistrationKeyService {
  async generateKey(request: CreateKeyRequest, createdBy: string): Promise<string> {
    // Generate random key
    const key = crypto.randomBytes(32).toString('hex');
    const keyHash = await bcrypt.hash(key, 12);

    // Create key record
    await database.createRegistrationKey({
      key_hash: keyHash,
      tenant_id: request.tenantId,
      account_type: request.accountType,
      uses_allowed: request.usesAllowed || 1,
      uses_left: request.usesAllowed || 1,
      single_use: request.singleUse ?? true,
      expires_at: request.expiresAt?.toISOString(),
      metadata: request.metadata || {},
      created_by: createdBy,
      used_logs: [],
    });

    return key; // Return plain key only once
  }

  async listKeys(tenantId?: string) {
    const data = await database.getAllRegistrationKeys();
    
    if (tenantId) {
      return data.filter(key => key.tenant_id === tenantId);
    }
    
    return data;
  }

  async revokeKey(keyId: string) {
    await database.revokeRegistrationKey(keyId);
  }

  async getKeyUsage(keyId: string) {
    const keys = await database.getAllRegistrationKeys();
    const key = keys.find(k => k.id === keyId);

    if (!key) {
      throw new Error('Key not found');
    }

    return {
      id: key.id,
      accountType: key.account_type,
      usesAllowed: key.uses_allowed,
      usesLeft: key.uses_left,
      usedLogs: key.used_logs,
      revoked: key.revoked,
      expiresAt: key.expires_at,
      createdAt: key.created_at,
    };
  }
}

export const registrationKeyService = new RegistrationKeyService();