import { GelatoRelay, RelayResponse } from "@gelatonetwork/relay-sdk";
import { BigNumber, BigNumberish, BytesLike, ethers } from "ethers";

import {
  EIP712_SAFE_TX_TYPES,
  SALT,
  SIGNED_TYPE_DATA_METHOD,
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
import { ErrorTypes, GaslessWalletError } from "./errors";
import { OperationType, SafeTxTypedData, TransactionData } from "./types";
import { getMultiCallContractAddress } from "./utils";
import { getSafeContractAddresses, SafeAddressBook } from "./utils";

export { ErrorTypes, GaslessWalletError };

type EoaProvider =
  | ethers.providers.ExternalProvider
  | ethers.providers.JsonRpcFetchFunc;

export interface GaslessWalletConfig {
  apiKey?: string;
}
export class GaslessWallet {
  readonly #provider: ethers.providers.Web3Provider;
  #gelatoRelay: GelatoRelay;
  #address: string | undefined;
  #chainId: number | undefined;
  #apiKey: string | undefined;
  #isInitiated = false;
  #safeAddressBook: SafeAddressBook | undefined;

  // Contract Interfaces
  readonly #gnosisSafeInterface: GnosisSafeInterface =
    GnosisSafe__factory.createInterface();
  readonly #gnosisSafeProxyFactoryInterface: GnosisSafeProxyFactoryInterface =
    GnosisSafeProxyFactory__factory.createInterface();
  readonly #multiCallInterface: MultiCallInterface =
    MultiCall__factory.createInterface();

  /**
   * @param {EoaProvider} eoaProvider - The EOA Provider
   * @param {GaslessWalletConfig} config - The configuration for the Gasless Wallet
   *
   */
  constructor(eoaProvider: EoaProvider, config: GaslessWalletConfig) {
    this.#gelatoRelay = new GelatoRelay();
    this.#provider = new ethers.providers.Web3Provider(eoaProvider);
    this.#apiKey = config.apiKey;
  }

  /**
   * Initiates the GaslessWallet, required before invoking the other methods
   *
   */
  public async init(): Promise<void> {
    this.#chainId = (await this.#provider.getNetwork()).chainId;
    if (!this.#chainId) {
      throw new GaslessWalletError(
        ErrorTypes.WalletNotInitiated,
        `Chain Id is not found`
      );
    }
    const isNetworkSupported = await this.#gelatoRelay.isNetworkSupported(
      this.#chainId
    );
    if (!isNetworkSupported) {
      throw new GaslessWalletError(
        ErrorTypes.UnsupportedNetwork,
        `Chain Id [${this.#chainId}]`
      );
    }
    this.#safeAddressBook = getSafeContractAddresses(this.#chainId);
    this.#address = await this._calculateSmartWalletAddress();
    if (!this.#address) {
      throw new GaslessWalletError(
        ErrorTypes.WalletNotInitiated,
        `Address could not be predicted`
      );
    }
    this.#isInitiated = true;
  }

  /**
   * @returns {boolean} Whether the init function of the GaslessWallet was invoked or not
   *
   */
  public isInitiated(): boolean {
    return this.#isInitiated;
  }

  /**
   * @returns {string} The address of the GaslessWallet
   *
   */
  public getAddress(): string {
    if (!this.#address) {
      throw new GaslessWalletError(ErrorTypes.WalletNotInitiated);
    }
    return this.#address;
  }

  /**
   * @returns {Promise<boolean>} Whether the GaslessWallet has already been deployed or not
   *
   */
  public async isDeployed(): Promise<boolean> {
    if (!this.isInitiated() || !this.#address || !this.#chainId) {
      throw new GaslessWalletError(ErrorTypes.WalletNotInitiated);
    }
    try {
      await GnosisSafe__factory.connect(
        this.#address,
        this.#provider
      ).deployed();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Populates the transaction data for relaying
   * @param {string} to - The target address
   * @param {string} data - The transaction data
   * @param {BigNumberish} [value] - Optional value for payable
   * @returns {Promise<TransactionData>} TransactionData
   *
   */
  public async populateSponsorTransaction(
    to: string,
    data: string,
    value: BigNumberish = 0
  ): Promise<TransactionData> {
    if (!this.isInitiated() || !this.#address || !this.#chainId) {
      throw new GaslessWalletError(ErrorTypes.WalletNotInitiated);
    }
    if (await this.isDeployed()) {
      return {
        chainId: this.#chainId,
        target: this.#address,
        data: await this._getExecTransactionData(to, data, value),
      };
    }
    const calls: Multicall2.CallStruct[] = [
      {
        target: this.#safeAddressBook!.gnosisSafeProxyFactory,
        callData: await this._getCreateProxyData(),
      },
      {
        target: this.#address,
        callData: await this._getExecTransactionData(to, data, value),
      },
    ];
    const multiCallData = this.#multiCallInterface.encodeFunctionData(
      "aggregate",
      [calls]
    );
    return {
      chainId: this.#chainId,
      target: getMultiCallContractAddress(this.#chainId),
      data: multiCallData,
    };
  }

  /**
   * Relays the transaction with the provided data to the target address by using Gelato's 1Balance
   * @param {string} to - The target address
   * @param {string} data - The transaction data
   * @param {BigNumberish} [value] - Optional value for payable
   * @returns {Promise<RelayResponse>} Response object with taskId parameter
   *
   */
  public async sponsorTransaction(
    to: string,
    data: string,
    value: BigNumberish = 0
  ): Promise<RelayResponse> {
    if (!this.#apiKey) {
      throw new GaslessWalletError(ErrorTypes.ApiKeyNotProvided);
    }
    const {
      chainId,
      data: populatedData,
      target,
    } = await this.populateSponsorTransaction(to, data, value);
    return await this.#gelatoRelay.sponsoredCall(
      {
        chainId,
        target,
        data: populatedData,
      },
      this.#apiKey
    );
  }

  private async _getExecTransactionData(
    to: string,
    data: string,
    value: BigNumberish
  ) {
    const signature = await this._getSignature(to, data, value);
    return this.#gnosisSafeInterface.encodeFunctionData("execTransaction", [
      to,
      value,
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

  private async _getSignature(to: string, data: string, value: BigNumberish) {
    return await this.#provider.send(SIGNED_TYPE_DATA_METHOD, [
      await this.#provider.getSigner().getAddress(),
      JSON.stringify(
        this._getSignTypedData(to, data, value, await this._getNonce())
      ),
    ]);
  }

  private _getSignTypedData = (
    to: string,
    data: string,
    value: BigNumberish,
    nonce: number
  ): SafeTxTypedData => {
    return {
      types: EIP712_SAFE_TX_TYPES,
      domain: {
        chainId: this.#chainId,
        verifyingContract: this.#address!,
      },
      primaryType: "SafeTx",
      message: {
        to,
        value: BigNumber.from(value).toString(),
        data,
        operation: OperationType.Call,
        safeTxGas: BigNumber.from(0).toString(),
        baseGas: BigNumber.from(0).toString(),
        gasPrice: BigNumber.from(0).toString(),
        gasToken: ZERO_ADDRESS,
        refundReceiver: ZERO_ADDRESS,
        nonce: BigNumber.from(nonce).toString(),
      },
    };
  };

  private _getNonce = async (): Promise<number> => {
    return (await this.isDeployed())
      ? (
          await GnosisSafe__factory.connect(
            this.#address!,
            this.#provider
          ).nonce()
        ).toNumber()
      : 0;
  };

  private async _getCreateProxyData(): Promise<string> {
    return this.#gnosisSafeProxyFactoryInterface.encodeFunctionData(
      "createProxyWithNonce",
      [
        this.#safeAddressBook!.gnosisSafe,
        await this._getSafeInitializer(),
        BigNumber.from(SALT),
      ]
    );
  }

  private async _calculateSmartWalletAddress(): Promise<string> {
    const deploymentCode = ethers.utils.solidityPack(
      ["bytes", "uint256"],
      [
        await GnosisSafeProxyFactory__factory.connect(
          this.#safeAddressBook!.gnosisSafeProxyFactory,
          this.#provider
        ).proxyCreationCode(),
        this.#safeAddressBook!.gnosisSafe,
      ]
    );
    const salt = ethers.utils.solidityKeccak256(
      ["bytes32", "uint256"],
      [
        ethers.utils.solidityKeccak256(
          ["bytes"],
          [await this._getSafeInitializer()]
        ),
        SALT,
      ]
    );
    return ethers.utils.getCreate2Address(
      this.#safeAddressBook!.gnosisSafeProxyFactory,
      salt,
      ethers.utils.keccak256(deploymentCode)
    );
  }

  private async _getSafeInitializer(): Promise<string> {
    const owner = await this.#provider.getSigner().getAddress();
    return this.#gnosisSafeInterface.encodeFunctionData("setup", [
      [owner],
      BigNumber.from(1),
      ZERO_ADDRESS,
      "0x",
      this.#safeAddressBook!.fallbackHandler,
      ZERO_ADDRESS,
      BigNumber.from(0),
      ZERO_ADDRESS,
    ]);
  }
}
