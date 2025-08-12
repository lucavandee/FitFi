import React from "react";

const FALLBACK = "https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=1200";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { 
  src: string;
  fallbackSrc?: string;
};

export const ImageWithFallback: React.FC<Props> = ({ 
  src, 
  alt, 
  fallbackSrc = FALLBACK,
  ...rest 
}) => {
  const [url, setUrl] = React.useState(src?.startsWith("http") || src?.startsWith("/") ? src : fallbackSrc);
  
  const handleError = () => {
    if (url !== fallbackSrc) {
      setUrl(fallbackSrc);
    }
  };
  
  return (
    <img 
      {...rest} 
      src={url} 
      alt={alt} 
      onError={handleError} 
      loading={rest.loading ?? "lazy"} 
    />
  );
};