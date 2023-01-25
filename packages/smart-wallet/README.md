# Gelato Smart Wallet

GelatoSmartWallet is the main class where the developers can create smart contract wallets owned by their users' EOA and sponsor the transactions by using [Gelato's 1Balance Service](https://docs.gelato.network/developer-services/relay/payment-and-fees/1balance)

## Installation

`yarn add @gelatonetwork/account-abstraction`

`npm install @gelatonetwork/account-abstraction`

## Usage

### Imports

```
import { GelatoSmartWallet, SmartWalletConfig } from "@gelatonetwork/account-abstraction"
import { ethers } from "ethers";
```

### Initialization

```
const eoaProvider:
    | ethers.providers.ExternalProvider
    | ethers.providers.JsonRpcFetchFunc = ...

const smartWalletConfig: SmartWalletConfig = {
    apiKey: "1BALANCE_API_KEY",
};


const smartWallet = new GelatoSmartWallet(eoaProvider, smartWalletConfig);
await smartWallet.init();
```

### Get Smart Wallet Contract [Gnosis Safe Proxy] Address

```
const smartWalletContractAddress = smartWallet.getAddress();
```

### Helper Functions

```
const isSmartWalletAlreadyDeployed = await smartWallet.isDeployed();
const isSmartWalletAlreadyInitialized = smartWallet.isInitialized();
```

### Send Transaction

Sponsored Transaction that is sent through EOA's Gnosis Safe Proxy

```
const { taskId } = await smartWallet.sendTransaction("TO_ADDRESS", "DATA");
```
