import { ERROR_DETAILS } from "./details";
import { ErrorTypes } from "./types";

export class GaslessWalletError extends Error {
  name: ErrorTypes;
  message: string;
  constructor(name: ErrorTypes, customMessage?: string) {
    super();
    this.name = name;
    this.message = customMessage
      ? `${ERROR_DETAILS[name]} | ${customMessage}`
      : `${ERROR_DETAILS[name]}`;
  }
}
