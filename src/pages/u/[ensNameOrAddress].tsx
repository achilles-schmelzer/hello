import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Avatar } from 'components/profiles/Avatar';
import {
  VerticalSpacer,
  HorizontalSpacer,
  FlexCol,
  FlexRow,
  FlexCenter,
} from 'elements';
import Loader from 'components/LoadingSpinner';
import {
  useRouterEnsData,
  LookupStatus,
  useFetchOwnedNFTs,
  onlyWithImages,
  getImageUrl,
  arrayToRows,
  useProfile,
  gatewayFromIpfs,
  isIpfsUrl,
} from 'hooks';
import { ethers } from 'ethers';
import Link from 'next/link';

interface WithName {
  name: string | null;
}

export default function Page() {
  const ensData = useRouterEnsData('ensNameOrAddress');

  if (ensData.status === LookupStatus.loading) {
    return <LoadingPage />;
  } else if (ensData.status === LookupStatus.failed) {
    return <FailedPage />;
  } else {
    return (
      <LoadedPage
        address={ensData.address}
        ensName={(ensData as WithName).name}
      />
    );
  }
}

const LoadedPage = ({
  address,
  ensName,
}: {
  address: string;
  ensName: string | null | undefined;
}): JSX.Element => {
  const { isLoading, nfts } = useFetchOwnedNFTs(address);
  const [imgIsLoaded, setImgIsLoaded] = useState<Record<string, boolean>>({});
  const [loadImages, setLoadImages] = useState<boolean>(false);
  const [nftRows, setNftRows] = useState<number>(1);

  useEffect(() => {
    setLoadImages(true);
  }, []);

  return (
    <Content>
      <FlexRow>
        <Avatar address={address} />
        <HorizontalSpacer size="l" />
        <FlexCol>
          <PushRight>
            <Link href={'/' + ensName || address}>Send a Message</Link>
          </PushRight>
          <h1>{ensName || 'No ENS Name Found'}</h1>
          <VerticalSpacer size="s" />
          <h3>{address}</h3>
        </FlexCol>
      </FlexRow>
      <VerticalSpacer size="l" />
      <h1>Web3 Identity</h1>
      <VerticalSpacer size="xl" />
      <LensProfile address={address} />
      <VerticalSpacer size="xl" />
      {isLoading || <h1>NFTs</h1>}
      {isLoading && <h1>Loading NFTs...</h1>}
      <VerticalSpacer size="m" />
      {loadImages &&
        nfts &&
        arrayToRows(onlyWithImages(nfts).ownedNfts, 4)
          .slice(0, nftRows)
          .map((row, i) => {
            return (
              <FlexRow key={i}>
                {row.map((data) => {
                  return (
                    <>
                      <Card key={data.id.tokenId}>
                        {imgIsLoaded[data.id.tokenId] || (
                          <FlexCenter
                            style={{ minWidth: '10rem', minHeight: '10rem' }}>
                            <Loader height={100} width={100} />
                          </FlexCenter>
                        )}
                        <a
                          style={{ cursor: 'pointer' }}
                          target="_blank"
                          href={`https://opensea.io/assets/ethereum/${
                            data.contract.address
                          }/${hexStringToDecimalString(data.id.tokenId)}`}
                          rel="noreferrer">
                          <HideOrBlock hide={!imgIsLoaded[data.id.tokenId]}>
                            <NFTImage
                              src={getImageUrl(data)}
                              alt="data.id.tokenId"
                              onLoad={() => {
                                setImgIsLoaded((state) => {
                                  return {
                                    ...state,
                                    [data.id.tokenId]: true,
                                  };
                                });
                              }}
                            />
                          </HideOrBlock>
                        </a>
                        <VerticalSpacer size="s" />
                        <MaxWidthSmall>
                          <NftName>{data.metadata.name}</NftName>
                        </MaxWidthSmall>
                        <VerticalSpacer size="l" />
                      </Card>
                      <HorizontalSpacer size="l" />
                    </>
                  );
                })}
              </FlexRow>
            );
          })}
      <VerticalSpacer size="l" />
      <MaxWidth>
        {nftRows * 4 < (nfts?.ownedNfts.length || Infinity) && (
          <button
            onClick={() => {
              setNftRows((num) => num + 2);
            }}>
            Load More
          </button>
        )}
        {nftRows * 4 < (nfts?.ownedNfts.length || Infinity) || (
          <button onClick={() => setNftRows((num) => num + 2)} disabled>
            All NFTs Loaded
          </button>
        )}
      </MaxWidth>
    </Content>
  );
};

