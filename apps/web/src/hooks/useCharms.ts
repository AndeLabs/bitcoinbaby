'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  CharmsService,
  createCharmsService,
  type ScrollsNetwork,
  type ScrollsConfig,
  type FeeCalculation,
} from '@bitcoinbaby/bitcoin';

interface CharmsState {
  isConnected: boolean;
  network: ScrollsNetwork;
  config: ScrollsConfig | null;
  feeAddress: string | null;
  error: string | null;
}

interface UseCharmsOptions {
  network?: ScrollsNetwork;
  tokenTicker?: string;
}

export function useCharms(options: UseCharmsOptions = {}) {
  const { network = 'testnet4', tokenTicker = 'BABY' } = options;

  const serviceRef = useRef<CharmsService | null>(null);
  const [state, setState] = useState<CharmsState>({
    isConnected: false,
    network,
    config: null,
    feeAddress: null,
    error: null,
  });

  // Initialize service
  useEffect(() => {
    const service = createCharmsService({
      network,
      tokenTicker,
    });

    serviceRef.current = service;

    // Fetch initial config
    service
      .getClient()
      .getConfig()
      .then((config) => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          config,
          feeAddress:
            network === 'main'
              ? config.fee_address.main
              : config.fee_address.testnet4,
        }));
      })
      .catch((err) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          error: err instanceof Error ? err.message : 'Connection failed',
        }));
      });

    return () => {
      serviceRef.current = null;
    };
  }, [network, tokenTicker]);

  // Switch network
  const switchNetwork = useCallback((newNetwork: ScrollsNetwork) => {
    if (serviceRef.current) {
      serviceRef.current.setNetwork(newNetwork);
      setState((prev) => ({
        ...prev,
        network: newNetwork,
        feeAddress: prev.config
          ? newNetwork === 'main'
            ? prev.config.fee_address.main
            : prev.config.fee_address.testnet4
          : null,
      }));
    }
  }, []);

  // Derive mining address
  const deriveMiningAddress = useCallback(
    async (nonce: number): Promise<string | null> => {
      if (!serviceRef.current) return null;
      try {
        return await serviceRef.current.deriveMiningAddress(nonce);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to derive address',
        }));
        return null;
      }
    },
    []
  );

  // Calculate fee
  const calculateFee = useCallback(
    async (
      numberOfInputs: number,
      totalInputSats: number
    ): Promise<FeeCalculation | null> => {
      if (!serviceRef.current) return null;
      try {
        const client = serviceRef.current.getClient();
        return await client.calculateFee(numberOfInputs, totalInputSats);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to calculate fee',
        }));
        return null;
      }
    },
    []
  );

  // Create mining spell data
  const createMiningSpell = useCallback(
    (minerAddress: string, amount: bigint, proofOfWork: string) => {
      if (!serviceRef.current) return null;
      const spell = serviceRef.current.createMiningSpell(
        minerAddress,
        amount,
        proofOfWork
      );
      return serviceRef.current.createSpellOpReturn(spell);
    },
    []
  );

  return {
    ...state,
    switchNetwork,
    deriveMiningAddress,
    calculateFee,
    createMiningSpell,
    service: serviceRef.current,
  };
}

export type { CharmsState, UseCharmsOptions };
