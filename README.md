# Gelato Account Abstraction
Gelato's Account Abstraction implementation consists of 3 packages:

## [Gelato Smart Wallet SDK](./packages/smart-wallet/README.md)
An account abstraction implementation that creates and uses EOA-owned Gnosis Safe Proxies, and relays the transactions using Gelato's 1Balance Service where the transactions can be sponsored by the Dapps.

## [Gelato Login SDK](./packages/gelato-login/README.md)
Web3Auth wrapper, ready-to-use and pluggable auth infrastructure for Web3 wallets and applications. Gelato Login provides Dapps the support of all social logins, and passwordless onboarding.

## [Gelato Smart Login SDK](./packages/gelato-smart-login/README.md)
Combines both Gelato Smart Wallet SDK and Gelato Login SDK.