/**
 * Scrolls Module
 *
 * Integration with Charms Scrolls API for Bitcoin programmable tokens.
 * https://scrolls.charms.dev
 */

// Client
export {
  ScrollsClient,
  ScrollsAPIError,
  createScrollsClient,
  type ScrollsClientOptions,
} from "./client";

// Charms Service
export {
  CharmsService,
  createCharmsService,
  type CharmsServiceOptions,
} from "./charms";

// Types
export type {
  ScrollsNetwork,
  ScrollsConfig,
  SignInput,
  SignRequest,
  FeeCalculation,
  CharmToken,
  CharmUTXO,
  SpellConfig,
  SpellInput,
  SpellOutput,
  ScrollsResponse,
  TokenBalance,
  AddressTokenBalances,
  TokenUTXO,
} from "./types";
