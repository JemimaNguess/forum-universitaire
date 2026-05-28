import { useColorScheme } from 'react-native';

export const colors = {
  dark: {
    background:  '#0F0A1E',
    surface:     '#1A1033',
    card:        '#221844',
    border:      '#2D1F5E',
    text:        '#F5F3FF',
    subtext:     '#9CA3AF',
    primary:     '#A78BFA',
    primaryDark: '#7C3AED',
    white:       '#FFFFFF',
  },
  light: {
    background:  '#F5F3FF',
    surface:     '#FFFFFF',
    card:        '#EDE9FE',
    border:      '#DDD6FE',
    text:        '#1F1F2E',
    subtext:     '#6B7280',
    primary:     '#7C3AED',
    primaryDark: '#5B21B6',
    white:       '#FFFFFF',
  }
};

export const semantic = {
  success:   '#059669', successBg:  '#D1FAE5',
  warning:   '#D97706', warningBg:  '#FEF3C7',
  error:     '#DC2626', errorBg:    '#FEE2E2',
};

export const tabBar = {
  background:   '#1A1033',
  borderTop:    '#2D1F5E',
  activeTint:   '#A78BFA',
  inactiveTint: '#6B7280',
};

export const useTheme = () => {
  const scheme = useColorScheme();
  return colors[scheme === 'dark' ? 'dark' : 'light'];
};