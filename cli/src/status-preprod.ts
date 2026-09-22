/*
 * Reads the public ledger state of an already-deployed Undisclosed payroll
 * contract on Preprod, without needing a wallet or private state.
 *
 * Usage:
 *   CONTRACT_ADDRESS=<address> npm run status:preprod
 */
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { Payroll } from "@undisclosed/contract";
import { toHex } from "@midnight-ntwrk/midnight-js/utils";
import { PreprodConfig } from "./config.js";

const config = new PreprodConfig();
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  throw new Error("Set CONTRACT_ADDRESS to the deployed contract's address");
}

const publicDataProvider = indexerPublicDataProvider(config.indexer, config.indexerWS);
const contractState = await publicDataProvider.queryContractState(contractAddress);

if (contractState == null) {
  console.log(`No contract found at ${contractAddress} on Preprod.`);
} else {
  const l = Payroll.ledger(contractState.data);
  console.log(`
Contract:         ${contractAddress}
payrollCounter:   ${l.payrollCounter}
hasActiveRun:     ${l.hasActiveRun === 1n}
nullifierCount:   ${l.nullifierCount}

Current run:
  id:             ${l.currentRun.id}
  employer:       ${toHex(l.currentRun.employer)}
  merkleRoot:     ${toHex(l.currentRun.merkleRoot)}
  totalCommitted: ${l.currentRun.totalCommitted}
  isActive:       ${l.currentRun.isActive === 1n}
  isFinalized:    ${l.currentRun.isFinalized === 1n}

Shielded pool:
  noteCommitment: ${toHex(l.shieldedPool.noteCommitment)}
  value:          ${l.shieldedPool.value}
  isSpent:        ${l.shieldedPool.isSpent === 1n}
`);
}

process.exit(0);
