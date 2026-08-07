import React, { useRef, Component } from 'react';

// Error Boundary to prevent Three.js crashes from breaking the entire app
class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('3D HeroScene failed to render, using CSS fallback:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// CSS-only animated fallback background (no Three.js dependency)
const CSSFallbackScene = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    {/* Animated gradient orbs */}
    <div
      className="absolute rounded-full blur-[120px] animate-pulse"
      style={{
        top: '20%', left: '30%',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(0,240,255,0.3) 0%, transparent 70%)',
        animation: 'float1 8s ease-in-out infinite',
      }}
    />
    <div
      className="absolute rounded-full blur-[100px] animate-pulse"
      style={{
        top: '50%', right: '20%',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
        animation: 'float2 10s ease-in-out infinite',
      }}
    />
    <div
      className="absolute rounded-full blur-[80px] animate-pulse"
      style={{
        bottom: '10%', left: '15%',
        width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(255,51,102,0.15) 0%, transparent 70%)',
        animation: 'float3 12s ease-in-out infinite',
      }}
    />

    {/* Particle dots */}
    {Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-neonBlue/30"
        style={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite alternate`,
        }}
      />
    ))}

    <style>{`
      @keyframes float1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, -40px) scale(1.1); }
      }
      @keyframes float2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-40px, 30px) scale(1.15); }
      }
      @keyframes float3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(20px, 20px) scale(1.05); }
      }
      @keyframes twinkle {
        0% { opacity: 0.2; }
        100% { opacity: 0.8; }
      }
    `}</style>
  </div>
);

// Lazily load the Three.js scene so import errors are caught
const ThreeScene = React.lazy(() =>
  import('./ThreeScene').catch(() => {
    // If the module fails to load, return a dummy component
    return { default: () => null };
  })
);

const HeroScene = () => {
  return (
    <SceneErrorBoundary fallback={<CSSFallbackScene />}>
      <React.Suspense fallback={<CSSFallbackScene />}>
        <ThreeScene />
      </React.Suspense>
    </SceneErrorBoundary>
  );
};

export default HeroScene;
