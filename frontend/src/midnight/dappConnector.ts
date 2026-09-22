import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";
import { fromHex } from "@midnight-ntwrk/midnight-js/utils";
import { networkConfig } from "./config";

// A fixed message the wallet signs so the same wallet always reproduces the
// same payroll identity secret. The signature never leaves this function in
// its raw form — only its hash (an unrelated-looking 32-byte secret) is used
// as the employer/employee secret key, and that secret only ever reaches the
// chain through one-way commitment/nullifier hashes, never in plaintext. See
// DESIGN.md for what's disclosed on-chain.
const IDENTITY_MESSAGE = "undisclosed:payroll-identity:v1";

/**
 * Derives this wallet's payroll identity secret key by signing a fixed
 * message and hashing the signature. Deterministic per wallet: reconnecting
 * with the same wallet always reproduces the same secret, so there's no
 * separate identity key to save or paste — but note the derivation is only
 * as secret as the wallet's willingness to sign that exact message, so this
 * offers no more protection than the wallet itself does.
 */
export const deriveIdentitySecretKey = async (api: ConnectedAPI): Promise<Uint8Array> => {
  const { signature } = await api.signData(IDENTITY_MESSAGE, {
    encoding: "text",
    keyType: "unshielded",
  });
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(fromHex(signature)));
  return new Uint8Array(digest);
};

/**
 * Wallets inject their Initial API under `window.midnight`, keyed by a
 * per-install UUID (not a fixed name like "mnLace") — so DApps must
 * enumerate rather than reach for a hardcoded key.
 */
export const listInjectedWallets = (): InitialAPI[] => {
  const injected = window.midnight;
  return injected ? Object.values(injected) : [];
};

export class NoWalletFoundError extends Error {
  constructor() {
    super(
      "No Midnight wallet extension found. Install Lace (Midnight preview build) and reload.",
    );
    this.name = "NoWalletFoundError";
  }
}

/**
 * Connects to the first injected wallet (in practice, Lace) on the network
 * this app is configured for. Returns both the live ConnectedAPI and a
 * snapshot of the wallet's addresses for display.
 */
export const connectWallet = async (): Promise<{
  api: ConnectedAPI;
  walletName: string;
  unshieldedAddress: string;
  shieldedAddress: string;
}> => {
  const wallets = listInjectedWallets();
  if (wallets.length === 0) {
    throw new NoWalletFoundError();
  }
  // A real multi-wallet DApp would let the user pick; Lace is the only
  // wallet we target here.
  const wallet = wallets[0];
  const api = await wallet.connect(networkConfig.networkId);

  const status = await api.getConnectionStatus();
  if (status.status !== "connected") {
    throw new Error("Wallet reported a disconnected status right after connect()");
  }
  if (status.networkId !== networkConfig.networkId) {
    throw new Error(
      `Wallet is on network "${status.networkId}", but this app expects "${networkConfig.networkId}". Switch networks in Lace and reconnect.`,
    );
  }

  const [{ unshieldedAddress }, { shieldedAddress }] = await Promise.all([
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);

  return { api, walletName: wallet.name, unshieldedAddress, shieldedAddress };
};

/**
 * The DApp Connector API has no `disconnect()` method — the wallet extension
 * owns the authorization grant and manages revocation itself. "Disconnecting"
 * from the DApp side means dropping our reference to the ConnectedAPI and
 * any providers built from it, which is what the caller should do with the
 * return value of this function (i.e. set state back to null).
 */
export const disconnectWallet = (): void => {
  // Intentionally a no-op beyond documentation: nothing to call on `api`.
  // Kept as a named function so the intent is explicit at call sites and in
  // the UI, rather than inlining a comment next to `setApi(null)`.
};
