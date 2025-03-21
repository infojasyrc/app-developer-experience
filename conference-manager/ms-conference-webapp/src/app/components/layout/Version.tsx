'use client';

import React from 'react';
import packageJson from '../../../../package.json';

const Version: React.FC = () => {
  return (
    <div className="fixed right-10 bottom-0 p-2 bg-white">
      Version: {packageJson.version}
    </div>
  );
};

export default Version;
