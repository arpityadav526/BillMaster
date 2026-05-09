import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const generateParticles = (count: number): Particle[] => {
  const colors = [
    'rgba(99, 102, 241, 0.3)',
    'rgba(139, 92, 246, 0.3)',
    'rgba(59, 130, 246, 0.2)',
    'rgba(16, 185, 129, 0.2)',
    'rgba(6, 182, 212, 0.2)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3000,
    duration: Math.random() * 4000 + 3000,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
};

const ParticleDot: React.FC<{ particle: Particle }> = ({ particle }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(1, { duration: particle.duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0.2, 0.8, 0.2]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -30]) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.8, 1.2, 0.8]) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ParticleEffect: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const particles = React.useMemo(() => generateParticles(count), [count]);

  return (
    <View style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      {particles.map((particle) => (
        <ParticleDot key={particle.id} particle={particle} />
      ))}
    </View>
  );
};
