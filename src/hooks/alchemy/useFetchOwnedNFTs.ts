import { useEffect, useState } from 'react';

const fetchNFTs = async (owner: string) => {
  const alchemyKey = 'kmMb00nhQ0SWModX6lJLjXy_pVtiQnjx';
  const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${alchemyKey}/getNFTs`;
  const response = await fetch(url + '?' + new URLSearchParams({ owner }));
  const body = await response.json();
  return body;
};

export interface OwnedNFTsResult {
  ownedNfts: {
    contract: {
      address: string;
    };
    id: {
      tokenId: string;
      tokenMetadata: {
        tokenType: string;
      };
    };
    media: {
      gateway: string;
    }[];
    metadata: {
      name: string;
    };
  }[];
}

export const useFetchOwnedNFTs = (
  owner: string
): { isLoading: boolean; isError: boolean; nfts: OwnedNFTsResult | null } => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [nfts, setNfts] = useState<OwnedNFTsResult | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchNFTs(owner)
      .then((nfts) => {
        setNfts(nfts);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching NFTs for owner', owner, err);
        setIsError(true);
      });
  }, [owner]);

  return { isLoading, isError, nfts };
};

export const onlyWithImages = (nfts: OwnedNFTsResult): OwnedNFTsResult => {
  return {
    ownedNfts: nfts.ownedNfts.filter((ownedNft) => {
      return Boolean(getImageUrl(ownedNft));
    }),
  };
};

export const getImageUrl = (nft: {
  media: { gateway: string }[];
}): string | undefined => {
  for (const { gateway } of nft.media) {
    if (gateway.length > 0) return gateway;
  }
  return undefined;
};

export const arrayToRows = <T>(arr: T[], rowLength: number): Array<T>[] => {
  const result = [];
  for (let i = 0; i < arr.length; i += rowLength) {
    result.push(arr.slice(i, i + rowLength));
  }
  return result;
};
