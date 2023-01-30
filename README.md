# Gelato Gasless Wallet

Gelato's Gasless Wallet implementation consists of 2 packages:

## [Gasless Wallet SDK](./packages/gasless-wallet/)

An account abstraction implementation that creates and uses EOA-owned Gnosis Safe Proxies, and relays the transactions using Gelato's 1Balance Service where the transactions can be sponsored by the Dapps.

## [Gasless Onboarding SDK](./packages/gasless-onboarding/)

Combines both Gasless Wallet SDK and Web3Auth.
