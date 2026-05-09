import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  value?: string;
  animated?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = Colors.accentElectric,
  backgroundColor = 'rgba(255, 255, 255, 0.05)',
  label,
  value,
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(progress, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} />
            <Stop offset="1" stopColor={Colors.accentPurple} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value && (
          <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700' }}>
            {value}
          </Text>
        )}
        {label && (
          <Text style={{ color: Colors.textTertiary, fontSize: 11, marginTop: 2 }}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};
