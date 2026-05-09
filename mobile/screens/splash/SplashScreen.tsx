import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { ParticleEffect } from '@/animations/ParticleEffect';
import { PulseGlow } from '@/animations/PulseGlow';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    logoOpacity.value = withTiming(1, { duration: 1000 });
    textOpacity.value = withDelay(800, withTiming(1, { duration: 1000 }));

    const timer = setTimeout(onFinish, 3000);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: interpolate(textOpacity.value, [0, 1], [20, 0]) }],
  }));

  return (
    <View style={styles.container}>
      <ParticleEffect count={30} />
      
      <View style={styles.content}>
        <PulseGlow color={Colors.glowBlue} intensity={15}>
          <Animated.Image
            source={require('@/assets/images/logo.png')}
            style={[styles.logo, logoStyle]}
            resizeMode="contain"
          />
        </PulseGlow>
        
        <Animated.Text style={[styles.title, textStyle]}>
          BillMaster
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, textStyle]}>
          Smart Finance OS
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
});
