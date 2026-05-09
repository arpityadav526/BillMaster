import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ScalePressProps {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  haptic?: boolean;
  style?: any;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ScalePress: React.FC<ScalePressProps> = ({
  children,
  onPress,
  scale = 0.97,
  haptic = true,
  style,
  disabled = false,
}) => {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(scale, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
};
