# Undisclosed — a shielded payroll protocol on Midnight

![CI](https://github.com/devboluwatife53/undisclosed/workflows/CI/badge.svg)

## Product idea

Undisclosed lets an employer fund a pay run on-chain and pay a whole
team without ever publishing who's on the payroll or what anyone earns.
The employer commits to an employee list off-chain (a Merkle tree of
`hash(pubkey || amount || nonce)` leaves) and publishes only the tree's
root plus the total payroll amount. Each employee then proves — with a
zero-knowledge proof — that they're a member of that tree and withdraws
their own allocation, without revealing which leaf is theirs or what it's
worth.

Where Midnight comes in: an outside observer of the chain can see that a
payroll run exists, its total, and how many withdrawals have happened —
but never who's employed, what anyone is paid, or which withdrawal
belongs to which person. See [DESIGN.md](DESIGN.md) for the full
public/private breakdown and [PROPOSAL.md](PROPOSAL.md) for product scope
and Mainnet feasibility, including the two pieces still stubbed in this
MVP (multi-leaf Merkle verification, enforced nullifier set).

## Deployed contract

- Network: **Preview**
- Contract address: [`9fa713a0ac1f9926f514a9430f191f8481ce4f6e8d0ffa3aa0a2652c3f5010dc`](https://preview.midnightexplorer.com/contracts/9fa713a0ac1f9926f514a9430f191f8481ce4f6e8d0ffa3aa0a2652c3f5010dc)
- Verify independently at any time (no wallet needed, reads the indexer directly):
  ```bash
  cd cli
  CONTRACT_ADDRESS=9fa713a0ac1f9926f514a9430f191f8481ce4f6e8d0ffa3aa0a2652c3f5010dc npm run status:preview
  ```

## Live demo

**[undisclosed-frontend.vercel.app](https://undisclosed-frontend.vercel.app/)** — the landing page; connect Lace and go to `/app` to fund a payroll run or withdraw.

## Demo video

_TBD — recording goes here once the withdrawal flow is working end to end._

## Public state vs. private witness

Compact splits contract data into two worlds that never mix unless you say
so explicitly:

- **Public ledger state** (`contract/src/payroll.compact`): `currentRun`
  (a `PayrollRun` — id, employer pubkey, Merkle root, total committed,
  active/finalized flags), `shieldedPool` (note commitment + value), and
  the `nullifierCount`/`payrollCounter` counters are declared with
  `export ledger`. These are readable by anyone querying the chain.
- **Private witness state**: `employerSecretKey`, `employeeSecretKey`,
  `employeeAmount`, `employeeNonce`, and the shielded note's secret/value
  never appear on the ledger. They're supplied to circuits per-call as
  `witness` values. The compiler enforces the boundary — any attempt to
  write a witness-derived value to the ledger without wrapping it in
  `disclose()` is a **compile error**.

The `withdraw` circuit shows the boundary in action: the employee's
`WithdrawalProof` carries their `pubkey`, `amount`, and `nonce` as
witness-only fields. The circuit recomputes their commitment and nullifier
from those private inputs, checks the commitment against the (stubbed,
single-leaf) Merkle root, and discloses only the resulting nullifier —
never the pubkey or amount. See [DESIGN.md](DESIGN.md) for what an
observer can and can't learn from the resulting on-chain state.

## Repo layout

```
contract/          Compact contract, generated managed/ output, tests
  src/payroll.compact          the payroll contract (see above)
  src/payroll-witnesses.ts     private-state shape + witness implementation
  src/managed/payroll/         generated circuits, zkir, and prover/verifier keys
  src/test/payroll.test.ts     vitest suite against a local simulator
cli/                Node-based deployment tooling (Preview + Preprod)
  src/deploy-{preview,preprod}.ts   build/fund a wallet, deploy, print address
  src/status-{preview,preprod}.ts   read a deployed contract's public state
  proof-server.yml       docker compose for the local proof server
frontend/           Browser DApp — Lace wallet connect + circuit calls
  src/midnight/payrollContract.ts   DApp Connector ↔ midnight-js bridge for payroll
  src/midnight/providers.ts         wallet ↔ midnight-js provider bridge
  src/hooks/usePayroll.ts           connect/disconnect/role/withdraw/etc. state
  src/components/    WalletBar, RoleSelector, EmployerView, EmployeeView
  index.html          static landing page, served at /
  app/                the React DApp entry, served at /app
```

## Setup — run it locally

Prerequisites: macOS/Linux, [Docker](https://www.docker.com/) (for a local
proof server, if you deploy outside the browser), Node.js 22.

1. **Install the Compact toolchain** (compiler + CLI):
   ```bash
   curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh
   compact update 0.31.1     # this project pins compactc 0.31.1
   compact --version
   ```
   This project's `contract/` compiles with `compact 0.31.1` specifically
   (pinned in `contract/package.json`'s `compact` script) to match its
   pinned `@midnight-ntwrk/compact-runtime` dependency.
2. **Use Node 22**:
   ```bash
   nvm install 22 && nvm use 22
   ```
3. **Install dependencies** (npm workspaces cover `contract/`, `cli/`, and `frontend/`):
   ```bash
   npm install
   ```
4. **Compile the contract** — regenerates `contract/src/managed/payroll/`
   (circuits, zkir, prover/verifier keys):
   ```bash
   cd contract && npm run compact
   ```
5. **Run the test suite** (contract logic against an in-memory simulator,
   no network needed):
   ```bash
   npm test
   ```
6. **Start the local proof server** (needed for CLI deploys — the frontend
   instead delegates proving to Lace itself, no local server required):
   ```bash
   cd ../cli && npm run proof-server   # docker compose, listens on :6300
   ```
7. **Deploy**, in a second terminal — `preview` or `preprod`:
   ```bash
   npm run deploy:preview   # or: npm run deploy:preprod
   ```
   With no `WALLET_SEED` set, this generates a fresh wallet and a fresh
   employer identity key, prints the wallet's unshielded address, and
   waits for you to fund it from the network's faucet
   ([Preview](https://faucet.preview.midnight.network/) /
   [Preprod](https://faucet.preprod.midnight.network/)) before deploying.
   **Save the printed seed and identity secret key** — reuse the identity
   key to manage the same payroll runs later:
   ```bash
   WALLET_SEED=<hex seed> IDENTITY_SECRET_KEY=<hex key> npm run deploy:preprod
   ```
8. **Check a deployed contract's public state** at any time, no wallet needed:
   ```bash
   CONTRACT_ADDRESS=<address> npm run status:preview
   ```
9. **Run the frontend**:
   ```bash
   cd ../frontend && npm run dev   # http://localhost:5173
   ```

## Frontend — Lace wallet DApp

`frontend/` is a Vite + React app that connects to Lace via the [DApp
Connector API](https://docs.midnight.network/api-reference/dapp-connector)
(`@midnight-ntwrk/dapp-connector-api`) and calls the payroll contract
directly from the browser — no local proof server required, proving is
delegated to the wallet.

```bash
cd frontend
npm run dev            # http://localhost:5173
```

The compiler defaults to **Preprod** (`VITE_NETWORK=preprod`) when unset;
set `VITE_NETWORK=preview` and `VITE_CONTRACT_ADDRESS=<address>` once a
deployment exists (see `.env.example`). `predev`/`prebuild` build the
`contract` workspace and copy its compiled circuit artifacts from
`contract/src/managed/payroll` into `public/managed/payroll` so the
browser can fetch them over HTTP.

**How it's wired** (`frontend/src/midnight/`):

- `dappConnector.ts` — connect/disconnect. Wallets inject themselves at
  `window.midnight.{uuid}`; we enumerate rather than hardcode a name, call
  `wallet.connect(networkId)`, and read back the connected addresses. The
  connector API has no `disconnect()` — the wallet owns the authorization
  grant, so "disconnect" on the DApp side just drops our reference to the
  connected session.
- `providers.ts` — adapts the connector's `ConnectedAPI` into midnight-js's
  `WalletProvider`/`MidnightProvider` (serializing transactions to hex
  across that boundary), delegates **proving to the wallet itself**
  (`dappConnectorProofProvider`, no local proof server needed in the
  browser), fetches ZK artifacts over HTTP (`FetchZkConfigProvider`), and
  manages **local private state** in IndexedDB (`levelPrivateStateProvider`,
  scoped per connected wallet account).
- `payrollContract.ts` — deploy / join / `createPayrollRun` / `fundPayroll`
  / `withdraw` / `finalizePayroll`, running entirely client-side.

## Test output

**25 tests passing** — contract logic against in-memory simulator:

```bash
cd contract && npm test
```

See the [CI workflow](https://github.com/devboluwatife53/undisclosed/actions) for automated test runs.
