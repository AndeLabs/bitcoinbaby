/**
 * Scrolls API Integration
 *
 * Scrolls es el indexer oficial de Charms que:
 * - Indexa el estado de todos los Charms en Bitcoin
 * - Provee API REST para consultar balances y transacciones
 * - Permite tracking de tokens Runes en tiempo real
 *
 * Documentacion: https://docs.charms.dev/scrolls
 */

interface ScrollsConfig {
  apiUrl: string;
  network: 'mainnet' | 'testnet';
}

interface TokenBalance {
  runeId: string;
  symbol: string;
  balance: string;
  decimals: number;
}

interface Transaction {
  txid: string;
  type: 'mint' | 'transfer' | 'burn';
  amount: string;
  timestamp: number;
  confirmed: boolean;
}

const defaultConfig: ScrollsConfig = {
  apiUrl: 'https://scrolls.charms.dev',
  network: 'testnet',
};

/**
 * Cliente para interactuar con Scrolls API
 */
export class ScrollsClient {
  private config: ScrollsConfig;

  constructor(config: Partial<ScrollsConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Obtiene el balance de BABY tokens para una direccion
   */
  async getBabyBalance(address: string): Promise<bigint> {
    const balances = await this.getBalances(address);
    const babyBalance = balances.find((b) => b.symbol === 'BABY');
    return babyBalance ? BigInt(babyBalance.balance) : BigInt(0);
  }

  /**
   * Obtiene todos los balances de tokens para una direccion
   */
  async getBalances(address: string): Promise<TokenBalance[]> {
    const response = await fetch(
      `${this.config.apiUrl}/api/v1/balances/${address}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No balances
      }
      throw new Error(`Failed to fetch balances: ${response.statusText}`);
    }

    const result = await response.json();
    return result.balances;
  }

  /**
   * Obtiene el historial de transacciones de BABY
   */
  async getBabyTransactions(
    address: string,
    limit = 50
  ): Promise<Transaction[]> {
    const response = await fetch(
      `${this.config.apiUrl}/api/v1/transactions/${address}?symbol=BABY&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transactions: ${response.statusText}`);
    }

    const result = await response.json();
    return result.transactions;
  }

  /**
   * Obtiene informacion del token BABY
   */
  async getBabyTokenInfo(): Promise<{
    runeId: string;
    symbol: string;
    totalSupply: string;
    holders: number;
  }> {
    const response = await fetch(
      `${this.config.apiUrl}/api/v1/tokens/BABY`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch token info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Verifica si una transaccion esta confirmada
   */
  async isTransactionConfirmed(txid: string): Promise<boolean> {
    const response = await fetch(
      `${this.config.apiUrl}/api/v1/tx/${txid}`
    );

    if (!response.ok) {
      return false;
    }

    const result = await response.json();
    return result.confirmed === true;
  }
}
