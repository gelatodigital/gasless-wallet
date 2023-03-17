import { ErrorTypes } from "./types";

export const ERROR_DETAILS: { [error in ErrorTypes]: string } = {
  UnsupportedNetwork: "Network is not supported",
  WalletNotInitiated: "Wallet is not initiated",
  ApiKeyNotProvided: "Api Key is not provided in the configuration",
};
