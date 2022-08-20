import { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { Avatar } from 'components/profiles/Avatar';
import Loader from 'components/LoadingSpinner';
import {
  useRouterEnsData,
  LookupStatus,
  useFetchOwnedNFTs,
  onlyWithImages,
  getImageUrl,
  arrayToRows,
  useProfile,
} from 'hooks';
import { ethers } from 'ethers';

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
  const nftListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadImages(true);
  }, []);

  return (
    <Content>
      <FlexRow>
        <Avatar address={address} />
        <HorizontalSingleSpacer />
        <FlexCol>
          <h1>{ensName || 'No ENS Name Found'}</h1>
          <VerticalHalfSpacer />
          <h2>{address}</h2>
        </FlexCol>
      </FlexRow>
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <h1>Web3 Identity</h1>
      <LensProfile address={address} />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <ScrollableSection>
        {isLoading || <h1>NFTs</h1>}
        {isLoading && <h1>Loading NFTs...</h1>}
        <VerticalHalfSpacer />
        <VerticalHalfSpacer />
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
                            <FlexCentered
                              style={{ minWidth: '8rem', minHeight: '8rem' }}>
                              <Loader height={100} width={100} />
                            </FlexCentered>
                          )}
                          <a
                            style={{ cursor: 'pointer' }}
                            target="_blank"
                            href={`https://opensea.io/assets/ethereum/${
                              data.contract.address
                            }/${hexStringToDecimalString(data.id.tokenId)}`}
                            rel="noreferrer">
                            <NFTImage
                              style={{
                                display: imgIsLoaded[data.id.tokenId]
                                  ? 'block'
                                  : 'none',
                              }}
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
                          </a>
                          <VerticalHalfSpacer />
                          <MaxWidthSmall>
                            <p
                              style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}>
                              {data.metadata.name}
                            </p>
                          </MaxWidthSmall>
                          <VerticalHalfSpacer />
                          <VerticalHalfSpacer />
                        </Card>
                        <HorizontalSingleSpacer />
                      </>
                    );
                  })}
                </FlexRow>
              );
            })}
        <div ref={nftListRef} />
      </ScrollableSection>
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <VerticalHalfSpacer />
      <MaxWidth>
        {nftRows * 4 < (nfts?.ownedNfts.length || Infinity) && (
          <button
            onClick={() => {
              setNftRows((num) => num + 2);
              setTimeout(() => {
                if (nftListRef && nftListRef.current) {
                  nftListRef.current.scrollIntoView({ behavior: 'smooth' });
                }
              }, 500);
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

const MaxWidth = styled.div`
  max-width: 20rem;
  margin-left: auto;
  margin-right: auto;
`;

const MaxWidthSmall = styled.div`
  max-width: 8rem;
`;

const ScrollableSection = styled.div`
  max-height: 500px;
  overflow-y: scroll;
`;

const LoadingPage = () => {
  return <div>Loading</div>;
};

const FailedPage = () => {
  return <div>Lookup Failed</div>;
};

const NFTImage = styled.img`
  height: 8rem;
  width: 8rem;
  border-radius: 4px;
`;

const LensProfile = ({ address }: { address: string }): JSX.Element => {
  const { data, loading, error } = useProfile(address);
  const noProfile = loading || error || data.profiles.items.length === 0;

  if (loading) {
    return <h1>Loading lens profile data...</h1>;
  } else if (error) {
    return <h1>Failed to load lens profile data...</h1>;
  } else if (noProfile) {
    return (
      <>
        <VerticalHalfSpacer />
        <VerticalHalfSpacer />
        <h2>No Lens Profile found. Go create one!</h2>
        <VerticalHalfSpacer />
        <VerticalHalfSpacer />
      </>
    );
  } else {
    const defaultProfile = data.profiles.items.find(
      (profile: any) => profile.isDefault
    );
    const profile = defaultProfile || data[0];
    return (
      <FlexRow>
        <Card>
          <VerticalHalfSpacer />
          <VerticalHalfSpacer />
          <FlexRow>
            <NFTImage src={profile.picture.original.url} alt="lens profile" />
            <HorizontalSingleSpacer />
            <FlexCol>
              <h3>{profile.handle}</h3>
              <VerticalHalfSpacer />
              <VerticalHalfSpacer />
              <h4>{profile.name}</h4>
            </FlexCol>
          </FlexRow>
          <VerticalHalfSpacer />
          <VerticalHalfSpacer />
          <FlexRow>
            <MinWidth>
              <h5>Followers</h5>
            </MinWidth>
            <HorizontalSingleSpacer />
            <p>{profile.stats.totalFollowers}</p>
          </FlexRow>
          <VerticalHalfSpacer />
          <FlexRow>
            <MinWidth>
              <h5>Following</h5>
            </MinWidth>
            <HorizontalSingleSpacer />
            <p>{profile.stats.totalFollowing}</p>
          </FlexRow>
          <VerticalHalfSpacer />
          <FlexRow>
            <MinWidth>
              <h5>Posts</h5>
            </MinWidth>
            <HorizontalSingleSpacer />
            <p>{profile.stats.totalPosts}</p>
          </FlexRow>
          <VerticalHalfSpacer />
          <FlexRow>
            <MinWidth>
              <h5>Comments</h5>
            </MinWidth>
            <HorizontalSingleSpacer />
            <p>{profile.stats.totalComments}</p>
          </FlexRow>
          <VerticalHalfSpacer />
          <VerticalHalfSpacer />
        </Card>
      </FlexRow>
    );
  }
};

const MinWidth = styled.div`
  min-width: 5rem;
`;

const Content = styled.main`
  display: flex;
  flex-direction: column;
  max-width: 1080px;
  padding: 2rem;
  height: 80vh;
  overflow-y: scroll;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const Card = styled.div`
  border-radius: 4px;
`;

const HorizontalSingleSpacer = styled.div`
  width: 1rem;
`;

const VerticalHalfSpacer = styled.div`
  height: 0.5rem;
`;

const FlexCentered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const hexStringToDecimalString = (hex: string): string => {
  try {
    return ethers.BigNumber.from(hex).toString();
  } catch {
    return hex;
  }
};
