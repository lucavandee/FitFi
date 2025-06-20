import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const LazyProductImage = ({ 
  retailer, 
  productId, 
  alt, 
  className = '',
  fallbackSrc = '/placeholder.png'
}) => {
  const [imageState, setImageState] = useState({
    loading: true,
    error: false,
    imageUrl: null,
    retryCount: 0
  });

  const maxRetries = 2;

  const fetchProductImage = async (retryCount = 0) => {
    try {
      setImageState(prev => ({ ...prev, loading: true, error: false }));
      
      const response = await fetch(
        `/.netlify/functions/product?retailer=${encodeURIComponent(retailer)}&id=${encodeURIComponent(productId)}`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setImageState({
          loading: false,
          error: false,
          imageUrl: data.imageUrl,
          retryCount
        });
      } else {
        throw new Error(data.error || 'No image URL in response');
      }
      
    } catch (error) {
      console.error(`Failed to fetch product image for ${retailer}:`, error);
      
      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        setTimeout(() => {
          fetchProductImage(retryCount + 1);
        }, Math.pow(2, retryCount) * 1000);
      } else {
        setImageState({
          loading: false,
          error: true,
          imageUrl: null,
          retryCount
        });
      }
    }
  };

  useEffect(() => {
    if (retailer && productId) {
      fetchProductImage();
    }
  }, [retailer, productId]);

  const handleRetry = () => {
    setImageState(prev => ({ ...prev, retryCount: 0 }));
    fetchProductImage();
  };

  const handleImageError = () => {
    setImageState(prev => ({ ...prev, error: true, loading: false }));
  };

  const handleImageLoad = () => {
    setImageState(prev => ({ ...prev, loading: false }));
  };

  // Loading skeleton
  if (imageState.loading) {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center`}>
        <div className="text-center text-gray-400 dark:text-gray-500">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          <div className="text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (imageState.error || !imageState.imageUrl) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4`}>
        <AlertCircle size={32} className="mb-2" />
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Image not available</div>
          <div className="text-xs mb-3">Failed to load from {retailer}</div>
          <button
            onClick={handleRetry}
            className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success state - show the actual product image
  return (
    <img
      src={imageState.imageUrl}
      alt={alt}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
      decoding="async"
    />
  );
};

export default LazyProductImage;