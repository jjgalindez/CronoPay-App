import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { usePagos } from '../hooks/usePagos';
import { useAuth } from 'providers/AuthProvider';
import { PagoWithRelations } from 'lib/api/pagos';
import { getDaysUntil, isToday as checkIsToday, isOverdue as checkIsOverdue } from '@/utils/dateHelpers';

type DayReminder = {
  fecha: string;
  totalDia: number;
  pagos: PagoWithRelations[];
};

export function PaymentReminders() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const { data: pagos, isLoading, error } = usePagos(userId ?? undefined, {
    enabled: Boolean(userId),
  });

  const calendarReminders = useMemo(() => {
    if (!pagos || !Array.isArray(pagos)) {
      console.log('No hay pagos o no es array:', pagos);
      return [];
    }

    console.log('Total de pagos recibidos:', pagos.length);

    const pendingPayments = pagos.filter((pago) => {
      return pago.estado === 'Pendiente';
    });

    console.log('Pagos pendientes:', pendingPayments.length);

    const groupedByDay = pendingPayments.reduce((acc, pago) => {
      const dateKey = pago.fecha_vencimiento;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          fecha: pago.fecha_vencimiento,
          totalDia: 0,
          pagos: [],
        };
      }
      acc[dateKey].totalDia += Number(pago.monto) || 0;
      acc[dateKey].pagos.push(pago);

      return acc;
    }, {} as Record<string, DayReminder>);

    const result = Object.values(groupedByDay).sort(
      (a, b) => a.fecha.localeCompare(b.fecha)
    );

    console.log('Días con pagos agrupados:', result.length);
    console.log('Detalle de días:', result.map(r => ({ fecha: r.fecha, cantidad: r.pagos.length })));

    return result;
  }, [pagos]);

  const remindersByMonth = useMemo(() => {
    return calendarReminders.reduce((acc, reminder) => {
      const [year, month] = reminder.fecha.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const monthKey = date.toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
      });

      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(reminder);

      return acc;
    }, {} as Record<string, DayReminder[]>);
  }, [calendarReminders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const isToday = (dateStr: string) => {
    return checkIsToday(dateStr);
  };

  const isPastDue = (dateStr: string) => {
    return checkIsOverdue(dateStr);
  };

  const isThisWeek = (dateStr: string) => {
    const days = getDaysUntil(dateStr);
    return days >= 0 && days <= 7;
  };

  const getCardStyle = (dateStr: string): StyleProp<ViewStyle> => {
    const baseStyle: StyleProp<ViewStyle>[] = [styles.reminderCard];

    if (isDark) {
      baseStyle.push(styles.reminderCardDark);
    }

    if (isPastDue(dateStr)) {
      baseStyle.push(styles.reminderCardOverdue);
      if (isDark) baseStyle.push(styles.reminderCardOverdueDark);
    } else if (isToday(dateStr)) {
      baseStyle.push(styles.reminderCardToday);
      if (isDark) baseStyle.push(styles.reminderCardTodayDark);
    } else if (isThisWeek(dateStr)) {
      baseStyle.push(styles.reminderCardWeek);
      if (isDark) baseStyle.push(styles.reminderCardWeekDark);
    }

    return baseStyle;
  };

  const getDaysBadge = (dateStr: string) => {
    const diffDays = getDaysUntil(dateStr);

    if (diffDays < 0) {
      return {
        text: `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        style: [styles.badge, styles.badgeOverdue],
        textStyle: [styles.badgeTextWhite],
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Hoy',
        style: [styles.badge, styles.badgeToday],
        textStyle: [styles.badgeTextWhite],
      };
    }
    if (diffDays === 1) {
      const badgeStyles = [styles.badge, styles.badgeTomorrow];
      const textStyles: any[] = [styles.badgeText];
      if (isDark) {
        badgeStyles.push(styles.badgeTomorrowDark);
        textStyles.push(styles.badgeTextDark);
      }
      return {
        text: 'Mañana',
        style: badgeStyles,
        textStyle: textStyles,
      };
    }
    if (diffDays <= 7) {
      const badgeStyles = [styles.badge, styles.badgeWeek];
      const textStyles: any[] = [styles.badgeText];
      if (isDark) {
        badgeStyles.push(styles.badgeWeekDark);
        textStyles.push(styles.badgeTextDark);
      }
      return {
        text: `En ${diffDays} días`,
        style: badgeStyles,
        textStyle: textStyles,
      };
    }
    
    const badgeStyles = [styles.badge, styles.badgeDefault];
    const textStyles: any[] = [styles.badgeText];
    if (isDark) {
      badgeStyles.push(styles.badgeDefaultDark);
      textStyles.push(styles.badgeTextDark);
    }
    return {
      text: `En ${diffDays} días`,
      style: badgeStyles,
      textStyle: textStyles,
    };
  };

  const dynamicStyles = {
    container: isDark ? [styles.container, styles.containerDark] : [styles.container],
    card: isDark ? [styles.card, styles.cardDark] : [styles.card],
    title: isDark ? [styles.title, styles.titleDark] : [styles.title],
    emptyText: isDark ? [styles.emptyText, styles.emptyTextDark] : [styles.emptyText],
    monthTitle: isDark ? [styles.monthTitle, styles.monthTitleDark] : [styles.monthTitle],
    dateText: isDark ? [styles.dateText, styles.dateTextDark] : [styles.dateText],
    countText: isDark ? [styles.countText, styles.countTextDark] : [styles.countText],
    totalText: isDark ? [styles.totalText, styles.totalTextDark] : [styles.totalText],
    pagoTitle: isDark ? [styles.pagoTitle, styles.pagoTitleDark] : [styles.pagoTitle],
    pagoCategory: isDark ? [styles.pagoCategory, styles.pagoCategoryDark] : [styles.pagoCategory],
    pagoAmount: isDark ? [styles.pagoAmount, styles.pagoAmountDark] : [styles.pagoAmount],
    summaryLabel: isDark ? [styles.summaryLabel, styles.summaryLabelDark] : [styles.summaryLabel],
    summaryValue: isDark ? [styles.summaryValue, styles.summaryValueDark] : [styles.summaryValue],
  };

  if (!session && !isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>🔒</Text>
            <Text style={styles.errorText}>No autenticado</Text>
            <Text style={styles.errorSubtext}>
              Debes iniciar sesión para ver tus recordatorios
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Error al cargar recordatorios</Text>
            <Text style={styles.errorSubtext}>{error.message}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={dynamicStyles.emptyText}>Cargando recordatorios...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (calendarReminders.length === 0) {
    return (
      <View style={dynamicStyles.container}>
        <View style={dynamicStyles.card}>
          <View style={styles.header}>
            <Text style={dynamicStyles.title}>📅 Recordatorios</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={dynamicStyles.emptyText}>
              No hay recordatorios de pagos pendientes
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const badgeInfoStyles = isDark ? [styles.badge, styles.badgeInfo, styles.badgeInfoDark] : [styles.badge, styles.badgeInfo];
  const badgeInfoTextStyles = isDark ? [styles.badgeText, styles.badgeTextDark] : [styles.badgeText];

  const totalPagos = calendarReminders.reduce((sum, reminder) => sum + reminder.pagos.length, 0);

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.card}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>📅 Recordatorios</Text>
          <View style={badgeInfoStyles}>
            <Text style={badgeInfoTextStyles}>
              {totalPagos} pago{totalPagos !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <ScrollView 
          style={styles.remindersScrollContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.remindersContainer}>
            {Object.entries(remindersByMonth).map(([month, reminders]) => (
              <View key={month} style={styles.monthSection}>
                <Text style={dynamicStyles.monthTitle}>{month}</Text>

                {reminders.map((reminder, index) => {
                  const daysBadge = getDaysBadge(reminder.fecha);

                  return (
                    <View
                      key={`${reminder.fecha}-${index}`}
                      style={getCardStyle(reminder.fecha)}
                    >
                      <View style={styles.reminderHeader}>
                        <View style={styles.reminderHeaderLeft}>
                          <Text style={dynamicStyles.dateText}>
                            {formatDate(reminder.fecha)}
                          </Text>
                          <View style={styles.badgeRow}>
                            <View style={daysBadge.style}>
                              <Text style={daysBadge.textStyle}>
                                {daysBadge.text}
                              </Text>
                            </View>
                            <Text style={dynamicStyles.countText}>
                              {reminder.pagos.length} pago
                              {reminder.pagos.length !== 1 ? 's' : ''}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.totalContainer}>
                          <Text style={dynamicStyles.totalText}>
                            {formatCurrency(reminder.totalDia)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.pagosContainer}>
                        {reminder.pagos.map((pago, pagoIndex) => {
                          const pagoCardStyles = isDark ? [styles.pagoCard, styles.pagoCardDark] : [styles.pagoCard];
                          
                          return (
                            <View
                              key={`${pago.id_pago}-${pagoIndex}`}
                              style={pagoCardStyles}
                            >
                              <View style={styles.pagoInfo}>
                                <Text style={dynamicStyles.pagoTitle} numberOfLines={1}>
                                  {pago.titulo}
                                </Text>
                                <Text style={dynamicStyles.pagoCategory} numberOfLines={1}>
                                  {pago.categoria?.nombre || 'Sin categoría'}
                                </Text>
                              </View>
                              <Text style={dynamicStyles.pagoAmount}>
                                {formatCurrency(Number(pago.monto) || 0)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={isDark ? [styles.summary, styles.summaryDark] : [styles.summary]}>
          <View style={styles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Total Pagos:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {formatCurrency(
                calendarReminders.reduce((sum, reminder) => sum + reminder.totalDia, 0)
              )}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Días con pagos:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {calendarReminders.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={dynamicStyles.summaryLabel}>Total de pagos pendientes:</Text>
            <Text style={dynamicStyles.summaryValue}>
              {totalPagos}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#0a0a0a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardDark: {
    backgroundColor: '#171717',
    borderColor: '#262626',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  titleDark: {
    color: '#fafafa',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#a3a3a3',
  },
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  monthTitleDark: {
    color: '#fafafa',
  },
  remindersScrollContainer: {
    maxHeight: 400,
  },
  remindersContainer: {
    gap: 0,
  },
  reminderCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  reminderCardDark: {
    backgroundColor: '#262626',
    borderColor: '#404040',
  },
  reminderCardOverdue: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  reminderCardOverdueDark: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  reminderCardToday: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  reminderCardTodayDark: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reminderCardWeek: {
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
  },
  reminderCardWeekDark: {
    borderColor: '#fb923c',
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderHeaderLeft: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  dateTextDark: {
    color: '#fafafa',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  badgeTextDark: {
    color: '#fafafa',
  },
  badgeTextWhite: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  badgeOverdue: {
    backgroundColor: '#ef4444',
  },
  badgeToday: {
    backgroundColor: '#ef4444',
  },
  badgeTomorrow: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  badgeTomorrowDark: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#525252',
  },
  badgeWeek: {
    backgroundColor: '#d1d5db',
  },
  badgeWeekDark: {
    backgroundColor: '#404040',
  },
  badgeDefault: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  badgeDefaultDark: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#525252',
  },
  badgeInfo: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#525252',
  },
  badgeInfoDark: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#525252',
  },
  countText: {
    fontSize: 12,
    color: '#737373',
  },
  countTextDark: {
    color: '#a3a3a3',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  totalTextDark: {
    color: '#fafafa',
  },
  pagosContainer: {
    gap: 8,
  },
  pagoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  pagoCardDark: {
    backgroundColor: '#171717',
    borderColor: '#404040',
  },
  pagoInfo: {
    flex: 1,
    marginRight: 12,
  },
  pagoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0a0a',
    marginBottom: 2,
  },
  pagoTitleDark: {
    color: '#fafafa',
  },
  pagoCategory: {
    fontSize: 12,
    color: '#737373',
    textTransform: 'capitalize',
  },
  pagoCategoryDark: {
    color: '#a3a3a3',
  },
  pagoAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  pagoAmountDark: {
    color: '#fafafa',
  },
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    gap: 8,
  },
  summaryDark: {
    borderTopColor: '#262626',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#737373',
  },
  summaryLabelDark: {
    color: '#a3a3a3',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  summaryValueDark: {
    color: '#fafafa',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  },
});