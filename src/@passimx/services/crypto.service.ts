import { subtle, createHash } from 'crypto';

export class CryptoService {
  public static getHash(value: unknown): string {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex');
  }

  public static async generateRSAKeys(): Promise<CryptoKeyPair> {
    return subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-512',
      },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  public static async exportKey(key: CryptoKey | string): Promise<string> {
    const cryptoKey =
      key instanceof CryptoKey ? key : (JSON.parse(key) as CryptoKey);

    const exportedKey = await subtle.exportKey('jwk', cryptoKey);
    exportedKey.alg = undefined;

    return JSON.stringify(exportedKey);
  }

  public static async importRSAKey(
    jwkString: string,
    type: 'public' | 'private',
  ): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkString) as JsonWebKey;
    const usages: KeyUsage[] = type === 'public' ? ['encrypt'] : ['decrypt'];

    return subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-512',
      },
      true,
      usages,
    );
  }

  public static async importEd25519Key(
    jwkString: string,
    type: 'public' | 'private',
  ): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkString) as JsonWebKey;
    const usages: KeyUsage[] = type === 'public' ? ['verify'] : ['sign'];

    return subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'Ed25519',
      },
      true,
      usages,
    );
  }

  public static async encryptByRSAKey(
    key: CryptoKey,
    payload: unknown,
  ): Promise<string | undefined> {
    try {
      const encryptedData = await subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        key,
        new TextEncoder().encode(JSON.stringify(payload)),
      );
      return exportEncryptedPayload(encryptedData);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public static async decryptByRSAKey<T = string>(
    key: CryptoKey,
    payload: string,
  ): Promise<T | undefined> {
    try {
      const decryptedPayload = importEncryptedPayload(payload);
      const decryptedData = await subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        key,
        decryptedPayload,
      );
      const string = new TextDecoder().decode(decryptedData);
      return JSON.parse(string) as T;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  public static async verifyByEd25519(
    key: CryptoKey,
    payload: unknown,
    signatureStr: string,
  ): Promise<boolean> {
    try {
      const dataToVerify = new TextEncoder().encode(JSON.stringify(payload));
      const signature = importEncryptedPayload(signatureStr);
      return await subtle.verify(
        {
          name: 'Ed25519',
        },
        key,
        signature,
        dataToVerify,
      );
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

function exportEncryptedPayload(payload: ArrayBuffer): string {
  const uint8Array = new Uint8Array(payload);
  return JSON.stringify(uint8Array.toString());
}

function importEncryptedPayload(payload: string): ArrayBuffer {
  const string = JSON.parse(payload) as string;
  const numbers = string.split(',').map((number) => Number(number));
  return new Uint8Array(numbers).buffer;
}
