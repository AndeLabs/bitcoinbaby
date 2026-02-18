/**
 * Wallet Provider Registry
 *
 * Manages multiple wallet providers and handles provider detection.
 */

import type {
  WalletProvider,
  WalletProviderType,
  ProviderRegistry,
  DetectedProvider,
} from "./types";
import { InternalWalletProvider } from "./internal-provider";
import { UnisatProvider } from "./unisat-provider";
import { XVerseProvider } from "./xverse-provider";

/**
 * Default provider registry implementation
 */
class DefaultProviderRegistry implements ProviderRegistry {
  private providers: Map<WalletProviderType, WalletProvider> = new Map();

  register(provider: WalletProvider): void {
    this.providers.set(provider.type, provider);
  }

  get(type: WalletProviderType): WalletProvider | undefined {
    return this.providers.get(type);
  }

  getAll(): WalletProvider[] {
    return Array.from(this.providers.values());
  }

  getAvailable(): WalletProvider[] {
    return this.getAll().filter((p) => p.isAvailable());
  }

  detect(): DetectedProvider[] {
    const detected: DetectedProvider[] = [];

    // Check each provider
    for (const provider of this.providers.values()) {
      detected.push({
        type: provider.type,
        name: provider.name,
        available: provider.isAvailable(),
        icon: this.getProviderIcon(provider.type),
      });
    }

    return detected;
  }

  private getProviderIcon(type: WalletProviderType): string {
    const icons: Record<WalletProviderType, string> = {
      internal: "🔐",
      unisat: "🟠",
      xverse: "🟣",
      leather: "🟤",
      okx: "⚫",
    };
    return icons[type] || "💼";
  }
}

/**
 * Global provider registry instance
 */
let globalRegistry: ProviderRegistry | null = null;

/**
 * Get the global provider registry
 * Lazily initializes with default providers
 */
export function getProviderRegistry(): ProviderRegistry {
  if (!globalRegistry) {
    globalRegistry = createProviderRegistry();
  }
  return globalRegistry;
}

/**
 * Create a new provider registry with default providers
 */
export function createProviderRegistry(): ProviderRegistry {
  const registry = new DefaultProviderRegistry();

  // Register default providers
  registry.register(new InternalWalletProvider());
  registry.register(new UnisatProvider());
  registry.register(new XVerseProvider());

  return registry;
}

/**
 * Detect available wallet providers
 */
export function detectWallets(): DetectedProvider[] {
  return getProviderRegistry().detect();
}

/**
 * Get a specific provider by type
 */
export function getProvider(type: WalletProviderType): WalletProvider | undefined {
  return getProviderRegistry().get(type);
}

/**
 * Get all available (installed) providers
 */
export function getAvailableProviders(): WalletProvider[] {
  return getProviderRegistry().getAvailable();
}

/**
 * Check if any wallet is available
 */
export function hasAvailableWallet(): boolean {
  return getAvailableProviders().length > 0;
}

/**
 * Get the best available provider
 * Priority: Unisat > XVerse > Internal
 */
export function getBestProvider(): WalletProvider | undefined {
  const registry = getProviderRegistry();
  const priority: WalletProviderType[] = ["unisat", "xverse", "internal"];

  for (const type of priority) {
    const provider = registry.get(type);
    if (provider?.isAvailable()) {
      return provider;
    }
  }

  return undefined;
}
