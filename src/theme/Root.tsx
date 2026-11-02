import React, {type ReactNode} from 'react';
import FallingLeaves from '@site/src/components/Boids';

// Wraps every page and never unmounts, so the leaves keep falling across page changes
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      <FallingLeaves />
      {children}
    </>
  );
}
