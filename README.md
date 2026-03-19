<div align="center">

<img src="./frontend/public/Assets/Images/Logo/sommemo-logo.png" width="50" alt="SomMemo Logo">

# SomMemo

**On-chain digital will powered by Somnia Reactivity —**
**your assets automatically transfer to your beneficiary if you go inactive.**

[![Somnia Testnet](https://img.shields.io/badge/Somnia-Testnet-7C3AED)](https://shannon-explorer.somnia.network)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636)](https://soliditylang.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ignition-F7DF1E)](https://hardhat.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

</div>

---

## What is SomMemo?

**SomMemo** is an on-chain digital will (surat wasiat digital) running on the Somnia blockchain. It allows users to designate a beneficiary and deposit assets — STT (native token), ERC-20 tokens, and ERC-721 NFTs — into a secure vault. If the user fails to check in before a self-defined deadline, all assets are automatically transferred to the beneficiary.

No bots. No off-chain servers. No trusted third parties. The entire execution is handled natively by **Somnia Reactivity** using a **Schedule (cron) subscription** — a one-off time-based trigger that fires exactly at the user's deadline, then self-destructs. One will = one subscription. No recurring gas waste, no manual cleanup.

---

## Problem

| Problem | Description |
|---------|-------------|
| **No trustless inheritance** | Traditional crypto inheritance requires centralized services or legal intermediaries to execute transfers |
| **Keeper dependency** | On Ethereum, time-based automation requires external bots (Chainlink Automation, Gelato) which introduce off-chain trust and cost |
| **No on-chain proof-of-life** | There is no decentralized mechanism that verifies whether a wallet owner is still active and acts on inactivity |

---

## Solution

| Solution | How |
|----------|-----|
| **Trustless auto-execution** | Assets locked in smart contract — only released when Somnia Reactivity detects inactivity past the deadline |
| **Schedule (cron) subscription** | One will = one one-off `Schedule` subscription — fires exactly at deadline, self-destructs after triggering, zero recurring gas cost |
| **Native time-based trigger** | Somnia's `Schedule` event replaces external keepers entirely — validators execute `onEvent()` automatically at the precise timestamp |
| **On-chain check-in** | Owner proves liveness by calling `checkIn()`, which cancels the old subscription and creates a new one with a reset deadline |

---

## Key Features

| Feature | Description |
|---------|-------------|
| Fully On-Chain | All wills, vaults, check-ins, and executions recorded on Somnia blockchain |
| Multi-Asset Vault | Supports STT (native), ERC-20 tokens (soon), and ERC-721 NFTs (soon) in a single vault |
| Somnia Reactivity | Uses `Schedule` system event — no keeper, no bot, no server |
| On-Chain History | `getCheckInHistory()` and `getVaultHistory()` — no external indexer needed |
| Flexible Deadline | Inactive period set freely in seconds(for teting) and in a days — no preset restrictions |
| CEI Pattern | Check-Effects-Interactions for reentrancy protection in `onEvent()` |

---

## Somnia Reactivity Architecture Integration

SomMemo relies entirely on Somnia Reactivity (cron subscription) to bridge time-based deadlines with on-chain execution — no off-chain components involved. Here are the core files composing this integration:

| Component Level | File | Description |
|----------------|------|-------------|
| **Smart Contract** | [sc/contracts/SomMemo.sol](./sc/contracts/SomMemo.sol) | Main contract. Implements `ISomniaEventHandler` and registers a `Schedule` subscription on every `registerWill()` and `checkIn()` call |
| **Subscription Logic** | [sc/contracts/SomMemo.sol#_createScheduleSubscription](./sc/contracts/SomMemo.sol) | Internal function that calls `reactivityPrecompile.subscribe()` with `Schedule` event topics and the user's deadline in milliseconds |
| **Event Handler** | [sc/contracts/SomMemo.sol#onEvent](./sc/contracts/SomMemo.sol) | `onEvent()` — called automatically by Somnia validators when deadline is reached. Looks up owner via `deadlineToOwner`, then transfers all vault assets to beneficiary |
| **Mock Precompile** | [sc/contracts/mock/MockSomniaPrecompile.sol](./sc/contracts/mock/MockSomniaPrecompile.sol) | Local mock of `0x0000...0100` for Hardhat testing without live Somnia network |
| **Deployment** | [sc/ignition/modules/SomMemo.ts](./sc/ignition/modules/SomMemo.ts) | Hardhat Ignition module — deploys SomMemo with the Somnia Reactivity Precompile address (`0x0000...0100`) as constructor argument |

---

## How Somnia Reactivity Powers SomMemo

Traditional blockchains (Ethereum, etc.) are **passive** — smart contracts only execute when someone sends a transaction. This means a crypto inheritance system on Ethereum *requires*:
- External keeper bots (Chainlink Automation, Gelato Network)
- A centralized server to monitor deadlines
- A trusted third party to trigger transfers

**Somnia Reactivity changes this paradigm.** Smart contracts can subscribe to time-based events, and the Somnia validator network automatically calls the handler function when the time arrives — zero external infrastructure, zero trust assumptions.

SomMemo uses this for: **if a user doesn't check in before their deadline, Somnia automatically executes the asset transfer to the beneficiary.**

### Somnia vs Traditional EVM

| Aspect | Traditional EVM (Ethereum) | Somnia Reactivity |
|--------|---------------------------|-------------------|
| Time-based execution | External keeper/bot required | Native, built into the chain |
| Automation cost | Chainlink fees / server cost | Gas from contract balance |
| Centralization | Off-chain dependency | 100% on-chain |
| Trust model | Trust keeper operator | Trustless — validators execute |
| Infrastructure | External server required | Zero external infrastructure |
| Latency | Depends on keeper poll interval | Near-instant at block time |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│                                                         │
│   registerWill() → depositSTT/Token/NFT() → checkIn()  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SomMemo Contract                      │
│                                                         │
│   ┌──────────────┐  ┌──────────────────┐  ┌─────────┐  │
│   │  Will Data   │  │      Vault       │  │Subscribe│  │
│   │  (mapping)   │  │ STT/ERC20/ERC721 │  │ Somnia  │  │
│   └──────────────┘  └──────────────────┘  └────┬────┘  │
└───────────────────────────────────────────────┼────────┘
                                                │
                           ┌────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────┐
│           Somnia Reactivity Precompile                  │
│           0x0000...0100                                 │
│                                                         │
│   Monitors time → when deadline is reached              │
│   → calls onEvent() on SomMemo                          │
└──────────────────────────┬──────────────────────────────┘
                           │  onEvent() called automatically
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Will Execution                        │
│                                                         │
│   STT   → transfer to beneficiary                       │
│   ERC20 → transfer to beneficiary                       │
│   NFT   → safeTransferFrom to beneficiary               │
│   will.executed = true, will.active = false             │
└─────────────────────────────────────────────────────────┘
```

### Will State Diagram

```
[Not Registered]
      ↓ registerWill()
      ↓
   [Active] ←── checkIn() ──→ [Active] (deadline reset)
      │
      ├── deactive() ──→ [Inactive] (assets returned to owner)
      │
      └── deadline reached → onEvent() ──→ [Executed] (assets to beneficiary)
```

### Full Execution Flow

```
1. User calls registerWill(beneficiary, periodSec)
         ↓
2. SomMemo calculates deadlineMs = (block.timestamp + periodSec) * 1000
         ↓
3. SomMemo stores deadlineToOwner[rounded(deadlineMs)] = msg.sender
         ↓
4. SomMemo calls reactivityPrecompile.subscribe(SubscriptionData{
       eventTopics: [Schedule.selector, deadlineMs, 0, 0],
       emitter: 0x0100,
       handlerContractAddress: address(this),
       ...
   })
         ↓
5. User deposits STT/token/NFT to vault
         ↓
6. [Scenario A] User calls checkIn() before deadline
   → SomMemo creates new subscription with reset deadline
   → Will is NOT executed

   [Scenario B] User does NOT check in until deadline
         ↓
7. Somnia Validator detects Schedule event with matching timestamp
         ↓
8. Somnia Validator automatically calls SomMemo.onEvent(...)
         ↓
9. onEvent() looks up deadlineToOwner[rounded(deadlineMs)] → gets owner
         ↓
10. Transfers all assets (STT + tokens + NFTs) to beneficiary
          ↓
11. Emits WillExecuted event → frontend updates UI
```

---

## Contract Functions

### Write Functions

| Function | Description |
|----------|-------------|
| `registerWill(address _beneficiary, uint256 _inactivePeriodSec)` | Register a new will — inactive period in seconds (e.g. `2592000` = 30 days) |
| `depositSTT()` | Deposit STT (native token) to vault — payable |
| `depositToken(address _tokenAddress, uint256 _amount)` | Deposit ERC-20 token (soon) to vault (requires prior `approve`) |
| `depositNFT(address _nftContract, uint256 _tokenId)` | Deposit ERC-721 NFT (soon) to vault (requires prior `setApprovalForAll`) |
| `checkIn()` | Prove liveness — resets deadline to now + inactivePeriod |
| `withdraw()` | Withdraw all vault assets back to owner |
| `updateBeneficiary(address _newBeneficiary)` | Change beneficiary address |
| `updateInactiveperiod(uint256 _newPeriodSec)` | Change inactive period in seconds — resets deadline |
| `deactive()` | Deactivate will and return all assets to owner |

### Read Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `getWillInfo(address _owner)` | `beneficiary, lastCheckIn, inactivePeriod, deadlineTimestamp, executed, active` | Full will data |
| `getStatus(address _owner)` | `"Active"` / `"Warning"` / `"Inactive"` | Status string for UI |
| `vaultSTT(address owner)` | `uint256` | STT balance in vault (wei) |
| `getCheckInHistory(address _owner)` | `{ timestamp, blockNumber }[]` | All check-in records |
| `getVaultHistory(address _owner)` | `{ actType, asset, amount, timestamp, blockNumber }[]` | All vault activity records |

### Vault Activity Types (`actType`)

| Value | Action |
|-------|--------|
| `0` | Deposit STT |
| `1` | Deposit ERC-20 Token (soon) |
| `2` | Deposit NFT (soon) |
| `3` | Withdraw STT |
| `4` | Withdraw ERC-20 Token (soon) |
| `5` | Withdraw NFT (soon) |

---

## Deployed Contract (Somnia Testnet)

| Contract | Address | Verified |
|----------|---------|---------|
| SomMemo | [0xbfd1dBe944a69870e9f2A14AD1c74E1DC49F9F53](https://shannon-explorer.somnia.network/address/0xbfd1dBe944a69870e9f2A14AD1c74E1DC49F9F53) | Yes |

---

## Network Configuration

```
Network Name : Somnia Testnet
RPC URL      : https://dream-rpc.somnia.network
Chain ID     : 50312
Symbol       : STT
Explorer     : https://shannon-explorer.somnia.network
```

---

## Project Structure

```
SomMemo/
├── sc/
│   ├── contracts/
│   │   ├── SomMemo.sol                   # Main smart contract
│   │   └── mock/
│   │       └── MockSomniaPrecompile.sol  # Mock for local testing
│   ├── ignition/modules/
│   │   └── SomMemo.ts                    # Hardhat Ignition deployment module
│   └── test/
│       └── SomMemo.test.ts               # Test suite
├── frontend/
│   └── src/                              # Next.js frontend application
├── docsSC.md                             # Frontend integration documentation
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Somnia Testnet (Chain ID: 50312) |
| Smart Contracts | Solidity ^0.8.28 |
| Development | Hardhat + Hardhat Ignition |
| Automation | Somnia Reactivity Precompile (`0x0000...0100`) |
| Frontend | Next.js + ethers.js v6 |
| Token Support | STT (native), ERC-20 (soon), ERC-721 (soon) |

---

## Somnia Reactivity — Technical Notes

### Operational Requirement: 32 STT Minimum

The SomMemo contract (as subscription owner) must always hold **≥ 32 STT**. This is a holding requirement from Somnia Reactivity — not spent as a deposit. Actual gas fees are deducted per `onEvent()` invocation. If the balance drops below 32 STT, subscriptions pause until restored.

### Schedule Event Configuration

```
priorityFeePerGas : 2,000,000,000  (2 gwei)
maxFeePerGas      : 10,000,000,000 (10 gwei)
gasLimit          : 3,000,000
isGuaranteed      : true
```

Deadline stored and looked up with millisecond rounding (`/ 1000 * 1000`) to handle Somnia's ±ms variance in `eventTopics` delivery.

### Why SomMemo Uses Schedule (Cron) Subscription

Somnia provides 3 types of system events. Here's why Schedule is the only right choice for SomMemo:

| Event | Frequency | Right for SomMemo? |
|-------|-----------|-------------------|
| `BlockTick` | ~10x per second (every block) | No — fires too often, extremely gas-wasteful |
| `EpochTick` | ~every 5 minutes | No — not precise, can miss deadline by minutes |
| `Schedule` | Exactly at the specified timestamp | **Yes — ideal** |

**1. Time Precision**
```
User sets deadline  : 30 days from now
Schedule fires      : exactly at that timestamp     ✅
BlockTick fires     : every block = thousands of times wasted
EpochTick fires     : every 5 minutes = imprecise
```

**2. One-Off by Design**

From Somnia docs: *"The subscription to Schedule is one-off and will be deleted after triggering."*

This is perfect for a will system:
- One Will = One Schedule subscription
- After execution, automatically cleaned up
- No manual cleanup needed

**3. Cost Efficiency**
```
BlockTick : pay gas thousands of times per day
EpochTick : pay gas hundreds of times per day
Schedule  : pay gas ONCE when deadline arrives   ✅
```

**4. Exact Semantic Match**

From Somnia docs: *"Schedule Event is useful for scheduling actions in the future."*

SomMemo use case = *"execute transfer in the future if condition is met"* → **exact match**.

**Conclusion:** SomMemo uses Schedule subscription because semantically and technically it is the only correct choice — precise timing, one-off, cost-efficient, and designed specifically for "future actions" as per Somnia docs.

---

