import { memo, useMemo, type CSSProperties, type ReactNode } from "react";

const STAR_FIELD_SIZE = 2000;
const DEFAULT_TOP_GRADIENT = "#090A0F";
const DEFAULT_BOTTOM_GRADIENT = "#1B2735";
const STAR_LAYERS = [
  { count: 560, size: 1, duration: 50, seed: 17, opacity: 0.8 },
  { count: 280, size: 2, duration: 100, seed: 31, opacity: 0.7 },
  { count: 160, size: 3, duration: 150, seed: 53, opacity: 0.65 },
] as const;

const PARALLAX_STARS_STYLES = `
  @keyframes parallax-stars-drift {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-2000px);
    }
  }

  .parallax-stars-background__gradient {
    background:
      radial-gradient(
        ellipse at bottom,
        var(--parallax-gradient-bottom) 0%,
        var(--parallax-gradient-top) 68%,
        var(--parallax-gradient-top) 100%
      );
  }

  .parallax-stars-background__motion {
    animation-name: parallax-stars-drift;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  .parallax-stars-background__field {
    position: absolute;
    left: 0;
    border-radius: 999px;
    background: rgb(var(--parallax-star-rgb));
  }

  .parallax-stars-background__field--clone {
    top: 2000px;
  }

  .parallax-stars-background__hero {
    transition:
      transform 500ms ease,
      text-shadow 500ms ease,
      opacity 300ms ease;
  }

  .parallax-stars-background__hero:hover {
    transform: translateY(-4px);
    text-shadow: 0 0 42px rgba(255, 255, 255, 0.18);
  }

  @media (prefers-reduced-motion: reduce) {
    .parallax-stars-background__motion,
    .parallax-stars-background__hero {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }
  }
`;

export interface ParallaxStarsBackgroundProps {
  title: string;
  speed?: number;
  children?: ReactNode;
  className?: string;
  gradientTopColor?: string;
  gradientBottomColor?: string;
  starRgb?: string;
}

function createSeededRandom(seed: number) {
  let currentSeed = seed >>> 0;

  return () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
    return currentSeed / 4294967296;
  };
}

function createStarShadowString(count: number, seed: number) {
  const random = createSeededRandom(seed);
  const stars: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const x = Math.floor(random() * STAR_FIELD_SIZE);
    const y = Math.floor(random() * STAR_FIELD_SIZE);
    const alpha = 0.45 + random() * 0.55;

    stars.push(`${x}px ${y}px 0 rgba(var(--parallax-star-rgb), ${alpha.toFixed(3)})`);
  }

  return stars.join(", ");
}

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(" ");

interface ParallaxStarsThemeProps {
  speed?: number;
  className?: string;
  gradientTopColor?: string;
  gradientBottomColor?: string;
  starRgb?: string;
}

export interface ParallaxStarsBackdropProps extends ParallaxStarsThemeProps {}

const ParallaxStarsLayer = memo(function ParallaxStarsLayer({
  size,
  duration,
  opacity,
  shadow,
  speed,
}: {
  size: number;
  duration: number;
  opacity: number;
  shadow: string;
  speed: number;
}) {
  const layerStyle = {
    width: `${STAR_FIELD_SIZE}px`,
    height: `${STAR_FIELD_SIZE}px`,
  };

  const starStyle = {
    width: `${size}px`,
    height: `${size}px`,
    opacity,
    boxShadow: shadow,
  } as CSSProperties;

  return (
    <div
      className="absolute left-1/2 top-0 -translate-x-1/2"
      style={layerStyle}
    >
      <div
        className="parallax-stars-background__motion relative"
        style={{
          ...layerStyle,
          animationDuration: `${duration / speed}s`,
        }}
      >
        <span className="parallax-stars-background__field" style={{ ...starStyle, top: 0 }} />
        <span
          className="parallax-stars-background__field parallax-stars-background__field--clone"
          style={starStyle}
        />
      </div>
    </div>
  );
});

ParallaxStarsLayer.displayName = "ParallaxStarsLayer";

export const ParallaxStarsBackdrop = memo(function ParallaxStarsBackdrop({
  speed = 1,
  className,
  gradientTopColor = DEFAULT_TOP_GRADIENT,
  gradientBottomColor = DEFAULT_BOTTOM_GRADIENT,
  starRgb = "255, 255, 255",
}: ParallaxStarsBackdropProps) {
  const clampedSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;

  const layerShadows = useMemo(
    () => STAR_LAYERS.map((layer) => createStarShadowString(layer.count, layer.seed)),
    []
  );

  const rootStyle = {
    "--parallax-gradient-top": gradientTopColor,
    "--parallax-gradient-bottom": gradientBottomColor,
    "--parallax-star-rgb": starRgb,
  } as CSSProperties;

  return (
    <div
      className={joinClassNames("absolute inset-0 overflow-hidden pointer-events-none", className)}
      style={rootStyle}
    >
      <style>{PARALLAX_STARS_STYLES}</style>

      <div className="parallax-stars-background__gradient absolute inset-0 z-0" />

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {STAR_LAYERS.map((layer, index) => (
          <ParallaxStarsLayer
            key={`${layer.size}-${layer.duration}`}
            size={layer.size}
            duration={layer.duration}
            opacity={layer.opacity}
            shadow={layerShadows[index]}
            speed={clampedSpeed}
          />
        ))}
      </div>
    </div>
  );
});

ParallaxStarsBackdrop.displayName = "ParallaxStarsBackdrop";

export const ParallaxStarsBackground = memo(function ParallaxStarsBackground({
  title,
  speed = 1,
  children,
  className,
  gradientTopColor = DEFAULT_TOP_GRADIENT,
  gradientBottomColor = DEFAULT_BOTTOM_GRADIENT,
  starRgb = "255, 255, 255",
}: ParallaxStarsBackgroundProps) {
  const titleLines = title.split("\n");

  return (
    <section
      className={joinClassNames(
        "relative isolate flex h-screen min-h-dvh w-full items-center justify-center overflow-hidden bg-[#090A0F] text-white",
        className
      )}
    >
      <ParallaxStarsBackdrop
        speed={speed}
        gradientTopColor={gradientTopColor}
        gradientBottomColor={gradientBottomColor}
        starRgb={starRgb}
      />

      <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-16 text-center sm:px-10">
        <div className="parallax-stars-background__hero max-w-4xl">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.38em] text-white/55"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Chatify
          </p>
          <h1
            className="text-4xl font-semibold leading-[0.95] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {titleLines.map((line, index) => (
              <span key={`${line}-${index}`} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>

        {children ? (
          <div className="w-full transition-transform duration-500 ease-out md:hover:-translate-y-1">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
});

ParallaxStarsBackground.displayName = "ParallaxStarsBackground";
