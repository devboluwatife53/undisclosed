/*
 * Deploys the Undisclosed payroll contract to the Midnight Preprod testnet.
 * See deploy-preview.ts for usage — identical, targeting Preprod instead.
 */
import { Buffer } from "node:buffer";
import * as api from "./api.js";
import { PreprodConfig } from "./config.js";

const config = new PreprodConfig();

const seed = process.env.WALLET_SEED;
const identitySecretKeyHex = process.env.IDENTITY_SECRET_KEY;

const walletCtx = seed
  ? await api.buildWalletAndWaitForFunds(
      config,
      seed,
      identitySecretKeyHex
        ? new Uint8Array(Buffer.from(identitySecretKeyHex, "hex"))
        : crypto.getRandomValues(new Uint8Array(32)),
    )
  : await api.buildFreshWallet(config);

const providers = await api.configureProviders(walletCtx, config);

console.log("Deploying Undisclosed payroll contract to Preprod...");
const deployed = await api.deploy(providers, walletCtx.identitySecretKey);
const contractAddress = deployed.deployTxData.public.contractAddress;

console.log(`
──────────────────────────────────────────────────────────────
  Deployed! Contract address:
  ${contractAddress}
──────────────────────────────────────────────────────────────
`);

const state = await api.getPayrollLedgerState(providers, contractAddress);
console.log("Initial public ledger state:", state);

process.exit(0);
