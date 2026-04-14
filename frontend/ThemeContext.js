import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

const darkTheme = {
  mode: 'dark',
  bg: '#0a0e1a',
  bgSecondary: '#111827',
  bgTertiary: '#1e293b',
  card: 'rgba(17, 24, 39, 0.85)',
  cardBorder: 'rgba(99, 102, 241, 0.15)',
  cardHover: 'rgba(30, 41, 59, 0.9)',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  accent: '#818cf8',
  accentGradient: ['#6366f1', '#8b5cf6'],
  accentLight: 'rgba(99, 102, 241, 0.12)',
  success: '#34d399',
  successBg: 'rgba(52, 211, 153, 0.1)',
  warning: '#fbbf24',
  warningBg: 'rgba(251, 191, 36, 0.1)',
  danger: '#f87171',
  dangerBg: 'rgba(248, 113, 113, 0.1)',
  info: '#60a5fa',
  infoBg: 'rgba(96, 165, 250, 0.1)',
  border: 'rgba(51, 65, 85, 0.6)',
  shadow: '#000',
  glass: 'rgba(15, 23, 42, 0.7)',
  inputBg: 'rgba(15, 23, 42, 0.8)',
  tabBar: '#0a0e1a',
  header: '#0a0e1a',
  statusBarStyle: 'light',
  // Density colors
  densityLow: '#34d399',
  densityMedium: '#fbbf24',
  densityHigh: '#f87171',
  // Gradients
  heroGradient: ['#1e1b4b', '#312e81', '#4338ca'],
  cardGradient: ['rgba(17, 24, 39, 0.9)', 'rgba(30, 41, 59, 0.7)'],
};

const lightTheme = {
  mode: 'light',
  bg: '#f8fafc',
  bgSecondary: '#f1f5f9',
  bgTertiary: '#e2e8f0',
  card: 'rgba(255, 255, 255, 0.9)',
  cardBorder: 'rgba(99, 102, 241, 0.1)',
  cardHover: 'rgba(241, 245, 249, 0.95)',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  accent: '#6366f1',
  accentGradient: ['#6366f1', '#8b5cf6'],
  accentLight: 'rgba(99, 102, 241, 0.08)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.08)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.08)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.08)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.08)',
  border: 'rgba(226, 232, 240, 0.8)',
  shadow: 'rgba(0, 0, 0, 0.08)',
  glass: 'rgba(248, 250, 252, 0.85)',
  inputBg: 'rgba(241, 245, 249, 0.9)',
  tabBar: '#ffffff',
  header: '#ffffff',
  statusBarStyle: 'dark',
  // Density colors
  densityLow: '#10b981',
  densityMedium: '#f59e0b',
  densityHigh: '#ef4444',
  // Gradients
  heroGradient: ['#e0e7ff', '#c7d2fe', '#a5b4fc'],
  cardGradient: ['rgba(255, 255, 255, 0.95)', 'rgba(241, 245, 249, 0.8)'],
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
