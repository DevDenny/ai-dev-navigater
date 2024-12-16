'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImagePreview({ src, alt }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-500">加载中...</span>
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-500">
          图片加载失败
        </div>
      ) : (
        <Image
          src={src}
          alt={alt || ''}
          width={400}
          height={300}
          className="max-w-full h-auto"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
} 