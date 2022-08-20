export const fetchBalances = (account: string, tokenAddress: string) => {
  const alchemyKey = 'kmMb00nhQ0SWModX6lJLjXy_pVtiQnjx';
  const url = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  const rpcRequest = JSON.stringify({
    jsonrpc: '2.0',
    method: 'alchemy_getTokenBalances',
    headers: {
      'Content-Type': 'application/json',
    },
    params: [account, [tokenAddress]],
    id: 1,
  });
  const options = {
    method: 'POST',
    body: rpcRequest,
    redirect: 'follow',
  } as const;
  const response = await fetch(url, options);
  const body = await response.json();
  const result = body.result;
  const balance = result.tokenBalances[0].tokenBalance;
  return balance;
};
