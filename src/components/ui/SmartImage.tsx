import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackColor?: string;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  top: "#F5F0EB",
  bottom: "#EDE5DC",
  footwear: "#E5DDD4",
  outerwear: "#EDE5DC",
  accessory: "#F5F0EB",
  default: "#F5F0EB"
};

function getCategoryFromUrl(src?: string): string {
  if (!src) return "default";
  if (src.includes("/top.jpg") || src.includes("category=top")) return "top";
  if (src.includes("/bottom.jpg") || src.includes("category=bottom")) return "bottom";
  if (src.includes("/footwear.jpg") || src.includes("category=footwear")) return "footwear";
  if (src.includes("/outerwear.jpg") || src.includes("category=outerwear")) return "outerwear";
  if (src.includes("/accessory.jpg") || src.includes("category=accessory")) return "accessory";
  return "default";
}

const SmartImage: React.FC<Props> = ({ fallbackColor, style, src, alt, ...rest }) => {
  const [err, setErr] = React.useState(!src || src === '');

  React.useEffect(() => {
    setErr(!src || src === '');
  }, [src]);

  if (err) {
    const category = getCategoryFromUrl(src);
    const gradient = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.default;

    return (
      <div
        aria-hidden="true"
        role="img"
        aria-label={alt || "Product afbeelding"}
        style={{
          ...style,
          width: "100%",
          height: "100%",
          background: fallbackColor ?? gradient,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      />
    );
  }

  return (
    <img
      loading="lazy"
      decoding="async"
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={style}
      {...rest}
    />
  );
};

export default SmartImage;