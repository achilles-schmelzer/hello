import { useEnsAvatar } from 'wagmi';
import Spinner from '../../public/assets/images/spinner.svg';
import Image from 'next/image';
import styled from 'styled-components';
import Blockies from 'react-blockies';
import LoadingSpinner from './LoadingSpinner'

interface AvatarProps {
  address?: string | undefined;
  size?: 'small' | 'medium' | 'large';
}
export default function Avatar(props: AvatarProps) {
  const {
    data: ensAvatar,
    isFetching,
    isLoading,
  } = useEnsAvatar({ addressOrName: props.address });

  if (isFetching || isLoading) {
    return <LoadingSpinner width={40} height={40}  />;
  }

  if (!ensAvatar) {
    return (
      <Blockies
        seed={props.address || ''}
        size={10}
        scale={4}
        className={'circle'}
      />
    );
  } else {
    return (
      <AvatarImage
        src={ensAvatar}
        width={props.size === 'large' ? 60 : 40}
        height={props.size === 'large' ? 60 : 40}
        alt="user"
      />
    );
  }
}

const AvatarImage = styled(Image)`
  border-radius: 50%;
`;
