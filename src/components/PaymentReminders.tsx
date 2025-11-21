import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { usePagos } from '../hooks/usePagos';
import { useAuth } from 'providers/AuthProvider';
import { PagoWithRelations } from 'lib/api/pagos';

// Tipo para los recordatorios agrupados por día
type DayReminder = {
  fecha: Date;
  totalDia: number;
  pagos: PagoWithRelations[];
};

export function PaymentReminders() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Obtener usuario del contexto de autenticación
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  // Obtener pagos del usuario
  const { data: pagos, isLoading, error } = usePagos(userId);

  // Calcular recordatorios de pagos pendientes (incluye vencidos y futuros)
  const calendarReminders = useMemo(() => {
    if (!pagos) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrar solo pagos pendientes (incluye vencidos)
    const pendingPayments = pagos.filter((pago) => {
      return pago.estado === 'Pendiente';
    });

    // Agrupar pagos por día
    const groupedByDay = pendingPayments.reduce((acc, pago) => {
      const dateKey = new Date(pago.fecha_vencimiento).toDateString();

      if (!acc[dateKey]) {
        acc[dateKey] = {
          fecha: new Date(pago.fecha_vencimiento),
          totalDia: 0,
          pagos: [],
        };
      }

      acc[dateKey].totalDia += Number(pago.monto) || 0;
      acc[dateKey].pagos.push(pago);

      return acc;
    }, {} as Record<string, DayReminder>);

    // Convertir a array y ordenar por fecha
    return Object.values(groupedByDay).sort(
      (a, b) => a.fecha.getTime() - b.fecha.getTime()
    );
  }, [pagos]);

  // Formatear moneda colombiana
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha completa
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Verificar si es hoy
  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === today.getTime();
  };

  // Verificar si está vencido
  const isPastDue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Verificar si es esta semana (próximos 7 días)
  const isThisWeek = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeek = new Date();
    oneWeek.setDate(today.getDate() + 7);
    oneWeek.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate >= today && compareDate <= oneWeek;
  };

  // Obtener estilos de la tarjeta según la fecha
  const getCardStyle = (date: Date) => {
    if (isPastDue(date)) {
      return [styles.reminderCard, styles.reminderCardOverdue, isDark && styles.reminderCardOverdueDark];
    }
    if (isToday(date)) {
      return [styles.reminderCard, styles.reminderCardToday, isDark && styles.reminderCardTodayDark];
    }
    if (isThisWeek(date)) {
      return [styles.reminderCard, styles.reminderCardWeek, isDark && styles.reminderCardWeekDark];
    }
    return [styles.reminderCard, isDark && styles.reminderCardDark];
  };

  // Obtener badge de días restantes
  const getDaysBadge = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const diffTime = compareDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`,
        style: [styles.badge, styles.badgeOverdue],
        textStyle: styles.badgeTextWhite,
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Hoy',
        style: [styles.badge, styles.badgeToday],
        textStyle: styles.badgeTextWhite,
      };
    }
    if (diffDays === 1) {
      return {
        text: 'Mañana',
        style: [styles.badge, styles.badgeTomorrow, isDark && styles.badgeTomorrowDark],
        textStyle: [styles.badgeText, isDark && styles.badgeTextDark],
      };
    }
    if (diffDays <= 7) {
      return {
        text: `En ${diffDays} días`,
        style: [styles.badge, styles.badgeWeek, isDark && styles.badgeWeekDark],
        textStyle: [styles.badgeText, isDark && styles.badgeTextDark],
      };
    }
    return {
      text: `En ${diffDays} días`,
      style: [styles.badge, styles.badgeDefault, isDark && styles.badgeDefaultDark],
      textStyle: [styles.badgeText, isDark && styles.badgeTextDark],
    };
  };

  // Agrupar recordatorios por mes
  const remindersByMonth = useMemo(() => {
    return calendarReminders.reduce((acc, reminder) => {
      const monthKey = reminder.fecha.toLocaleString('es-CO', {
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

  // Estilos dinámicos
  const dynamicStyles = {
    container: [styles.container, isDark && styles.containerDark],
    card: [styles.card, isDark && styles.cardDark],
    title: [styles.title, isDark && styles.titleDark],
    emptyText: [styles.emptyText, isDark && styles.emptyTextDark],
    monthTitle: [styles.monthTitle, isDark && styles.monthTitleDark],
    dateText: [styles.dateText, isDark && styles.dateTextDark],
    countText: [styles.countText, isDark && styles.countTextDark],
    totalText: [styles.totalText, isDark && styles.totalTextDark],
    pagoTitle: [styles.pagoTitle, isDark && styles.pagoTitleDark],
    pagoCategory: [styles.pagoCategory, isDark && styles.pagoCategoryDark],
    pagoAmount: [styles.pagoAmount, isDark && styles.pagoAmountDark],
    summaryLabel: [styles.summaryLabel, isDark && styles.summaryLabelDark],
    summaryValue: [styles.summaryValue, isDark && styles.summaryValueDark],
  };

  // Si no hay sesión
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

  // Manejo de errores
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

  // Loading
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

  // Sin recordatorios
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

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>📅 Recordatorios</Text>
          <View style={[styles.badge, styles.badgeInfo, isDark && styles.badgeInfoDark]}>
            <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
              {calendarReminders.length} días
            </Text>
          </View>
        </View>

        {/* Lista de recordatorios agrupados por mes */}
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
                      key={`${reminder.fecha.toISOString()}-${index}`}
                      style={getCardStyle(reminder.fecha)}
                    >
                      {/* Header del día */}
                      <View style={styles.reminderHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={dynamicStyles.dateText}>
                            {formatDate(reminder.fecha)}
                          </Text>
                          <View style={styles.badgeRow}>
                            <View style={daysBadge.style}>
                              <Text style={daysBadge.textStyle}>{daysBadge.text}</Text>
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

                      {/* Lista de pagos del día */}
                      <View style={styles.pagosContainer}>
                        {reminder.pagos.map((pago) => (
                          <View
                            key={pago.id_pago}
                            style={[styles.pagoCard, isDark && styles.pagoCardDark]}
                          >
                            <View style={styles.pagoInfo}>
                              <Text style={dynamicStyles.pagoTitle} numberOfLines={1}>
                                {pago.categoria?.nombre || 'Sin categoría'}
                              </Text>
                              <Text style={dynamicStyles.pagoCategory} numberOfLines={1}>
                                {pago.categoria?.nombre || 'Sin categoría'}
                              </Text>
                            </View>
                            <Text style={dynamicStyles.pagoAmount}>
                              {formatCurrency(Number(pago.monto) || 0)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Resumen total */}
        <View style={[styles.summary, isDark && styles.summaryDark]}>
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
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#0a0a0a',
  },

  // Card
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

  // Header
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

  // Empty State
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

  // Month Section
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

  // Reminders Container
  remindersScrollContainer: {
    maxHeight: 400,
  },
  remindersContainer: {
    gap: 0,
  },

  // Reminder Card
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

  // Reminder Header
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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

  // Badge Row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  // Badges
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
    borderColor: '#525252',
  },
  badgeInfo: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  badgeInfoDark: {
    backgroundColor: '#404040',
    borderColor: '#525252',
  },

  // Count Text
  countText: {
    fontSize: 12,
    color: '#737373',
  },
  countTextDark: {
    color: '#a3a3a3',
  },

  // Total Container
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

  // Pagos Container
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

  // Summary
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
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

  // Loading
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },

  // Error
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