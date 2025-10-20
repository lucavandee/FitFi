interface IconProps {
  className?: string;
  color?: string;
}

export function JacketIcon({ className = 'w-16 h-16', color = 'currentColor' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 12L22 16L18 24V52H28V36L32 32L36 36V52H46V24L42 16L32 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M22 16L26 20L32 18L38 20L42 16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function ShirtIcon({ className = 'w-16 h-16', color = 'currentColor' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 14L26 20V24H32H38V20L44 14L48 18V28L44 32H42V52H22V32H20L16 28V18L20 14Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M26 20C26 20 28 16 32 16C36 16 38 20 38 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function PantsIcon({ className = 'w-16 h-16', color = 'currentColor' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 12H44V32L42 52H36L32 36L28 52H22L20 32V12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M24 12V24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M40 12V24"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function ShoesIcon({ className = 'w-16 h-16', color = 'currentColor' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 40L20 28L28 24L36 28L40 32V44H16V40Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M16 44C16 44 14 46 14 48C14 50 16 52 20 52H40C44 52 46 50 46 48C46 46 44 44 44 44"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function AccessoryIcon({ className = 'w-16 h-16', color = 'currentColor' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="32"
        cy="32"
        r="16"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      <circle
        cx="32"
        cy="32"
        r="8"
        stroke={color}
        strokeWidth="2"
        opacity="0.6"
      />
      <path
        d="M32 16V24M32 40V48M16 32H24M40 32H48"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function getCategoryIcon(category: string): React.ComponentType<IconProps> {
  const normalized = category.toLowerCase();

  if (normalized.includes('jacket') || normalized.includes('outerwear') || normalized.includes('vest') || normalized.includes('bodywarmer')) {
    return JacketIcon;
  }

  if (normalized.includes('shirt') || normalized.includes('top') || normalized.includes('sweater') || normalized.includes('hoodie')) {
    return ShirtIcon;
  }

  if (normalized.includes('pant') || normalized.includes('trouser') || normalized.includes('bottom') || normalized.includes('jeans')) {
    return PantsIcon;
  }

  if (normalized.includes('shoe') || normalized.includes('footwear') || normalized.includes('sneaker') || normalized.includes('boot')) {
    return ShoesIcon;
  }

  if (normalized.includes('accessory') || normalized.includes('cap') || normalized.includes('bag') || normalized.includes('hat')) {
    return AccessoryIcon;
  }

  return ShirtIcon;
}
