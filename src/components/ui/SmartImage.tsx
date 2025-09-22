import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackColor?: string; // optioneel
};

const SmartImage: React.FC<Props> = ({ fallbackColor, style, ...rest }) => {
  const [err, setErr] = React.useState(false);

  if (err) {
    return (
      <div
        aria-hidden="true"
        style={{
          ...style,
          width: "100%",
          height: "100%",
          background: fallbackColor ?? "linear-gradient(180deg,#0E2337 0%,#0C1A2A 100%)",
          borderRadius: "12px"
        }}
      />
    );
  }

  return (
    <img
      loading="lazy"
      decoding="async"
      onError={() => setErr(true)}
      {...rest}
    />
  );
};

export default SmartImage;