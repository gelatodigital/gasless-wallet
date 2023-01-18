import { GelatoRelay, RelayResponse } from "@gelatonetwork/relay-sdk";
import { BigNumber, BytesLike, ethers } from "ethers";
import {
  EIP712_SAFE_TX_TYPE,
  FALLBACK_HANDLER_ADDRESS,
  GNOSIS_SAFE,
  GNOSIS_SAFE_PROXY_FACTORY,
  SALT,
  ZERO_ADDRESS,
} from "./constants";
import {
  GnosisSafeProxyFactory__factory,
  GnosisSafe__factory,
  MultiCall__factory,
} from "./contracts/types";
import { GnosisSafeInterface } from "./contracts/types/GnosisSafe";
import { GnosisSafeProxyFactoryInterface } from "./contracts/types/GnosisSafeProxyFactory";
import { MultiCallInterface, Multicall2 } from "./contracts/types/MultiCall";
import { adjustVInSignature, getMultiCallContractAddress } from "./utils";

export interface SmartWalletConfig {
  apiKey: string;
}
export class GelatoSmartWallet {
  private readonly _provider: ethers.providers.Web3Provider;
  private _gelatoRelay: GelatoRelay;
  private _address: string | undefined;
  private _chainId: number | undefined;
  private _apiKey: string;
  private _isInitialized: boolean = false;

  // Contract Interfaces
  private readonly _gnosisSafeInterface: GnosisSafeInterface =
    GnosisSafe__factory.createInterface();
  private readonly _gnosisSafeProxyFactoryInterface: GnosisSafeProxyFactoryInterface =
    GnosisSafeProxyFactory__factory.createInterface();
  private readonly _multiCallInterface: MultiCallInterface =
    MultiCall__factory.createInterface();

  constructor(
    eoaProvider:
      | ethers.providers.ExternalProvider
      | ethers.providers.JsonRpcFetchFunc,
    config: SmartWalletConfig
  ) {
    this._gelatoRelay = new GelatoRelay();
    this._provider = new ethers.providers.Web3Provider(eoaProvider);
    this._apiKey = config.apiKey;
  }

  public async init() {
    this._address = await this._calculateSmartWalletAddress();
    this._chainId = (await this._provider.getNetwork()).chainId;
    if (!this._address || !this._chainId) {
      throw new Error(
        `GelatoSmartWallet could not be initialized: address[${this._address}] chainId[${this._chainId}]`
      );
    }
    this._isInitialized = true;
    console.log("GelatoSmartWallet is initialized");
  }

  public isInitialized(): boolean {
    return this._isInitialized;
  }

  public getAddress() {
    return this._address;
  }

  public async isDeployed() {
    return await this._checkIfDeployed();
  }

  public async sendTransaction(
    to: string,
    data: string
  ): Promise<RelayResponse> {
    if (!this.isInitialized() || !this._address || !this._chainId) {
      throw new Error("GelatoSmartWallet is not initialized");
    }
    if (await this._checkIfDeployed()) {
      return await this._gelatoRelay.sponsoredCall(
        {
          chainId: this._chainId,
          target: this._address,
          data: await this._getExecTransactionData(to, data),
        },
        this._apiKey
      );
    }
    console.log("Deploying Safe and Executing Transaction");
    const calls: Multicall2.CallStruct[] = [
      {
        target: GNOSIS_SAFE_PROXY_FACTORY,
        callData: await this._getCreateProxyData(),
      },
      {
        target: this._address,
        callData: await this._getExecTransactionData(to, data),
      },
    ];
    const multiCallData = this._multiCallInterface.encodeFunctionData(
      "aggregate",
      [calls]
    );
    return await this._gelatoRelay.sponsoredCall(
      {
        chainId: this._chainId,
        target: getMultiCallContractAddress(this._chainId),
        data: multiCallData,
      },
      this._apiKey
    );
  }

  private async _getExecTransactionData(to: string, data: string) {
    const signature = await this._getSignedTransactionHash(to, data);
    return this._gnosisSafeInterface.encodeFunctionData("execTransaction", [
      to,
      0, //TODO: Should we enable this??
      data as BytesLike,
      0,
      0,
      0,
      0,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      signature,
    ]);
  }

  private async _getSignedTransactionHash(to: string, data: string) {
    const nonce = (await this.isDeployed())
      ? (
          await GnosisSafe__factory.connect(
            this._address!,
            this._provider
          ).nonce()
        ).toNumber()
      : 0;
    const transactionHash = await this._getTransactionHash(to, data, nonce);
    const signedMessage = await this._provider
      .getSigner()
      .signMessage(ethers.utils.arrayify(transactionHash));
    return adjustVInSignature(signedMessage);
  }

  private async _getTransactionHash(to: string, data: string, nonce: number) {
    const safeTx = {
      to,
      value: 0,
      data,
      operation: 0,
      safeTxGas: 0,
      baseGas: 0,
      gasPrice: 0,
      gasToken: ZERO_ADDRESS,
      refundReceiver: ZERO_ADDRESS,
      nonce,
    };
    return ethers.utils._TypedDataEncoder.hash(
      { verifyingContract: this._address, chainId: this._chainId },
      EIP712_SAFE_TX_TYPE,
      safeTx
    );
  }

  private async _getCreateProxyData(): Promise<string> {
    return this._gnosisSafeProxyFactoryInterface.encodeFunctionData(
      "createProxyWithNonce",
      [GNOSIS_SAFE, await this._getInitializer(), BigNumber.from(SALT)]
    );
  }

  private async _checkIfDeployed(): Promise<boolean> {
    try {
      await GnosisSafe__factory.connect(
        this._address!,
        this._provider
      ).deployed();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async _calculateSmartWalletAddress(): Promise<string> {
    const deploymentCode = ethers.utils.solidityPack(
      ["bytes", "uint256"],
      [
        await GnosisSafeProxyFactory__factory.connect(
          GNOSIS_SAFE_PROXY_FACTORY,
          this._provider
        ).proxyCreationCode(),
        GNOSIS_SAFE,
      ]
    );
    const salt = ethers.utils.solidityKeccak256(
      ["bytes32", "uint256"],
      [
        ethers.utils.solidityKeccak256(
          ["bytes"],
          [await this._getInitializer()]
        ),
        SALT,
      ]
    );
    return ethers.utils.getCreate2Address(
      GNOSIS_SAFE_PROXY_FACTORY,
      salt,
      ethers.utils.keccak256(deploymentCode)
    );
  }

  private async _getInitializer(): Promise<string> {
    const owner = await this._provider.getSigner().getAddress();
    return this._gnosisSafeInterface.encodeFunctionData("setup", [
      [owner],
      BigNumber.from(1),
      ZERO_ADDRESS,
      "0x",
      FALLBACK_HANDLER_ADDRESS,
      ZERO_ADDRESS,
      BigNumber.from(0),
      ZERO_ADDRESS,
    ]);
  }
}
