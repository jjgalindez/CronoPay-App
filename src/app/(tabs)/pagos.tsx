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

  // Estado optimista para actualizaciones inmediatas - SOLO UNA DECLARACIÓN
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
    // Refrescar datos después de una acción exitosa
    refetch();
  };

  const { loadingAction, handleMarkAsPaid, handleDeletePago } = usePagoActions(handleActionSuccess);

  // Versión optimista de las funciones
  const optimisticMarkAsPaid = async (pago: PagoWithRelations) => {
    // Actualización optimista inmediata
    updatePagoInState(pago.id_pago, { estado: 'Pagado' });

    // Llamada real a la API
    const success = await handleMarkAsPaid(pago);

    if (!success) {
      // Revertir si falla
      updatePagoInState(pago.id_pago, { estado: 'Pendiente' });
    }

    return success;
  };

  const optimisticDeletePago = async (pago: PagoWithRelations) => {
    // Guardar copia para posible reversión
    const pagoBackup = { ...pago };

    // Eliminación optimista inmediata
    removePagoFromState(pago.id_pago);

    // Llamada real a la API
    const success = await handleDeletePago(pago);

    if (!success) {
      // Revertir si falla
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

    console.log('Total pagos recibidos:', optimisticPagos.length);

    // Filtrar solo los pagos del mes actual, igual que en el calendario
    const filtered = optimisticPagos.filter((pago) => {
      const pagoDate = new Date(pago.fecha_vencimiento);
      return pagoDate.getFullYear() === year && pagoDate.getMonth() === month;
    });

    console.log('Pagos del mes actual:', filtered.length);

    return filtered;
  }, [optimisticPagos, isLoading, year, month]);

  // Agrupación exacta como en PaymentCalendar
  const calendarReminders = useMemo(() => {
    if (!pagosFiltrados || pagosFiltrados.length === 0) {
      return [];
    }

    console.log('Procesando pagos filtrados:', pagosFiltrados.length);

    const groupedByDay = pagosFiltrados.reduce((acc, pago) => {
      const dateKey = pago.fecha_vencimiento;

      console.log('Procesando pago:', pago.titulo, 'Fecha:', dateKey, 'Monto:', pago.monto);

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

      console.log(`Agregado pago a ${dateKey}: ${pago.titulo} - $${monto}`);

      return acc;
    }, {} as Record<string, DayReminder>);

    const result = Object.values(groupedByDay).sort(
      (a, b) => a.fecha.localeCompare(b.fecha)
    );

    console.log('Días agrupados:', result.length);
    result.forEach(day => {
      console.log(`Fecha: ${day.fecha}, Pagos: ${day.pagos.length}, Total: ${day.totalDia}`);
      day.pagos.forEach(pago => {
        console.log(`  - ${pago.titulo}: $${pago.monto}`);
      });
    });

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

  // Resto de tus funciones auxiliares...
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
        text: `${t('DaysAgo')} ${Math.abs(diffDays)} ${Math.abs(diffDays) !== 1 ? t('Days') : t('Day')}`,
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

  // Manejo de estados de carga y error...
  if (!session && !isLoading) {
    return (
      <SafeAreaView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.mainContainer}>
          <View style={isDark ? [styles.card, styles.cardDark] : styles.card}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>🔒</Text>
              <Text style={styles.errorText}>{t('NotAuthenticated')}</Text>
              <Text style={styles.errorSubtext}>{t('MustLoginToSeePayments')}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={isDark ? [styles.title, styles.titleDark] : styles.title}>{t('PaymentsTitle')}</Text>
            <Text style={isDark ? [styles.subtitle, styles.subtitleDark] : styles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={isDark ? [styles.card, styles.cardDark] : styles.card}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{t('ErrorLoadingPayments')}</Text>
              <Text style={styles.errorSubtext}>{error.message}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={isDark ? [styles.title, styles.titleDark] : styles.title}>{t('PaymentsTitle')}</Text>
            <Text style={isDark ? [styles.subtitle, styles.subtitleDark] : styles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={isDark ? [styles.card, styles.cardDark] : styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={isDark ? [styles.emptyText, styles.emptyTextDark] : styles.emptyText}>{t('LoadingPayments')}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!pagosFiltrados || calendarReminders.length === 0) {
    return (
      <SafeAreaView style={isDark ? styles.containerDark : styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.headerSection}>
            <Text style={isDark ? [styles.title, styles.titleDark] : styles.title}>{t('PaymentsTitle')}</Text>
            <Text style={isDark ? [styles.subtitle, styles.subtitleDark] : styles.subtitle}>
              {t('ReviewUpcomingObligations')}
            </Text>
          </View>
          <View style={isDark ? [styles.card, styles.cardDark] : styles.card}>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={isDark ? [styles.emptyText, styles.emptyTextDark] : styles.emptyText}>
                {t('NoPaymentsRegisteredThisMonth')}
              </Text>
              <Text style={isDark ? [styles.emptyText, styles.emptyTextDark, styles.emptySubtext] : [styles.emptyText, styles.emptySubtext]}>
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
    <SafeAreaView style={isDark ? styles.containerDark : styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerSection}>
          <Text style={isDark ? [styles.title, styles.titleDark] : styles.title}>{t('PaymentsTitle')}</Text>
          <Text style={isDark ? [styles.subtitle, styles.subtitleDark] : styles.subtitle}>
            {t('ReviewUpcomingObligations')}
          </Text>
        </View>

        <View style={isDark ? [styles.card, styles.cardDark] : styles.card}>
          <View style={styles.header}>
            <View style={isDark ? styles.badgeInfoDark : styles.badgeInfo}>
              <Text style={isDark ? [styles.headerTitle, styles.headerTitleDark] : styles.headerTitle}>{t('AllPayments')}</Text>
              <Text style={isDark ? [styles.badgeText, styles.badgeTextDark] : styles.badgeText}>
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
                  <Text style={isDark ? [styles.monthTitle, styles.monthTitleDark] : styles.monthTitle}>{month}</Text>

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
                            <Text style={isDark ? [styles.dateText, styles.dateTextDark] : styles.dateText}>
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
                              <Text style={isDark ? [styles.countText, styles.countTextDark] : styles.countText}>
                                {reminder.pagos.length} pago{reminder.pagos.length !== 1 ? 's' : ''}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.totalContainer}>
                            <Text style={isDark ? [styles.totalText, styles.totalTextDark] : styles.totalText}>
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
              <Text style={isDark ? [styles.summaryLabel, styles.summaryLabelDark] : styles.summaryLabel}>{t('GeneralTotal')}</Text>
              <Text style={isDark ? [styles.summaryValue, styles.summaryValueDark] : styles.summaryValue}>
                {formatCurrency(
                  calendarReminders.reduce((sum, reminder) => sum + reminder.totalDia, 0)
                )}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={isDark ? [styles.summaryLabel, styles.summaryLabelDark] : styles.summaryLabel}>{t('PendingPayments')}</Text>
              <Text style={isDark ? [styles.summaryValuePending, styles.summaryValuePendingDark] : styles.summaryValuePending}>
                {totalPendientes} pago{totalPendientes !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={isDark ? [styles.summaryLabel, styles.summaryLabelDark] : styles.summaryLabel}>{t('PaidPayments')}</Text>
              <Text style={isDark ? [styles.summaryValuePaid, styles.summaryValuePaidDark] : styles.summaryValuePaid}>
                {totalPagados} pago{totalPagados !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={isDark ? [styles.summaryLabel, styles.summaryLabelDark] : styles.summaryLabel}>{t('DaysWithPayments')}</Text>
              <Text style={isDark ? [styles.summaryValue, styles.summaryValueDark] : styles.summaryValue}>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerSection: {
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  titleDark: {
    color: '#fafafa',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  headerTitleDark: {
    color: '#fafafa',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#737373',
  },
  subtitleDark: {
    color: '#a3a3a3',
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
    paddingVertical: 32,
  },
  emptyTextDark: {
    color: '#a3a3a3',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 12,
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
    backgroundColor: '#262626',
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
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
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
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
  dateText: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeOverdue: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeToday: {
    backgroundColor: '#ef4444',
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
    backgroundColor: '#404040',
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
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#d4d4d4',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    borderColor: '#525252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeInfoDark: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#525252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeStatusPending: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusPendingDark: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusTextPending: {
    fontSize: 10,
    fontWeight: '600',
    color: '#c2410c',
  },
  badgeStatusTextPendingDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fb923c',
  },
  badgeStatusPaid: {
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusPaidDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeStatusTextPaid: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803d',
  },
  badgeStatusTextPaidDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4ade80',
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
    marginBottom: 4,
  },
  pagoTitleDark: {
    color: '#fafafa',
  },
  pagoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  summaryValuePending: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ea580c',
  },
  summaryValuePendingDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fb923c',
  },
  summaryValuePaid: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  summaryValuePaidDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
});