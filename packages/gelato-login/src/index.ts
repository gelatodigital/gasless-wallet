import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import {
  CHAIN_NAMESPACES,
  UserInfo,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter, LoginSettings } from "@web3auth/openlogin-adapter";
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

const CLIENT_ID =
  "BEfbM81WrVzaSbV7oZTCt3B47ttTgFIdFkTD7VAvwAzm0My7fBGg--GGruerQ8NK2HvnmjHbeT2skbLUe187GF0";

export interface LoginConfig {
  chain: { id: number; rpcUrl: string };
  ui?: {
    theme?: "light" | "dark";
  };
  openLogin?: {
    mfa?: LoginSettings["mfaLevel"];
    redirectUrl?: string;
  };
}

export interface LoginOptions {
web3AuthNetwork: 'testnet' | 'cyan',
client_id:string
}

export class GelatoLogin {
  protected _chainId: number;
  protected _web3Auth: Web3Auth | null = null;
  protected _provider: SafeEventEmitterProvider | null = null;
  #loginConfig: Required<LoginConfig>;

  constructor(loginConfig: LoginConfig) {
    this._chainId = loginConfig.chain.id;
    this.#loginConfig = {
      chain: {
        id: loginConfig.chain.id,
        rpcUrl: loginConfig.chain.rpcUrl,
      },
      ui: {
        theme: loginConfig.ui?.theme || "light",
      },
      openLogin: {
        mfa: loginConfig.openLogin?.mfa || undefined,
        redirectUrl: loginConfig.openLogin?.redirectUrl || undefined,
      },
    };
  }

  async init(loginOptions:LoginOptions): Promise<void> {
    const web3Auth = new Web3Auth({
      clientId: loginOptions.client_id,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: ethers.utils.hexValue(this._chainId),
        rpcTarget: this.#loginConfig.chain.rpcUrl,
      },
      uiConfig: {
        appName: "Gelato",
        theme: this.#loginConfig.ui.theme,
        loginMethodsOrder: ["google"],
        defaultLanguage: "en",
      },
      web3AuthNetwork: loginOptions.web3AuthNetwork,
    });

    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: this.#loginConfig.openLogin.mfa,
        redirectUrl: this.#loginConfig.openLogin.redirectUrl,
      },
      adapterSettings: {
        uxMode: "redirect",
        whiteLabel: {
          name: "Gelato",
          defaultLanguage: "en",
          dark: this.#loginConfig.ui.theme === "dark" ? true : false,
          theme: { primary: "#b45f63" },
        },
      },
    });

    const walletConnectV1Adapter = new WalletConnectV1Adapter({
      clientId: CLIENT_ID,
    });

    const metamaskAdapter = new MetamaskAdapter({
      clientId: CLIENT_ID,
    });

    web3Auth.configureAdapter(openloginAdapter);
    web3Auth.configureAdapter(walletConnectV1Adapter);
    web3Auth.configureAdapter(metamaskAdapter);
    await web3Auth.initModal();

    if (web3Auth.provider) {
      this._provider = web3Auth.provider;
    }
    this._web3Auth = web3Auth;
  }

  getProvider(): SafeEventEmitterProvider | null {
    return this._provider;
  }

  async getUserInfo(): Promise<Partial<UserInfo>> {
    if (!this._web3Auth) {
      throw new Error("Gelato Login is not initialized yet");
    }
    return await this._web3Auth.getUserInfo();
  }

  async login(): Promise<SafeEventEmitterProvider> {
    if (!this._web3Auth) {
      throw new Error("Gelato Login is not initialized yet");
    }
    const provider = await this._web3Auth.connect();
    if (!provider) {
      throw new Error("Gelato Login could not be connected");
    }
    this._provider = provider;
    return this._provider;
  }

  async logout(): Promise<void> {
    if (!this._web3Auth) {
      throw new Error("Gelato Login is not initialized yet");
    }
    await this._web3Auth.logout();
    this._web3Auth.clearCache();
    this._provider = null;
  }
}
