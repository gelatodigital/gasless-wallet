# Gasless Wallet

GaslessWallet is the main class where the developers can create smart contract wallets owned by their users' EOA and sponsor the transactions by using [Gelato's 1Balance Service](https://docs.gelato.network/developer-services/relay/payment-and-fees/1balance)

## Installation

`yarn add @gelatonetwork/gasless-wallet`

`npm install @gelatonetwork/gasless-wallet`

## Usage

### Imports

```typescript
import { GaslessWallet, GaslessWalletConfig } from "@gelatonetwork/gasless-wallet"
import { ethers } from "ethers";
```

### Initialization

```typescript
const eoaProvider:
    | ethers.providers.ExternalProvider
    | ethers.providers.JsonRpcFetchFunc = ...

const gaslessWalletConfig: GaslessWalletConfig = {
    apiKey: "1BALANCE_API_KEY",
};


const gaslessWallet = new GaslessWallet(eoaProvider, gaslessWalletConfig);
await gaslessWallet.init();
```

### Get Gasless Wallet Contract [Gnosis Safe Proxy] Address

```typescript
const gaslessWalletContractAddress = gaslessWallet.getAddress();
```

### Helper Functions

```typescript
const isGaslessWalletAlreadyDeployed = await gaslessWallet.isDeployed();
const isGaslessWalletAlreadyInitialized = gaslessWallet.isInitialized();
```

### Send Transaction

Sponsored Transaction that is sent through EOA's Gnosis Safe Proxy

```typescript
const { taskId } = await gaslessWallet.sendTransaction(TARGET_ADDRESS, TX_DATA);
```