const LensProfile = ({ address }: { address: string }): JSX.Element => {
  const { data, loading, error } = useProfile(address);
  const noProfile = loading || error || data.profiles.items.length === 0;

  if (loading) {
    return <h1>Loading lens profile data...</h1>;
  } else if (error) {
    return <h1>Failed to load lens profile data...</h1>;
  } else if (noProfile) {
    return <h3>No Lens Profile found. Go create one!</h3>;
  } else {
    const defaultProfile = data.profiles.items.find(
      (profile: { isDefault: boolean }) => profile.isDefault
    );
    const profile = defaultProfile || data.profiles.items[0];

    return (
      <FlexRow>
        <Card>
          <VerticalSpacer size="l" />
          <FlexRow>
            <NFTImage
              src={
                isIpfsUrl(profile.picture.original.url)
                  ? gatewayFromIpfs(profile.picture.original.url)
                  : profile.picture.original.url
              }
              alt="lens profile"
            />
            <HorizontalSpacer size="l" />
            <FlexCol>
              <h3>{profile.handle}</h3>
              <VerticalSpacer size="l" />
              <h4>{profile.name}</h4>
            </FlexCol>
          </FlexRow>
          <VerticalSpacer size="l" />
          <FlexRow>
            <MinWidth>
              <h5>Followers</h5>
            </MinWidth>
            <HorizontalSpacer size="l" />
            <p>{profile.stats.totalFollowers}</p>
          </FlexRow>
          <VerticalSpacer size="l" />
          <FlexRow>
            <MinWidth>
              <h5>Following</h5>
            </MinWidth>
            <HorizontalSpacer size="l" />
            <p>{profile.stats.totalFollowing}</p>
          </FlexRow>
          <VerticalSpacer size="l" />
          <FlexRow>
            <MinWidth>
              <h5>Posts</h5>
            </MinWidth>
            <HorizontalSpacer size="l" />
            <p>{profile.stats.totalPosts}</p>
          </FlexRow>
          <VerticalSpacer size="l" />
          <FlexRow>
            <MinWidth>
              <h5>Comments</h5>
            </MinWidth>
            <HorizontalSpacer size="l" />
            <p>{profile.stats.totalComments}</p>
          </FlexRow>
          <VerticalSpacer size="l" />
        </Card>
      </FlexRow>
    );
  }
};

const LoadingPage = () => {
  return <div>Loading</div>;
};

const FailedPage = () => {
  return <div>Lookup Failed</div>;
};

const PushRight = styled.div`
  margin-left: auto;
`;

const MaxWidth = styled.div`
  max-width: 20rem;
  margin-left: auto;
  margin-right: auto;
`;

const MaxWidthSmall = styled.div`
  max-width: 8rem;
`;

const NFTImage = styled.img`
  height: 10rem;
  width: 10rem;
  border-radius: 4px;
`;

const MinWidth = styled.div`
  min-width: 5rem;
`;

const Content = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 1080px;
  margin-top: 2rem;
  margin-bottom: 6rem;
  padding-left: 2rem;
`;

const Card = styled.div`
  border-radius: 4px;
`;

const hexStringToDecimalString = (hex: string): string => {
  try {
    return ethers.BigNumber.from(hex).toString();
  } catch {
    return hex;
  }
};

const NftName = styled.p`
  text-overflow: 'ellipsis';
  overflow: 'hidden';
  white-space: 'nowrap';
`;

const HideOrBlock = styled.div<{ hide: boolean }>`
  display: ${(p) => (p.hide ? 'none' : 'block')};
`;
