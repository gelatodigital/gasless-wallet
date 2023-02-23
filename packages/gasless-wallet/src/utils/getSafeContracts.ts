export interface SafeAddressBook {
  gnosisSafe: string;
  gnosisSafeProxyFactory: string;
  fallbackHandler: string;
}

export const getSafeContractAddresses = (chainId: number): SafeAddressBook => {
  switch (chainId) {
    case 1:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 5:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 10:
      return {
        fallbackHandler: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        gnosisSafe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
        gnosisSafeProxyFactory: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
      };
    case 56:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 100:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 137:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 250:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 420:
      return {
        fallbackHandler: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        gnosisSafe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
        gnosisSafeProxyFactory: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
      };
    case 1284:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 1285:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 42161:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 43114:
      return {
        fallbackHandler: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        gnosisSafe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
        gnosisSafeProxyFactory: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
      };
    case 80001:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    case 84531:
      return {
        fallbackHandler: "0x017062a1dE2FE6b99BE3d9d37841FeD19F573804",
        gnosisSafe: "0x69f4D1788e39c87893C980c06EdF4b7f686e2938",
        gnosisSafeProxyFactory: "0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC",
      };
    case 421613:
      return {
        fallbackHandler: "0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4",
        gnosisSafe: "0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552",
        gnosisSafeProxyFactory: "0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2",
      };
    default:
      throw new Error(
        `Gnosis Safe Contracts are not yet available on chainId[${chainId}] on the Gasless Wallet`
      );
  }
};
