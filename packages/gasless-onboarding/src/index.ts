// Web3Auth Dependencies
import { Web3Auth } from "@web3auth/modal";
import {
  CHAIN_NAMESPACES,
  UserInfo,
  SafeEventEmitterProvider,
} from "@web3auth/base";

// Web3Auth Adapters
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

// Gasless-Wallet
import {
  GaslessWallet,
  GaslessWalletConfig,
} from "@gelatonetwork/gasless-wallet";

// Gelato Relay SDK
import { GelatoRelay } from "@gelatonetwork/relay-sdk";

// Others
import { ethers } from "ethers";
import { LoginConfig } from "./types";

export type GaslessWalletInterface = InstanceType<typeof GaslessWallet>;
export { LoginConfig, GaslessWalletConfig };

const CLIENT_ID =
  "BEfbM81WrVzaSbV7oZTCt3B47ttTgFIdFkTD7VAvwAzm0My7fBGg--GGruerQ8NK2HvnmjHbeT2skbLUe187GF0";

export class GaslessOnboarding {
  #chainId: number;
  #web3Auth: Web3Auth | null = null;
  #provider: SafeEventEmitterProvider | null = null;
  #loginConfig: Required<LoginConfig>;
  #apiKey: string;
  #gaslessWallet: GaslessWallet | null = null;
  #gelatoRelay: GelatoRelay;

  constructor(
    loginConfig: LoginConfig,
    gaslessWalletConfig: GaslessWalletConfig
  ) {
    this.#chainId = loginConfig.chain.id;
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
    this.#gelatoRelay = new GelatoRelay();
    this.#apiKey = gaslessWalletConfig.apiKey;
  }

  async init(): Promise<void> {
    const isNetworkSupported = await this.#gelatoRelay.isNetworkSupported(
      this.#chainId
    );
    if (!isNetworkSupported) {
      throw new Error(`Chain Id [${this.#chainId}] is not supported`);
    }
    const web3Auth = new Web3Auth({
      clientId: CLIENT_ID,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: ethers.utils.hexValue(this.#chainId),
        rpcTarget: this.#loginConfig.chain.rpcUrl,
      },
      uiConfig: {
        appName: "Gelato",
        theme: this.#loginConfig.ui.theme,
        loginMethodsOrder: ["google"],
        defaultLanguage: "en",
      },
      web3AuthNetwork: "cyan",
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
      this.#provider = web3Auth.provider;
      await this._initializeGaslessWallet();
    }
    this.#web3Auth = web3Auth;
  }

  getProvider(): SafeEventEmitterProvider | null {
    return this.#provider;
  }

  async getUserInfo(): Promise<Partial<UserInfo>> {
    if (!this.#web3Auth) {
      throw new Error("GaslessOnboarding is not initialized yet");
    }
    return await this.#web3Auth.getUserInfo();
  }

  async login(): Promise<SafeEventEmitterProvider> {
    if (!this.#web3Auth) {
      throw new Error("GaslessOnboarding is not initialized yet");
    }
    const provider = await this.#web3Auth.connect();
    if (!provider) {
      throw new Error("Could not be logged in with Gasless Onboarding");
    }
    this.#provider = provider;
    await this._initializeGaslessWallet();
    return provider;
  }

  async logout(): Promise<void> {
    if (!this.#web3Auth) {
      throw new Error("GaslessOnboarding is not initialized yet");
    }
    await this.#web3Auth.logout();
    this.#web3Auth.clearCache();
    this.#provider = null;
  }

  getGaslessWallet(): GaslessWallet {
    if (!this.#provider || !this.#gaslessWallet) {
      throw new Error("Not logged in with Gasless Onboarding");
    }
    return this.#gaslessWallet;
  }

  private async _initializeGaslessWallet(): Promise<void> {
    if (!this.#provider) {
      throw new Error("Not logged in with Gasless Onboarding");
    }
    const gaslessWallet = new GaslessWallet(this.#provider, {
      apiKey: this.#apiKey,
    });
    await gaslessWallet.init();
    this.#gaslessWallet = gaslessWallet;
  }
}
