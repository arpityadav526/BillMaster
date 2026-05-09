export const Colors = {
  // Base
  background: '#020617',
  surface: '#0f172a',
  surfaceLight: '#1e293b',
  surfaceLighter: '#334155',

  // Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textMuted: '#475569',

  // Accent
  accentBlue: '#3b82f6',
  accentElectric: '#6366f1',
  accentEmerald: '#10b981',
  accentPurple: '#8b5cf6',
  accentCyan: '#06b6d4',
  accentRose: '#f43f5e',
  accentAmber: '#f59e0b',

  // Gradients
  gradientBlue: ['#3b82f6', '#6366f1'],
  gradientPurple: ['#8b5cf6', '#6366f1'],
  gradientEmerald: ['#10b981', '#06b6d4'],
  gradientRose: ['#f43f5e', '#ec4899'],
  gradientDark: ['#0f172a', '#020617'],
  gradientCard: ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.9)'],

  // Glass
  glassLight: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassHeavy: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBorderLight: 'rgba(255, 255, 255, 0.06)',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#f43f5e',
  info: '#3b82f6',

  // Glow
  glowBlue: 'rgba(59, 130, 246, 0.3)',
  glowPurple: 'rgba(139, 92, 246, 0.3)',
  glowEmerald: 'rgba(16, 185, 129, 0.3)',

  // Shadows
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  shadowMedium: 'rgba(0, 0, 0, 0.3)',
} as const;

export const GradientPresets = {
  primaryCard: ['#1e293b', '#0f172a'] as const,
  blueAccent: ['#3b82f6', '#6366f1'] as const,
  purpleAccent: ['#8b5cf6', '#a855f7'] as const,
  emeraldAccent: ['#10b981', '#06b6d4'] as const,
  warmAccent: ['#f59e0b', '#f43f5e'] as const,
  darkOverlay: ['rgba(2, 6, 23, 0)', 'rgba(2, 6, 23, 0.95)'] as const,
  meshGradient: ['#020617', '#0f172a', '#1e1b4b'] as const,
} as const;
