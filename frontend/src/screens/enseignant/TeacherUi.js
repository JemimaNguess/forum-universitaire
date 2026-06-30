import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/theme';

export const teacherColors = {
  violet: '#6D3DDE',
  violetDark: '#4D28A8',
  violetSoft: '#EFE9FF',
  ink: '#151426',
  muted: '#7B7890',
  line: '#E8E4F2',
  page: '#F8F6FC',
  white: '#FFFFFF',
  success: '#22A06B',
  danger: '#E05252',
  warning: '#F2A63B',
  blue: '#3B82F6',
};

export const TeacherScreen = ({ title, subtitle, children, rightIcon = 'search-outline', onRightPress }) => {
  const c = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}> 
      <View style={[styles.header, { backgroundColor: c.background }] }>
        <View>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: c.subtext }]}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.border }] }
          onPress={onRightPress}
          activeOpacity={onRightPress ? 0.7 : 1}
        >
          <Ionicons name={rightIcon} size={20} color={c.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {children}
      </ScrollView>
    </View>
  );
};

export const Card = ({ children, style }) => {
  const c = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, style]}>
      {children}
    </View>
  );
};

export const Badge = ({ label, tone = 'violet' }) => {
  const c = useTheme();
  const toneStyles = {
    violet: { backgroundColor: c.primary + '22', color: c.primary },
    green: { backgroundColor: '#E8F7F0', color: '#059669' },
    red: { backgroundColor: '#FDECEC', color: '#DC2626' },
    orange: { backgroundColor: '#FFF4DE', color: '#D97706' },
  };
  const currentTone = toneStyles[tone] || toneStyles.violet;

  return (
    <View style={[styles.badge, { backgroundColor: currentTone.backgroundColor }] }>
      <Text style={[styles.badgeText, { color: currentTone.color }]}>{label}</Text>
    </View>
  );
};

export const ActionButton = ({ label, icon, variant = 'primary', onPress }) => {
  const c = useTheme();
  const variantStyles = {
    primary: { backgroundColor: c.primary },
    danger: { backgroundColor: teacherColors.danger },
    light: { backgroundColor: c.card, borderColor: c.border },
  };

  return (
    <TouchableOpacity
      style={[styles.actionBtn, styles[`action_${variant}`], variantStyles[variant]]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={variant === 'light' ? c.primary : c.white}
      />
      <Text style={[styles.actionText, variant === 'light' && styles.actionTextLight]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const EmptyState = ({ icon, title, text }) => {
  const c = useTheme();
  return (
    <Card style={styles.empty}>
      <Ionicons name={icon} size={30} color={c.primary} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: c.subtext }]}>{text}</Text>
    </Card>
  );
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: teacherColors.page,
  },
  title: {
    color: teacherColors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: teacherColors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: teacherColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: teacherColors.line,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  card: {
    backgroundColor: teacherColors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: teacherColors.line,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badge_violet: {
    backgroundColor: teacherColors.violetSoft,
  },
  badgeText_violet: {
    color: teacherColors.violet,
  },
  badge_green: {
    backgroundColor: '#E8F7F0',
  },
  badgeText_green: {
    color: teacherColors.success,
  },
  badge_red: {
    backgroundColor: '#FDECEC',
  },
  badgeText_red: {
    color: teacherColors.danger,
  },
  badge_orange: {
    backgroundColor: '#FFF4DE',
  },
  badgeText_orange: {
    color: teacherColors.warning,
  },
  actionBtn: {
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  action_primary: {
    backgroundColor: teacherColors.violet,
  },
  action_danger: {
    backgroundColor: teacherColors.danger,
  },
  action_light: {
    backgroundColor: teacherColors.violetSoft,
  },
  actionText: {
    color: teacherColors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  actionTextLight: {
    color: teacherColors.violet,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: teacherColors.ink,
  },
  emptyText: {
    color: teacherColors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
