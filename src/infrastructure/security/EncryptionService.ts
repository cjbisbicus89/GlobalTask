import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio de infraestructura para el cifrado de datos sensibles (PII).
 * Implementa AES-256-CBC.
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly IV_LENGTH = 16;

  private static readonly KEY = (() => {
    const key = process.env.AES_ENCRYPTION_KEY;
    
    if (!key || key.length !== 32) {     
      throw new Error(`ERROR FATAL: AES_ENCRYPTION_KEY debe tener exactamente 32 caracteres. Longitud actual: ${key?.length || 0}`);
    }
    return Buffer.from(key, 'utf8');
  })();

  /** Cifra un texto plano utilizando un IV aleatorio */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
   
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /** Descifra una cadena cifrada */
  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, encryptedText] = encryptedData.split(':');
      if (!ivHex || !encryptedText) throw new Error('Formato de datos cifrados inválido');

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.KEY, iv);
      
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('La descifrado falló: Verifique la clave o la integridad de los datos.');
    }
  }
}