export enum OperationType {
  Call,
  DelegateCall,
}

export interface SafeTxTypedData {
  types: Eip712MessageTypes;
  domain: {
    chainId?: number;
    verifyingContract: string;
  };
  primaryType: "SafeTx";
  message: {
    to: string;
    value: string;
    data: string;
    operation: OperationType;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    gasToken: string;
    refundReceiver: string;
    nonce: string;
  };
}

interface Eip712MessageTypes {
  EIP712Domain: {
    type: string;
    name: string;
  }[];
  SafeTx: {
    type: string;
    name: string;
  }[];
}

export interface TransactionData {
  chainId: number;
  target: string;
  data: string;
}
