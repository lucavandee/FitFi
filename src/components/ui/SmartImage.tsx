import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackColor?: string;
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  top: "linear-gradient(135deg, var(--ff-color-beige-50) 0%, #E8DCC8 100%)",
  bottom: "linear-gradient(135deg, var(--ff-color-beige-300) 0%, #C4B5A0 100%)",
  footwear: "linear-gradient(135deg, var(--ff-color-beige-500) 0%, #8B7355 100%)",
  outerwear: "linear-gradient(135deg, #E8DCC8 0%, var(--ff-color-beige-300) 100%)",
  accessory: "linear-gradient(135deg, var(--ff-color-beige-50) 0%, #E8DCC8 100%)",
  default: "linear-gradient(135deg, var(--ff-color-beige-50) 0%, var(--ff-color-beige-300) 100%)"
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
  const [err, setErr] = React.useState(false);

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