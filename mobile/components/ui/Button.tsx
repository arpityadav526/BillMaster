import React from 'react';
import { Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScalePress } from '@/animations/ScalePress';
import { Colors } from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const sizeStyles: Record<string, { height: number; px: number; fontSize: number }> = {
    sm: { height: 36, px: 16, fontSize: 13 },
    md: { height: 48, px: 24, fontSize: 15 },
    lg: { height: 56, px: 32, fontSize: 16 },
  };

  const { height, px, fontSize } = sizeStyles[size];

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      height,
      paddingHorizontal: px,
      borderRadius: height / 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...(fullWidth && { width: '100%' }),
      opacity: disabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'secondary':
        return { ...base, backgroundColor: Colors.surfaceLight };
      case 'outline':
        return { ...base, borderWidth: 1, borderColor: Colors.glassBorder };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = { fontSize, fontWeight: '600' };

    switch (variant) {
      case 'secondary':
        return { ...base, color: Colors.textPrimary };
      case 'outline':
        return { ...base, color: Colors.textPrimary };
      case 'ghost':
        return { ...base, color: Colors.accentBlue };
      default:
        return { ...base, color: '#fff' };
    }
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : Colors.accentBlue} />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <ScalePress onPress={onPress} disabled={disabled || loading} style={style}>
        <LinearGradient
          colors={[Colors.accentElectric, Colors.accentBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getContainerStyle()}
        >
          {content}
        </LinearGradient>
      </ScalePress>
    );
  }

  return (
    <ScalePress onPress={onPress} disabled={disabled || loading} style={[getContainerStyle(), style]}>
      {content}
    </ScalePress>
  );
};
