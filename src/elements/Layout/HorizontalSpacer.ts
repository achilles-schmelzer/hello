import styled from 'styled-components';

const sizeToHeight = (size: 's' | 'm' | 'l' | 'xl' | '2xl'): string => {
  if (size === 's') return '0.5rem';
  if (size === 'm') return '1rem';
  if (size === 'l') return '1.5rem';
  if (size === 'xl') return '2rem';
  if (size === '2xl') return '3rem';

  throw new Error(`sizeToHeight: ${size} not supported!`);
};

export const HorizontalSpacer = styled.div<{
  size: 's' | 'm' | 'l' | 'xl' | '2xl';
}>`
  width: ${(p) => sizeToHeight(p.size)};
`;
