import { useState, useEffect } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
}

export const useImageOptimization = () => {
  const [isWebPSupported, setIsWebPSupported] = useState<boolean>(false);

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    setIsWebPSupported(checkWebPSupport());
  }, []);

  const optimizeImageUrl = (
    url: string, 
    options: ImageOptimizationOptions = {}
  ): string => {
    const { quality = 80, width, height } = options;
    
    // For Pexels images, add optimization parameters
    if (url.includes('pexels.com')) {
      const params = new URLSearchParams();
      params.append('auto', 'compress');
      params.append('cs', 'tinysrgb');
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('dpr', '2');
      
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }
    
    return url;
  };

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  return {
    isWebPSupported,
    optimizeImageUrl,
    preloadImage
  };
};