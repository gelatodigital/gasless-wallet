import axios from "axios";
import { GaslessOnboardingError, ErrorTypes } from "../errors";
import { getHttpErrorMessage } from "../utils";

const GASLESS_WALLET_BACKEND = "https://gasless-wallet-api.prod.gelato.digital";

export const getSignatures = async (
  domains: string[]
): Promise<{ [domain: string]: string }> => {
  try {
    return (
      await axios.post<{ [domain: string]: string }>(
        `${GASLESS_WALLET_BACKEND}/whitelist`,
        { domains }
      )
    ).data;
  } catch (error) {
    throw new GaslessOnboardingError(
      ErrorTypes.ServerError,
      getHttpErrorMessage(error)
    );
  }
};
