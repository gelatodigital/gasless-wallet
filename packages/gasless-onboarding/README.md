# Gasless Onboarding

SDK to directly import [web3Auth](https://web3auth.io/) features such as social logins and passwordless onboarding, as well as the gasless wallet integration 

## Installation

`yarn add @gelatonetwork/gasless-onboarding`

`npm install @gelatonetwork/gasless-onboarding`

## Usage

### Imports

```
import {
  GaslessOnboarding,
  GaslessWalletConfig,
  GaslessWalletInterface,
  LoginConfig,
} from "@gelatonetwork/gasless-onboarding";
```

### Initialization

```
const gaslessWalletConfig: GaslessWalletConfig = { apiKey };
const loginConfig: LoginConfig = {
  chain: {
    id: CHAIN_ID,
    rpcUrl: RPC_URL,
  }
};
const gaslessOnboarding = new GaslessOnboarding(
  loginConfig,
  gaslessWalletConfig
);
await gaslessOnboarding.init();
```

### Get Gasless Wallet
For all gasless smart contract wallet methods and functionality, please go to [gasless-wallet](../gasless-wallet/) package
```
const gaslessWallet: GaslessWalletInterface = gaslessOnboarding.getGaslessWallet();
```

### Get Provider

```
gaslessOnboarding.getProvider();
```

### Get User Info
Returns optional user info such as email, name, profileImage if logged in with Social Media Accounts

```
await gaslessOnboarding.getUserInfo();
```

### Login & Logout

```
await gaslessOnboarding.login();
await gaslessOnboarding.logout();
```
