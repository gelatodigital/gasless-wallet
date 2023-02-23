export const getMultiCallContractAddress = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
    case 5:
      return "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
    case 10:
      return "0x2DC0E2aa608532Da689e89e237dF582B783E552C";
    case 56:
      return "0x38c4092b28dAB7F3d98eE6524549571c283cdfA5";
    case 100:
      return "0xebA27A2301975FF5BF7864b99F55A4f7A457ED10";
    case 137:
      return "0xa5b787b9489db81c0e1ef8e61de2067fbdc0db67";
    case 250:
      return "0xd62741AAe5Ac680229881251d62c1DB461C566A4";
    case 420:
      return "0xCf8EDB3333Fae73b23f689229F4De6Ac95d1f707";
    case 1284:
      return "0xDf592cB2d32445F8e831d211AB20D3233cA41bD8";
    case 1285:
      return "0xDf592cB2d32445F8e831d211AB20D3233cA41bD8";
    case 42161:
      return "0x842eC2c7D803033Edf55E478F461FC547Bc54EB2";
    case 43114:
      return "0x29b6603D17B9D8f021EcB8845B6FD06E1Adf89DE";
    case 80001:
      return "0x7De28d05a0781122565F3b49aA60331ced983a19";
    case 84531:
      return "0x215c8e18Ba753893288Af2635152C1F3c1955bf7";
    case 421613:
      return "0xCf8EDB3333Fae73b23f689229F4De6Ac95d1f707";
    default:
      throw new Error(
        `MultiCall Contract is not available on chainId[${chainId}]`
      );
  }
};
