import {
  GelatoSmartWallet,
  SmartWalletConfig,
} from "@gelatonetwork/account-abstraction";
import { GelatoLogin } from "@gelatonetwork/login";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";

export type GelatoSmartWalletInterface = InstanceType<typeof GelatoSmartWallet>;

export class GelatoSmartLogin extends GelatoLogin {
  #apiKey: string;
  #smartWallet: GelatoSmartWallet | null = null;
  #gelatoRelay: GelatoRelay;

  constructor(chainId = 1, smartWalletConfig: SmartWalletConfig) {
    super(chainId);
    this.#gelatoRelay = new GelatoRelay();
    this.#apiKey = smartWalletConfig.apiKey;
  }

  async init(): Promise<void> {
    const isNetworkSupported = await this.#gelatoRelay.isNetworkSupported(
      this._chainId
    );
    if (!isNetworkSupported) {
      throw new Error(`Chain Id [${this._chainId}] is not supported`);
    }
    await super.init();
    if (this._web3Auth?.provider) {
      await this._initializeSmartWallet();
    }
  }

  async login(): Promise<SafeEventEmitterProvider> {
    const provider = await super.login();
    await this._initializeSmartWallet();
    return provider;
  }

  getSmartWallet(): GelatoSmartWallet {
    if (!this._provider || !this.#smartWallet) {
      throw new Error("Gelato Login is not connected");
    }
    return this.#smartWallet;
  }

  private async _initializeSmartWallet(): Promise<void> {
    if (!this._provider) {
      throw new Error("Gelato Login is not connected");
    }
    const smartWallet = new GelatoSmartWallet(this._provider, {
      apiKey: this.#apiKey,
    });
    await smartWallet.init();
    this.#smartWallet = smartWallet;
  }
}
