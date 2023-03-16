// Migration Contract: Updates the implementation contract of Gnosis Safe Proxy to the singleton: 0x69f4D1788e39c87893C980c06EdF4b7f686e2938
export const getMigrationContract = (chainId: number) => {
  switch (chainId) {
    case 10:
      return "0x9593C4c2B78f0d393e933870FBfb585b893eFD4B";
    case 420:
      return "0x9593C4c2B78f0d393e933870FBfb585b893eFD4B";
    case 43114:
      return "0x9593C4c2B78f0d393e933870FBfb585b893eFD4B";
    case 84531:
      return "0xd22f6980eD48b3dbB27f758eAE965C60f072ED8F";
    default:
      throw new Error(
        `Migration Contract is not available on chainId[${chainId}]`
      );
  }
};
