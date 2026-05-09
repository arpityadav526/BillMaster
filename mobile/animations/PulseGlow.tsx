import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface PulseGlowProps {
  children: React.ReactNode;
  color?: string;
  intensity?: number;
  duration?: number;
  style?: any;
}

export const PulseGlow: React.FC<PulseGlowProps> = ({
  children,
  color = 'rgba(99, 102, 241, 0.4)',
  intensity = 12,
  duration = 2000,
  style,
}) => {
  const glowRadius = useSharedValue(0);

  useEffect(() => {
    glowRadius.value = withRepeat(
      withSequence(
        withTiming(intensity, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: glowRadius.value,
    elevation: glowRadius.value,
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
