export interface GradientColors {
  from: string;
  via?: string;
  to: string;
}

const COLOR_GRADIENTS: Record<string, GradientColors> = {
  black: {
    from: 'rgb(30, 30, 30)',
    via: 'rgb(60, 60, 60)',
    to: 'rgb(90, 90, 90)',
  },
  navy: {
    from: 'rgb(20, 40, 80)',
    via: 'rgb(40, 60, 100)',
    to: 'rgb(60, 80, 120)',
  },
  blue: {
    from: 'rgb(40, 80, 160)',
    via: 'rgb(60, 100, 180)',
    to: 'rgb(80, 120, 200)',
  },
  'midnight blue': {
    from: 'rgb(15, 30, 70)',
    via: 'rgb(30, 50, 90)',
    to: 'rgb(45, 70, 110)',
  },
  'light blue': {
    from: 'rgb(120, 160, 200)',
    via: 'rgb(140, 180, 220)',
    to: 'rgb(160, 200, 240)',
  },
  green: {
    from: 'rgb(40, 80, 50)',
    via: 'rgb(60, 100, 70)',
    to: 'rgb(80, 120, 90)',
  },
  grey: {
    from: 'rgb(100, 100, 100)',
    via: 'rgb(130, 130, 130)',
    to: 'rgb(160, 160, 160)',
  },
  'grey melange': {
    from: 'rgb(110, 110, 110)',
    via: 'rgb(140, 140, 140)',
    to: 'rgb(170, 170, 170)',
  },
  khaki: {
    from: 'rgb(120, 110, 80)',
    via: 'rgb(140, 130, 100)',
    to: 'rgb(160, 150, 120)',
  },
  beige: {
    from: 'rgb(180, 160, 140)',
    via: 'rgb(200, 180, 160)',
    to: 'rgb(220, 200, 180)',
  },
  white: {
    from: 'rgb(220, 220, 220)',
    via: 'rgb(240, 240, 240)',
    to: 'rgb(255, 255, 255)',
  },
  red: {
    from: 'rgb(140, 40, 40)',
    via: 'rgb(180, 60, 60)',
    to: 'rgb(220, 80, 80)',
  },
  brown: {
    from: 'rgb(80, 60, 40)',
    via: 'rgb(110, 80, 60)',
    to: 'rgb(140, 100, 80)',
  },
};

const DEFAULT_GRADIENT: GradientColors = {
  from: 'rgb(140, 130, 120)',
  via: 'rgb(160, 150, 140)',
  to: 'rgb(180, 170, 160)',
};

export function getColorGradient(colorName: string): GradientColors {
  const normalized = colorName.toLowerCase().trim();

  for (const [key, gradient] of Object.entries(COLOR_GRADIENTS)) {
    if (normalized.includes(key)) {
      return gradient;
    }
  }

  return DEFAULT_GRADIENT;
}

export function generateGradientCSS(gradient: GradientColors): string {
  if (gradient.via) {
    return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`;
  }
  return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`;
}

export function getColorFromProductName(productName: string): string {
  const parts = productName.split('-');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }

  const colorMatch = productName.match(/\b(black|navy|blue|green|grey|white|red|brown|khaki|beige)\b/i);
  return colorMatch ? colorMatch[0] : 'neutral';
}
