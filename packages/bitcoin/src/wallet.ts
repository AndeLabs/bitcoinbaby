/**
 * Wallet - Generacion y manejo de wallets Bitcoin
 *
 * Usa bitcoinjs-lib para operaciones criptograficas.
 * IMPORTANTE: Las claves privadas nunca deben loguearse o exponerse.
 */

export interface Wallet {
  address: string;
  publicKey: string;
  // privateKey se mantiene en memoria segura, no se expone
}

interface InternalWallet extends Wallet {
  privateKey: Uint8Array;
  mnemonic: string;
}

// Almacenamiento en memoria (en produccion usar secure storage)
let currentWallet: InternalWallet | null = null;

/**
 * Genera un nuevo wallet Bitcoin
 */
export async function generateWallet(): Promise<Wallet> {
  // TODO: Implementar con bitcoinjs-lib
  // Por ahora retornamos placeholder

  const mockWallet: InternalWallet = {
    address: 'tb1q_placeholder_address_for_testnet',
    publicKey: '02_placeholder_public_key',
    privateKey: new Uint8Array(32),
    mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  };

  currentWallet = mockWallet;

  return {
    address: mockWallet.address,
    publicKey: mockWallet.publicKey,
  };
}

/**
 * Obtiene la direccion del wallet actual
 */
export function getAddress(wallet: Wallet): string {
  return wallet.address;
}

/**
 * Firma una transaccion (interno, no expone private key)
 */
export async function signTransaction(
  txHex: string
): Promise<string> {
  if (!currentWallet) {
    throw new Error('No wallet loaded');
  }

  // TODO: Implementar firma real
  return txHex + '_signed';
}

/**
 * Limpia el wallet de memoria
 */
export function clearWallet(): void {
  if (currentWallet) {
    // Limpiar private key de memoria
    currentWallet.privateKey.fill(0);
    currentWallet = null;
  }
}
