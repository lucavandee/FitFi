import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

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
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const fetchPromise = fetch(
        `/.netlify/functions/product?retailer=${encodeURIComponent(retailer)}&id=${encodeURIComponent(productId)}`
      );
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
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
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setImageState(prev => {
        if (prev.loading) {
          console.warn(`Image loading timeout for ${retailer}:${productId}`);
          return { ...prev, loading: false, error: true };
        }
        return prev;
      });
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [retailer, productId]);

  const handleRetry = () => {
    setImageState(prev => ({ ...prev, retryCount: 0 }));
    fetchProductImage();
  };

  // Loading skeleton
  if (imageState.loading) {
    return (
      <div className={`${className} bg-[#1B263B] animate-pulse flex items-center justify-center`}>
        <div className="text-center text-white/50">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          <div className="text-xs">Loading...</div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (imageState.error || !imageState.imageUrl) {
    return (
      <div className={`${className} bg-[#1B263B] flex flex-col items-center justify-center text-white/50 p-4`}>
        <AlertCircle size={32} className="mb-2" />
        <div className="text-center">
          <div className="text-sm font-medium mb-1">Image not available</div>
          <div className="text-xs mb-3">Failed to load from {retailer}</div>
          <button
            onClick={handleRetry}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Success state - show the actual product image with fallback
  return (
    <ImageWithFallback
      src={imageState.imageUrl}
      alt={alt}
      className={className}
      fallbackSrc={fallbackSrc}
      onError={(originalSrc) => {
        console.warn(`Product image failed to load: ${originalSrc}`);
      }}
      componentName="LazyProductImage"
    />
  );
};

export default LazyProductImage;