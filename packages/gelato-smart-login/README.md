# Gelato Smart Login

SDK to directly import [web3Auth](https://web3auth.io/) features such as social logins and passwordless onboarding, as well as the smart contract wallet integration 

## Installation

`yarn add @gelatonetwork/smart-login`

`npm install @gelatonetwork/smart-login`

## Usage

### Imports

```
import {
  GelatoSmartLogin,
  GelatoSmartWalletInterface,
} from "@gelatonetwork/smart-login";
```

### Initialization

```
const gelatoSmartLogin = new GelatoSmartLogin(CHAIN_ID, {
    apiKey: "1BALANCE_API_KEY",
});
await gelatoSmartLogin.init()
```

### Get Smart Wallet
For all smart contract wallet methods and functionality, please go to [smart-wallet](../smart-wallet/README.md) package
```
const smartWallet: GelatoSmartWalletInterface = gelatoSmartLogin.getSmartWallet()
```

### Get Provider

```
gelatoSmartLogin.getProvider()
```

### Get User Info
Returns optional user info such as email, name, profileImage if logged in with Social Media Accounts

```
await gelatoSmartLogin.getUserInfo();
```

### Login & Logout

```
await gelatoSmartLogin.login();
await gelatoSmartLogin.logout();
```
