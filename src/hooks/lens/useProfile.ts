import { gql, useQuery } from '@apollo/client';

export const profile = gql`
  query Profiles($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        name
        bio
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        handle
        ownedBy
        isDefault
        picture {
          ... on NftImage {
            uri
          }
          ... on MediaSet {
            original {
              url
            }
          }
        }
      }
    }
  }
`;

export const useProfile = (address: string) => {
  return useQuery(profile, {
    variables: { request: { ownedBy: [address] } },
  });
};

export const gatewayFromIpfs = (ipfsUrl: string): string => {
  if (!ipfsUrl.startsWith('ipfs://')) {
    throw new Error('Did not pass an IPFS url!');
  } else {
    return 'https://gateway.ipfs.io/ipfs/' + ipfsUrl.slice(7);
  }
};

export const isIpfsUrl = (maybeIpfsUrl: string): boolean => {
  return maybeIpfsUrl.startsWith('ipfs://');
};
