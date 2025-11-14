import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  useColorScheme 
} from 'react-native';
import { usePagos } from '../hooks/usePagos';
import { useUsuarioPerfil } from '../hooks/useUsuarioPerfil';
import { PagoWithRelations } from 'lib/api/pagos';

export function PaymentCalendar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Obtener usuario actual (usa el hook sin parámetros; ajusta según tu lógica de auth si tu hook requiere un id)
  const { data: usuario } = useUsuarioPerfil(null);
  const { data: pagos, isLoading, error } = usePagos(usuario?.id);
  
  // Datos del mes actual
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Obtener el primer día del mes y cuántos días tiene
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  
  // Nombres de los días y mes
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  
  // Procesar pagos del mes actual
  const getPaymentsForCurrentMonth = () => {
    if (!pagos || isLoading) return [];
    
    return pagos.filter(pago => {
      const pagoDate = new Date(pago.fecha_vencimiento);
      return pagoDate.getFullYear() === year && pagoDate.getMonth() === month;
    });
  };
  
  // Obtener días con pagos
  const paymentsThisMonth = getPaymentsForCurrentMonth();
  const paymentDaysByDate = paymentsThisMonth.reduce((acc, pago) => {
    const day = new Date(pago.fecha_vencimiento).getDate();
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(pago);
    return acc;
  }, {} as Record<number, PagoWithRelations[]>);
  
  const today = currentDate.getDate();
  
  // Generar array de días del calendario
  const calendarDays: (number | null)[] = [];
  
  // Días vacíos del mes anterior
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Estilos dinámicos basados en tema
  const dynamicStyles = {
    card: [
      styles.card,
      isDark && styles.cardDark
    ],
    title: [
      styles.title,
      isDark && styles.titleDark
    ],
    subtitle: [
      styles.subtitle,
      isDark && styles.subtitleDark
    ],
    monthText: [
      styles.monthText,
      isDark && styles.monthTextDark
    ],
    weekDayText: [
      styles.weekDayText,
      isDark && styles.weekDayTextDark
    ],
    dayText: [
      styles.dayText,
      isDark && styles.dayTextDark
    ],
    legendText: [
      styles.legendText,
      isDark && styles.legendTextDark
    ],
    summaryTitle: [
      styles.summaryTitle,
      isDark && styles.summaryTitleDark
    ],
    summaryLabel: [
      styles.summaryLabel,
      isDark && styles.summaryLabelDark
    ],
  };

  // Manejo de errores
  if (error) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={dynamicStyles.card}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error al cargar los pagos</Text>
            <Text style={styles.errorSubtext}>{error.message}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Función para renderizar cada día
  const renderDay = (day: number | null, index: number) => {
    if (day === null) {
      return <View key={`empty-${index}`} style={styles.dayCell} />;
    }
    
    const isToday = day === today;
    const dayPayments = paymentDaysByDate[day] || [];
    const hasPayments = dayPayments.length > 0;
    
    // Contar pagos por estado
    const pendingPayments = dayPayments.filter(p => p.estado === 'Pendiente');
    const paidPayments = dayPayments.filter(p => p.estado === 'Pagado');
    
    // Determinar color basado en estado y si es vencido
    const isPastDue = new Date(year, month, day) < new Date() && pendingPayments.length > 0;
    
    let dayStyle: any = styles.dayCell;
    let textStyle: any = dynamicStyles.dayText;
    
    if (isToday) {
      dayStyle = [styles.dayCell, styles.dayToday];
      textStyle = [styles.dayText, styles.dayTodayText];
    } else if (hasPayments) {
      if (isPastDue) {
        dayStyle = [styles.dayCell, styles.dayOverdue];
        textStyle = [styles.dayText, styles.dayOverdueText];
      } else if (pendingPayments.length > 0) {
        dayStyle = [styles.dayCell, styles.dayPending, isDark && styles.dayPendingDark];
        textStyle = [styles.dayText, styles.dayPendingText, isDark && styles.dayPendingTextDark];
      } else {
        dayStyle = [styles.dayCell, styles.dayPaid, isDark && styles.dayPaidDark];
        textStyle = [styles.dayText, styles.dayPaidText, isDark && styles.dayPaidTextDark];
      }
    }
    
    return (
      <TouchableOpacity
        key={`day-${index}-${day}`}
        style={dayStyle}
        disabled={!hasPayments}
        activeOpacity={0.7}
        onPress={() => {
          if (hasPayments) {
            // Aquí puedes navegar a detalle o mostrar modal
            console.log(`Pagos del día ${day}:`, dayPayments.map(p => p.id_pago));
          }
        }}
      >
        <Text style={textStyle}>{day}</Text>
        {hasPayments && (
          <View style={styles.indicatorContainer}>
            {pendingPayments.length > 0 && (
              <View style={[styles.indicator, styles.indicatorPending]} />
            )}
            {paidPayments.length > 0 && (
              <View style={[styles.indicator, styles.indicatorPaid]} />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={dynamicStyles.card}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Calendario de Pagos</Text>
          {paymentsThisMonth.length > 0 && (
            <Text style={dynamicStyles.subtitle}>
              {paymentsThisMonth.length} pago(s) este mes
            </Text>
          )}
        </View>
        
        {/* Header del mes */}
        <View style={styles.monthHeader}>
          <Text style={dynamicStyles.monthText}>
            {monthNames[month]} {year}
          </Text>
        </View>
        
        {/* Días de la semana */}
        <View style={styles.weekDaysContainer}>
          {dayNames.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={dynamicStyles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>
        
        {/* Días del mes */}
        <View style={styles.daysContainer}>
          {calendarDays.map((day, index) => renderDay(day, index))}
        </View>
        
        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendToday]} />
            <Text style={dynamicStyles.legendText}>Hoy</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendPending, isDark && styles.legendPendingDark]} />
            <Text style={dynamicStyles.legendText}>Pendientes</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendOverdue]} />
            <Text style={dynamicStyles.legendText}>Vencidos</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.legendPaid, isDark && styles.legendPaidDark]} />
            <Text style={dynamicStyles.legendText}>Completados</Text>
          </View>
        </View>
        
        {/* Resumen del mes */}
        {paymentsThisMonth.length > 0 && (
          <View style={[styles.summary, isDark && styles.summaryDark]}>
            <Text style={dynamicStyles.summaryTitle}>Resumen del mes:</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValuePending, isDark && styles.summaryValuePendingDark]}>
                  {paymentsThisMonth.filter(p => p.estado === 'Pendiente').length}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Pendientes</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValuePaid, isDark && styles.summaryValuePaidDark]}>
                  {paymentsThisMonth.filter(p => p.estado === 'Pagado').length}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Pagados</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                  ${paymentsThisMonth.reduce((sum, p) => sum + Number(p.monto ?? 0), 0).toLocaleString()}
                </Text>
                <Text style={dynamicStyles.summaryLabel}>Total</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Cargando pagos...
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
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
  subtitle: {
    fontSize: 12,
    color: '#737373',
  },
  subtitleDark: {
    color: '#a3a3a3',
  },
  
  // Month Header
  monthHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  monthTextDark: {
    color: '#fafafa',
  },
  
  // Week Days
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#737373',
  },
  weekDayTextDark: {
    color: '#a3a3a3',
  },
  
  // Days Grid
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  dayText: {
    fontSize: 14,
    color: '#0a0a0a',
  },
  dayTextDark: {
    color: '#fafafa',
  },
  
  // Day States - Today
  dayToday: {
    backgroundColor: '#3b82f6',
  },
  dayTodayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Day States - Pending
  dayPending: {
    backgroundColor: '#fed7aa',
  },
  dayPendingDark: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
  },
  dayPendingText: {
    color: '#c2410c',
    fontWeight: '600',
  },
  dayPendingTextDark: {
    color: '#fb923c',
  },
  
  // Day States - Overdue
  dayOverdue: {
    backgroundColor: '#ef4444',
  },
  dayOverdueText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Day States - Paid
  dayPaid: {
    backgroundColor: '#bbf7d0',
  },
  dayPaidDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
  },
  dayPaidText: {
    color: '#15803d',
    fontWeight: '600',
  },
  dayPaidTextDark: {
    color: '#4ade80',
  },
  
  // Indicators
  indicatorContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  indicatorPending: {
    backgroundColor: '#c2410c',
  },
  indicatorPaid: {
    backgroundColor: '#15803d',
    opacity: 0.5,
  },
  
  // Legend
  legend: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendToday: {
    backgroundColor: '#3b82f6',
  },
  legendPending: {
    backgroundColor: '#fed7aa',
    borderWidth: 1,
    borderColor: '#fb923c',
  },
  legendPendingDark: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderColor: '#fb923c',
  },
  legendOverdue: {
    backgroundColor: '#ef4444',
  },
  legendPaid: {
    backgroundColor: '#bbf7d0',
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  legendPaidDark: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderColor: '#4ade80',
  },
  legendText: {
    fontSize: 12,
    color: '#737373',
  },
  legendTextDark: {
    color: '#a3a3a3',
  },
  
  // Summary
  summary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  summaryDark: {
    borderTopColor: '#262626',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0a0a0a',
  },
  summaryTitleDark: {
    color: '#fafafa',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0a0a',
  },
  summaryValueDark: {
    color: '#fafafa',
  },
  summaryValuePending: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ea580c',
  },
  summaryValuePendingDark: {
    color: '#fb923c',
  },
  summaryValuePaid: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  },
  summaryValuePaidDark: {
    color: '#4ade80',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#737373',
    marginTop: 4,
  },
  summaryLabelDark: {
    color: '#a3a3a3',
  },
  
  // Loading
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#737373',
  },
  loadingTextDark: {
    color: '#a3a3a3',
  },
  
  // Error
  errorContainer: {
    padding: 20,
    alignItems: 'center',
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