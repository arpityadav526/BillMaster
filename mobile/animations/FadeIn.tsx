import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  style?: any;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  distance = 20,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const translateX = useSharedValue(direction === 'left' ? distance : direction === 'right' ? -distance : 0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
    translateX.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
