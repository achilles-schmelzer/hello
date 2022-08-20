import { useState, useEffect } from 'react';
import { useEnsAvatar } from 'wagmi';
import styled from 'styled-components';
import Blockies from 'react-blockies';
import LoadingSpinner from '../LoadingSpinner';

interface AvatarProps {
  address: string;
}
export function Avatar(props: AvatarProps) {
  const {
    data: ensAvatar,
    isFetching,
    isLoading,
  } = useEnsAvatar({ addressOrName: props.address });
  const [showLoading, setShowLoading] = useState<boolean>(true);

  useEffect(() => {
    setShowLoading(isFetching || isLoading);
  }, [isFetching, isLoading]);

  if (showLoading) {
    return <LoadingSpinner width={40} height={40} />;
  }

  if (!ensAvatar) {
    return (
      <Blockies
        seed={props.address.toLowerCase() || ''}
        size={10}
        scale={4}
        className={'circle'}
      />
    );
  } else {
    return <AvatarImage src={ensAvatar} size={props.size} alt="user" />;
  }
}

const AvatarImage = styled.img<{ size?: 'large' | 'small' | 'medium' }>`
  border-radius: 8px;
  width: 6rem;
  height: 6rem;
`;
