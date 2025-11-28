import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePagos } from '@/hooks/usePagos';
import { useAuth } from '../../../providers/AuthProvider';
import { useTema } from '@/hooks/useTema';
import { PagoWithRelations } from 'lib/api/pagos';
import { AddPaymentModal } from '../../components/AddPaymentModal';
import { PagoCard } from '../../components/PagoCard';
import { usePagoActions } from '@/hooks/usePagoActions';
import { useOptimisticPagos } from '@/hooks/useOptimisticPagos';
import { useTranslation } from 'react-i18next';

type DayReminder = {
  fecha: string;
  totalDia: number;
  pagos: PagoWithRelations[];
};

export default function PagosScreen() {
  const { t } = useTranslation();
  const { tema } = useTema();
  const isDark = tema === 'dark';

  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const { data: pagos, isLoading, error, refetch } = usePagos(userId);

  // Estado optimista para actualizaciones inmediatas
  const {
    pagos: optimisticPagos,
    updatePagoInState,
    removePagoFromState,
    setPagosState,
    addPagoToState
  } = useOptimisticPagos(pagos || []);

  // Sincronizar cuando cambien los datos de la API
  React.useEffect(() => {
    if (pagos) {
      setPagosState(pagos);
    }
  }, [pagos, setPagosState]);

  const handleActionSuccess = () => {
    refetch();
  };

  const { loadingAction, handleMarkAsPaid, handleDeletePago } = usePagoActions(handleActionSuccess);

  // Versión optimista de las funciones
  const optimisticMarkAsPaid = async (pago: PagoWithRelations) => {
    updatePagoInState(pago.id_pago, { estado: 'Pagado' });
    const success = await handleMarkAsPaid(pago);
    if (!success) {
      updatePagoInState(pago.id_pago, { estado: 'Pendiente' });
    }
    return success;
  };

  const optimisticDeletePago = async (pago: PagoWithRelations) => {
    const pagoBackup = { ...pago };
    removePagoFromState(pago.id_pago);
    const success = await handleDeletePago(pago);
    if (!success) {
      addPagoToState(pagoBackup);
    }
    return success;
  };

  // Filtrar pagos como lo hace el calendario
  const currentDate = useMemo(() => new Date(), []);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const pagosFiltrados = useMemo(() => {
    if (!optimisticPagos || !Array.isArray(optimisticPagos) || isLoading) {
      return [];
    }

    // Filtrar solo los pagos del mes actual, igual que en el calendario
    const filtered = optimisticPagos.filter((pago) => {
      const pagoDate = new Date(pago.fecha_vencimiento);
      return pagoDate.getFullYear() === year && pagoDate.getMonth() === month;
    });

    return filtered;
  }, [optimisticPagos, isLoading, year, month]);

  // Agrupación exacta como en PaymentCalendar
  const calendarReminders = useMemo(() => {
    if (!pagosFiltrados || pagosFiltrados.length === 0) {
      return [];
    }

    const groupedByDay = pagosFiltrados.reduce((acc, pago) => {
      const dateKey = pago.fecha_vencimiento;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          fecha: dateKey,
          totalDia: 0,
          pagos: [],
        };
      }

      const monto = Number(pago.monto) || 0;
      acc[dateKey].totalDia += monto;
      acc[dateKey].pagos.push(pago);

      return acc;
    }, {} as Record<string, DayReminder>);

    const result = Object.values(groupedByDay).sort(
      (a, b) => a.fecha.localeCompare(b.fecha)
    );

    return result;
  }, [pagosFiltrados]);

  const remindersByMonth = useMemo(() => {
    return calendarReminders.reduce((acc, reminder) => {
      const [year, month, day] = reminder.fecha.split('-').map(Number);
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

  // Funciones auxiliares
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

  const getDaysUntil = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const isToday = (dateStr: string) => {
    return getDaysUntil(dateStr) === 0;
  };

  const isPastDue = (dateStr: string) => {
    return getDaysUntil(dateStr) < 0;
  };

  const isThisWeek = (dateStr: string) => {
    const days = getDaysUntil(dateStr);
    return days >= 0 && days <= 7;
  };

  const getCardStyle = (dateStr: string, hasPendingPayments: boolean): ViewStyle[] => {
    if (!hasPendingPayments) {
      return isDark ? [styles.reminderCard, styles.reminderCardDark] : [styles.reminderCard];
    }

    if (isPastDue(dateStr)) {
      return isDark ? [styles.reminderCard, styles.reminderCardOverdueDark] : [styles.reminderCard, styles.reminderCardOverdue];
    } else if (isToday(dateStr)) {
      return isDark ? [styles.reminderCard, styles.reminderCardTodayDark] : [styles.reminderCard, styles.reminderCardToday];
    } else if (isThisWeek(dateStr)) {
      return isDark ? [styles.reminderCard, styles.reminderCardWeekDark] : [styles.reminderCard, styles.reminderCardWeek];
    }
    return isDark ? [styles.reminderCard, styles.reminderCardDark] : [styles.reminderCard];
  };

  const getDaysBadge = (dateStr: string, hasPendingPayments: boolean) => {
    if (!hasPendingPayments) {
      return null;
    }

    const diffDays = getDaysUntil(dateStr);

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} ${Math.abs(diffDays) !== 1 ? t('DaysAgo') : t('DayAgo')}`,
        badgeStyle: styles.badgeOverdue as ViewStyle,
        textStyle: styles.badgeTextWhite as TextStyle,
      };
    }
    if (diffDays === 0) {
      return {
        text: t('Today'),
        badgeStyle: styles.badgeToday as ViewStyle,
        textStyle: styles.badgeTextWhite as TextStyle,
      };
    }
    if (diffDays === 1) {
      return {
        text: t('Tomorrow'),
        badgeStyle: (isDark ? styles.badgeTomorrowDark : styles.badgeTomorrow) as ViewStyle,
        textStyle: (isDark ? styles.badgeTextDark : styles.badgeText) as TextStyle,
      };
    }
    if (diffDays <= 7) {
      return {
        text: `${t('InDays')} ${diffDays} ${t('InDaysPlural')}`,
        badgeStyle: (isDark ? styles.badgeWeekDark : styles.badgeWeek) as ViewStyle,
        textStyle: (isDark ? styles.badgeTextDark : styles.badgeText) as TextStyle,
      };
    }

    return {
      text: `${t('InDays')} ${diffDays} ${t('InDaysPlural')}`,
      badgeStyle: (isDark ? styles.badgeDefaultDark : styles.badgeDefault) as ViewStyle,
      textStyle: (isDark ? styles.badgeTextDark : styles.badgeText) as TextStyle,
    };
  };

  // Estilos dinámicos con tipos correctos
  const dynamicStyles = useMemo(() => {
    const baseTextStyle = {
      fontSize: 14,
      color: isDark ? "#fafafa" : "#0a0a0a",
    }

    return {
      container: {
        flex: 1,
        backgroundColor: isDark ? "#0f172b" : "#f5f5f5",
      },
      card: {
        backgroundColor: isDark ? "#0B1220" : "#ffffff",
        borderRadius: 12,
        padding: 16,
        margin: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: isDark ? "#101828" : "#e5e5e5",
      },
      title: {
        fontSize: 24,
        fontWeight: "bold" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
      },
      subtitle: {
        fontSize: 14,
        color: isDark ? "#a3a3a3" : "#737373",
        marginTop: 4,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: "bold" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
      },
      monthTitle: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
        marginBottom: 12,
        textTransform: "capitalize" as const,
      },
      dateText: {
        fontSize: 14,
        fontWeight: "500" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
        textTransform: "capitalize" as const,
        marginBottom: 4,
      },
      countText: {
        fontSize: 12,
        color: isDark ? "#a3a3a3" : "#737373",
      },
      totalText: {
        fontSize: 16,
        fontWeight: "bold" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
      },
      summaryLabel: {
        fontSize: 14,
        color: isDark ? "#a3a3a3" : "#737373",
      },
      summaryValue: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: isDark ? "#fafafa" : "#0a0a0a",
      },
      summaryValuePending: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: isDark ? "#fb923c" : "#ea580c",
      },
      summaryValuePaid: {
        fontSize: 14,
        fontWeight: "600" as const,
        color: isDark ? "#4ade80" : "#16a34a",
      },
      emptyText: {
        fontSize: 14,
        color: isDark ? "#a3a3a3" : "#737373",
        textAlign: "center" as const,
      },
      loadingText: {
        fontSize: 14,
        color: isDark ? "#a3a3a3" : "#737373",
      },
      errorText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: "#ef4444",
        marginBottom: 8,
      },
      errorSubtext: {
        fontSize: 12,
        color: isDark ? "#a3a3a3" : "#737373",
        textAlign: "center" as const,
      },
    }
  }, [isDark]);

  // Manejo de estados de carga y error...
  if (!session && !isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.mainContainer}>
          <View style={dynamicStyles.card}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>🔒</Text>
              <Text style={dynamicStyles.errorText}>{t('NotAuthenticated')}</Text>
              <Text style={dynamicStyles.errorSubtext}>{t('MustLoginToSeePayments')}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={dynamicStyles.title}>{t('PaymentsTitle')}</Text>
            <Text style={dynamicStyles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={dynamicStyles.card}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={dynamicStyles.errorText}>{t('ErrorLoadingPayments')}</Text>
              <Text style={dynamicStyles.errorSubtext}>{error.message}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={dynamicStyles.title}>{t('PaymentsTitle')}</Text>
            <Text style={dynamicStyles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={dynamicStyles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={dynamicStyles.loadingText}>{t('LoadingPayments')}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!pagosFiltrados || calendarReminders.length === 0) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={dynamicStyles.title}>{t('PaymentsTitle')}</Text>
            <Text style={dynamicStyles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={dynamicStyles.card}>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={dynamicStyles.emptyText}>
                {t('NoPaymentsRegisteredThisMonth')}
              </Text>
              <Text style={[dynamicStyles.emptyText, styles.emptySubtext]}>
                {t('CanStartAddingOne')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <AddPaymentModal onPaymentAdded={refetch} />
        </View>
      </SafeAreaView>
    );
  }

  // Actualizar los totales para usar pagosFiltrados
  const totalPagos = calendarReminders.reduce((sum, reminder) => sum + reminder.pagos.length, 0);
  const totalPendientes = pagosFiltrados.filter(p => p.estado === 'Pendiente').length;
  const totalPagados = pagosFiltrados.filter(p => p.estado === 'Pagado').length;

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerSection}>
          <Text style={dynamicStyles.title}>{t('PaymentsTitle')}</Text>
          <Text style={dynamicStyles.subtitle}>
            {t('ReviewUpcomingObligations')}
          </Text>
        </View>

        <View style={dynamicStyles.card}>
          <View style={styles.header}>
            <View style={isDark ? styles.badgeInfoDark : styles.badgeInfo}>
              <Text style={dynamicStyles.headerTitle}>{t('AllPayments')}</Text>
              <Text style={isDark ? styles.badgeTextDark : styles.badgeText}>
                {totalPagos} {t('Payment')}{totalPagos !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.remindersScrollContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
          >
            <View style={styles.remindersContainer}>
              {Object.entries(remindersByMonth).map(([month, reminders]) => (
                <View key={month} style={styles.monthSection}>
                  <Text style={dynamicStyles.monthTitle}>{month}</Text>

                  {reminders.map((reminder, index) => {
                    const hasPendingPayments = reminder.pagos.some(p => p.estado === 'Pendiente');
                    const daysBadge = getDaysBadge(reminder.fecha, hasPendingPayments);

                    return (
                      <View
                        key={`${reminder.fecha}-${index}`}
                        style={getCardStyle(reminder.fecha, hasPendingPayments)}
                      >
                        <View style={styles.reminderHeader}>
                          <View style={styles.reminderHeaderLeft}>
                            <Text style={dynamicStyles.dateText}>
                              {formatDate(reminder.fecha)}
                            </Text>
                            <View style={styles.badgeRow}>
                              {daysBadge && (
                                <View style={daysBadge.badgeStyle}>
                                  <Text style={daysBadge.textStyle}>
                                    {daysBadge.text}
                                  </Text>
                                </View>
                              )}
                              <Text style={dynamicStyles.countText}>
                                {reminder.pagos.length} pago{reminder.pagos.length !== 1 ? 's' : ''}
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
                          {reminder.pagos.map((pago, pagoIndex) => (
                            <PagoCard
                              key={`${pago.id_pago}-${pagoIndex}`}
                              pago={pago}
                              onMarkAsPaid={optimisticMarkAsPaid}
                              onDelete={optimisticDeletePago}
                              loadingAction={loadingAction}
                              isDark={isDark}
                            />
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={isDark ? [styles.summary, styles.summaryDark] : styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>{t('GeneralTotal')}</Text>
              <Text style={dynamicStyles.summaryValue}>
                {formatCurrency(
                  calendarReminders.reduce((sum, reminder) => sum + reminder.totalDia, 0)
                )}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>{t('PendingPayments')}</Text>
              <Text style={dynamicStyles.summaryValuePending}>
                {totalPendientes} pago{totalPendientes !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>{t('PaidPayments')}</Text>
              <Text style={dynamicStyles.summaryValuePaid}>
                {totalPagados} pago{totalPagados !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={dynamicStyles.summaryLabel}>{t('DaysWithPayments')}</Text>
              <Text style={dynamicStyles.summaryValue}>
                {calendarReminders.length}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AddPaymentModal onPaymentAdded={refetch} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  emptySubtext: {
    marginTop: 8,
    fontSize: 12,
  },
  monthSection: {
    marginBottom: 24,
  },
  remindersScrollContainer: {
    maxHeight: 450,
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
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#1e293b',
    borderColor: '#404040',
    marginBottom: 12,
  },
  reminderCardOverdue: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
    marginBottom: 12,
  },
  reminderCardOverdueDark: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: "#2b1212",
    marginBottom: 12,
  },
  reminderCardToday: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    marginBottom: 12,
  },
  reminderCardTodayDark: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: "#0B1220",
    marginBottom: 12,
  },
  reminderCardWeek: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fb923c',
    backgroundColor: '#fff7ed',
    marginBottom: 12,
  },
  reminderCardWeekDark: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fb923c',
    backgroundColor: "#0B1220",
    marginBottom: 12,
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeToday: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeTomorrow: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeTomorrowDark: {
    backgroundColor: '#0f172b',
    borderWidth: 1,
    borderColor: '#525252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeWeek: {
    backgroundColor: '#d1d5db',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeWeekDark: {
    backgroundColor: '#404040',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeDefault: {
    backgroundColor: "#0B1220",
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeDefaultDark: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#525252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeInfo: {
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeInfoDark: {
    backgroundColor: '#053345',
    borderWidth: 1,
    borderColor: '#032e15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-end',
    margin: 'auto',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  pagosContainer: {
    gap: 8,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
});