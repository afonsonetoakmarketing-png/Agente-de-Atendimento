'use client';

import React, { useState } from 'react';
import { Link2, Image as ImageIcon } from 'lucide-react';
import { ImageAssetConfig } from '@/lib/types';

interface EditableImageProps {
  assetKey: string;
  assets: Record<string, ImageAssetConfig>;
  fallbackText?: string;
  className?: string;
  containerClassName?: string;
  onEditAsset?: (key: string) => void;
  onNavigateAsset?: (asset: ImageAssetConfig) => void;
  showEditBadgeOnHover?: boolean;
}

export default function EditableImage({
  assetKey,
  assets,
  fallbackText = 'AI',
  className = 'w-8 h-8 rounded-full object-cover',
  containerClassName = 'relative inline-flex shrink-0 group/img',
  onEditAsset,
  onNavigateAsset,
  showEditBadgeOnHover = true,
}: EditableImageProps) {
  const [hasError, setHasError] = useState(false);
  const asset = assets[assetKey];
  const srcUrl = asset?.url || '';

  const initials = fallbackText
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={containerClassName}>
      {srcUrl && !hasError ? (
        <img
          key={srcUrl}
          src={srcUrl}
          alt={asset?.alt || fallbackText}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          onClick={(e) => {
            if (onNavigateAsset && asset?.linkedTab) {
              e.stopPropagation();
              onNavigateAsset(asset);
            }
          }}
          className={`${className} ${
            onNavigateAsset && asset?.linkedTab ? 'cursor-pointer' : ''
          }`}
        />
      ) : (
        <div
          onClick={(e) => {
            if (onNavigateAsset && asset?.linkedTab && asset) {
              e.stopPropagation();
              onNavigateAsset(asset);
            }
          }}
          className={`${className} bg-surface-container-highest text-primary font-mono text-xs font-bold flex items-center justify-center border border-primary-container/30 select-none`}
        >
          {initials || <ImageIcon className="w-4 h-4 text-primary" />}
        </div>
      )}

      {showEditBadgeOnHover && onEditAsset && (
        <button
          type="button"
          title={`Editar link direto da imagem: ${asset?.label || assetKey}`}
          onClick={(e) => {
            e.stopPropagation();
            onEditAsset(assetKey);
          }}
          className="opacity-0 group-hover/img:opacity-100 focus:opacity-100 absolute -top-1 -right-1 z-20 w-5 h-5 rounded-full bg-surface-container-lowest/95 border border-primary-container text-primary hover:bg-primary-container hover:text-on-primary transition-all flex items-center justify-center shadow-lg"
        >
          <Link2 className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}
