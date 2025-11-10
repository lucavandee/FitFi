/**
 * Lightweight confetti animation without external dependencies
 * Premium feel for achievements and celebrations
 */

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  gravity?: number;
  drift?: number;
  scalar?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  gravity: number;
  drift: number;
  opacity: number;
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export function fireConfetti(options: ConfettiOptions = {}) {
  const {
    particleCount = 50,
    spread = 60,
    origin = { x: 0.5, y: 0.5 },
    colors = DEFAULT_COLORS,
    gravity = 0.3,
    drift = 0,
    scalar = 1,
  } = options;

  // Create canvas overlay
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  // Create particles
  const particles: Particle[] = [];
  const originX = origin.x * canvas.width;
  const originY = origin.y * canvas.height;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180);
    const velocity = 3 + Math.random() * 5;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.sin(angle) * velocity * scalar,
      vy: -Math.cos(angle) * velocity * scalar,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: (4 + Math.random() * 4) * scalar,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      gravity,
      drift,
      opacity: 1,
    });
  }

  // Animation loop
  let animationFrame: number;
  const startTime = Date.now();
  const duration = 3000; // 3 seconds

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    if (progress >= 1) {
      document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx + particle.drift;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.rotation += particle.rotationSpeed;

      // Fade out
      particle.opacity = 1 - progress;

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      ctx.restore();
    });

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (canvas.parentNode) {
      document.body.removeChild(canvas);
    }
  };
}

// Preset animations
export const confettiPresets = {
  achievement: () =>
    fireConfetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#9370DB'],
      scalar: 1.2,
    }),

  levelUp: () =>
    fireConfetti({
      particleCount: 150,
      spread: 90,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
      scalar: 1.5,
      gravity: 0.4,
    }),

  celebration: () => {
    // Fire from both sides
    fireConfetti({
      particleCount: 75,
      spread: 55,
      origin: { x: 0.15, y: 0.6 },
      colors: DEFAULT_COLORS,
    });
    fireConfetti({
      particleCount: 75,
      spread: 55,
      origin: { x: 0.85, y: 0.6 },
      colors: DEFAULT_COLORS,
    });
  },

  success: () =>
    fireConfetti({
      particleCount: 60,
      spread: 60,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#10B981', '#34D399', '#6EE7B7'],
      scalar: 1,
    }),
};

// Haptic feedback (mobile)
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
    };
    navigator.vibrate(patterns[type]);
  }
}

// Sound effects (optional, add your own sounds)
export function playSound(type: 'achievement' | 'levelUp' | 'click') {
  // Placeholder for future sound implementation
  // You can add Web Audio API implementation here
  console.log(`Playing sound: ${type}`);
}
