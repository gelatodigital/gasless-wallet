import { LoginSettings } from "@web3auth/openlogin-adapter";

export interface LoginConfig {
  chain: { id: number; rpcUrl: string };
  domains: string[];
  ui?: {
    theme?: "light" | "dark";
  };
  openLogin?: {
    mfa?: LoginSettings["mfaLevel"];
    redirectUrl?: string;
  };
}
