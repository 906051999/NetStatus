import { useState } from 'react';
import Image from 'next/image';

export default function WebsiteLogo({ url }) {
  const [imgSrc, setImgSrc] = useState(() => {
    const domain = url.replace(/^https?:\/\//, '').split('/')[0];
    return `/logo/${domain}.ico`;
  });

  return (
    <Image
      src={imgSrc}
      alt={`${url} logo`}
      width={32}
      height={32}
      className="rounded-full"
      onError={() => setImgSrc('/favicon.ico')}
    />
  );
}
