import { useRouter } from 'next/router';
import { useEnsAddress, useEnsName } from 'wagmi';

export enum LookupStatus {
  'loading' = 'loading',
  'success' = 'success',
  'failed' = 'failed',
  'noEns' = 'noEns',
}

interface Loading {
  status: LookupStatus.loading;
}

interface Failed {
  status: LookupStatus.failed;
}

interface Success {
  status: LookupStatus.success;
  address: string;
  name: string | null;
}

export type EnsData = Loading | Failed | Success;

export function useRouterEnsData(queryKey = 'ens'): EnsData {
  const router = useRouter();
  const nameOrAddress = router.query[queryKey] as string;
  const { data: address, isLoading: addressIsLoading } = useEnsAddress({
    name: nameOrAddress,
  });
  const { data: name, isLoading: ensNameIsLoading } = useEnsName({
    address: nameOrAddress,
  });

  if (addressIsLoading || ensNameIsLoading) {
    return { status: LookupStatus.loading };
  } else {
    if (address === undefined || address === null) {
      return { status: LookupStatus.failed };
    } else {
      // If address is nameOrAddress, then we passed in an address so we need to
      // use the result of the ENS lookup, otherwise we passed in an ENS name.
      const ensName = address === nameOrAddress ? name || null : nameOrAddress;
      return {
        address,
        name: ensName,
        status: LookupStatus.success,
      };
    }
  }
}
