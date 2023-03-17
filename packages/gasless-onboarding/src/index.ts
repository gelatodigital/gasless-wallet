// Web3Auth Dependencies
import { Web3Auth } from "@web3auth/modal";
import {
  CHAIN_NAMESPACES,
  UserInfo,
  SafeEventEmitterProvider,
} from "@web3auth/base";

// Web3Auth Adapters
import {
  OpenloginAdapter,
  OpenloginAdapterOptions,
} from "@web3auth/openlogin-adapter";
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
import { ErrorTypes, GaslessOnboardingError } from "./errors";
import { getSignatures } from "./utils";

export type GaslessWalletInterface = InstanceType<typeof GaslessWallet>;
export { LoginConfig, GaslessWalletConfig, GaslessOnboardingError, ErrorTypes };

const CLIENT_ID =
  "BEfbM81WrVzaSbV7oZTCt3B47ttTgFIdFkTD7VAvwAzm0My7fBGg--GGruerQ8NK2HvnmjHbeT2skbLUe187GF0";

export class GaslessOnboarding {
  #chainId: number;
  #web3Auth: Web3Auth | null = null;
  #provider: SafeEventEmitterProvider | null = null;
  #loginConfig: Required<LoginConfig>;
  #apiKey: string | undefined;
  #gaslessWallet: GaslessWallet | null = null;
  #gelatoRelay: GelatoRelay;

  /**
   * @param {LoginConfig} loginConfig - The configuration for Web3Auth
   * @param {GaslessWalletConfig} gaslessWalletConfig - The configuration for the Gasless Wallet
   *
   */
  constructor(
    loginConfig: LoginConfig,
    gaslessWalletConfig: GaslessWalletConfig
  ) {
    this.#chainId = loginConfig.chain.id;
    this.#loginConfig = {
      domains: loginConfig.domains,
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

  /**
   * Initiates the GaslessOnboarding instance, required before invoking the other methods
   *
   */
  async init(): Promise<void> {
    const isNetworkSupported = await this.#gelatoRelay.isNetworkSupported(
      this.#chainId
    );
    if (!isNetworkSupported) {
      throw new GaslessOnboardingError(
        ErrorTypes.UnsupportedNetwork,
        `Chain Id [${this.#chainId}]`
      );
    }
    const originData = this.#loginConfig.domains.length
      ? await getSignatures(this.#loginConfig.domains)
      : {};
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

    const loginSettings: OpenloginAdapterOptions["loginSettings"] = this
      .#loginConfig.openLogin.redirectUrl
      ? {
          mfaLevel: this.#loginConfig.openLogin.mfa,
          redirectUrl: this.#loginConfig.openLogin.redirectUrl,
        }
      : { mfaLevel: this.#loginConfig.openLogin.mfa };

    const openloginAdapter = new OpenloginAdapter({
      loginSettings,
      adapterSettings: {
        uxMode: "redirect",
        whiteLabel: {
          name: "Gelato",
          defaultLanguage: "en",
          dark: this.#loginConfig.ui.theme === "dark" ? true : false,
          theme: { primary: "#b45f63" },
        },
        originData,
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

  /**
   * @returns {SafeEventEmitterProvider | null} The SafeEventEmitterProvider object or null if the user is not logged in yet
   *
   */
  getProvider(): SafeEventEmitterProvider | null {
    return this.#provider;
  }

  /**
   * @returns {Promise<Partial<UserInfo>>} The user information if logged in with social media accounts
   *
   */
  async getUserInfo(): Promise<Partial<UserInfo>> {
    if (!this.#web3Auth) {
      throw new GaslessOnboardingError(ErrorTypes.OnboardingNotInitiated);
    }
    return await this.#web3Auth.getUserInfo();
  }

  /**
   * Pops up the login modal
   * @returns {Promise<SafeEventEmitterProvider>} The SafeEventEmitterProvider object
   *
   */
  async login(): Promise<SafeEventEmitterProvider> {
    if (!this.#web3Auth) {
      throw new GaslessOnboardingError(ErrorTypes.OnboardingNotInitiated);
    }
    const provider = await this.#web3Auth.connect();
    if (!provider) {
      throw new GaslessOnboardingError(ErrorTypes.LoginFailed);
    }
    this.#provider = provider;
    await this._initializeGaslessWallet();
    return provider;
  }

  /**
   * Logs the user out, clears the cache
   *
   */
  async logout(): Promise<void> {
    if (!this.#web3Auth) {
      throw new GaslessOnboardingError(ErrorTypes.OnboardingNotInitiated);
    }
    await this.#web3Auth.logout();
    this.#web3Auth.clearCache();
    this.#provider = null;
  }

  /**
   * @returns {GaslessWallet} The GaslessWallet of the user
   *
   */
  getGaslessWallet(): GaslessWallet {
    if (!this.#provider || !this.#gaslessWallet) {
      throw new GaslessOnboardingError(ErrorTypes.NotLoggedIn);
    }
    return this.#gaslessWallet;
  }

  private async _initializeGaslessWallet(): Promise<void> {
    if (!this.#provider) {
      throw new GaslessOnboardingError(ErrorTypes.NotLoggedIn);
    }
    const gaslessWallet = new GaslessWallet(this.#provider, {
      apiKey: this.#apiKey,
    });
    await gaslessWallet.init();
    this.#gaslessWallet = gaslessWallet;
  }
}
