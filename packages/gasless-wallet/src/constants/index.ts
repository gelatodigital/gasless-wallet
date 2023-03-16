import { SafeAddressBook } from "../utils";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const SALT = 9314704;
export const SIGNED_TYPE_DATA_METHOD = "eth_signTypedData_v4";

export const EIP712_SAFE_TX_TYPES = {
  EIP712Domain: [
    {
      type: "uint256",
      name: "chainId",
    },
    {
      type: "address",
      name: "verifyingContract",
    },
  ],
  SafeTx: [
    { type: "address", name: "to" },
    { type: "uint256", name: "value" },
    { type: "bytes", name: "data" },
    { type: "uint8", name: "operation" },
    { type: "uint256", name: "safeTxGas" },
    { type: "uint256", name: "baseGas" },
    { type: "uint256", name: "gasPrice" },
    { type: "address", name: "gasToken" },
    { type: "address", name: "refundReceiver" },
    { type: "uint256", name: "nonce" },
  ],
};

export const DEFAULT_SAFE_ADDRESS_BOOK: SafeAddressBook = {
  fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
  gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
  gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
};
