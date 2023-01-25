# Gelato Login

SDK to directly import [web3Auth](https://web3auth.io/) features such as social logins and passwordless onboarding

## Installation

`yarn add @gelatonetwork/login`

`npm install @gelatonetwork/login`

## Usage

### Imports

```
import { GelatoLogin } from "@gelatonetwork/login";
```

### Initialization

```
const gelatoLogin = new GelatoLogin(CHAIN_ID)
await gelatoLogin.init()
```

### Get Provider

```
gelatoLogin.getProvider()
```

### Get User Info
Returns optional user info such as email, name, profileImage if logged in with Social Media Accounts

```
await gelatoLogin.getUserInfo();
```

### Login & Logout

```
await gelatoLogin.login();
await gelatoLogin.logout();
```
