import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import {
  CHAIN_NAMESPACES,
  UserInfo,
  SafeEventEmitterProvider,
} from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WalletConnectV1Adapter } from "@web3auth/wallet-connect-v1-adapter";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

const CLIENT_ID =
  "BPU_zyccFWrsXBgnXZ2M-7Jfh2coM1qomkE_J7empN9M-ReCY1ML4Z_Xs40KpWNKqqMajLVJCUFD5YSWuf9_1tc";

export class GelatoLogin {
  #chainId: number;
  protected _web3Auth: Web3Auth | null = null;
  protected _provider: SafeEventEmitterProvider | null = null;

  constructor(chainId = 1) {
    this.#chainId = chainId;
  }

  async init(): Promise<void> {
    const web3Auth = new Web3Auth({
      clientId: CLIENT_ID,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: ethers.utils.hexValue(this.#chainId),
      },
      uiConfig: {
        appName: "Gelato",
        theme: "dark",
        loginMethodsOrder: ["google"],
        defaultLanguage: "en",
      },
      web3AuthNetwork: "testnet",
    });

    const openloginAdapter = new OpenloginAdapter({
      loginSettings: {
        mfaLevel: "optional",
      },
      adapterSettings: {
        uxMode: "redirect",
        whiteLabel: {
          name: "Gelato",
          defaultLanguage: "en",
          dark: true,
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
