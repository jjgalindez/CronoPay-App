import React, { useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

export type PaymentItem = {
  id?: string
  title: string
  date: string | Date
  amount: number
  status?: 'Pagado' | 'Pendiente' | 'Rechazado' | string
  category?: string
  iconName?: string
  iconColor?: string
  iconBackgroundColor?: string
}

type PaymentsListProps = {
  items?: PaymentItem[]
  filterMonth?: number // 0-11 (Jan-Dec)
  filterCategory?: string
  title?: string
}

const STATUS_COLORS: Record<string, string> = {
  Pagado: '#12C48B',
  Pendiente: '#FFB020',
  Rechazado: '#FF6B6B',
}

function formatDate(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input
  try {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
  } catch (e) {
    return d.toLocaleDateString()
  }
}

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(value)
  } catch (e) {
    return value.toString()
  }
}

export default function PaymentsList({ 
  items = [], 
  filterMonth,
  filterCategory,
  title = "Detalle de Pagos"
}: PaymentsListProps) {
  // parse and sort by date desc
  const sorted = useMemo(() => {
    return [...items]
      .map((it) => ({ ...it, _date: typeof it.date === 'string' ? new Date(it.date) : it.date }))
      .sort((a, b) => (b._date as Date).getTime() - (a._date as Date).getTime())
  }, [items])

  // filter by month and/or category
  const filtered = useMemo(() => {
    let result = sorted

    // filter by month if specified
    if (filterMonth !== undefined) {
      result = result.filter((it) => {
        const itemDate = it._date as Date
        return itemDate.getMonth() === filterMonth
      })
    }

    // filter by category if specified
    if (filterCategory) {
      result = result.filter((it) => it.category === filterCategory)
    }

    return result
  }, [sorted, filterMonth, filterCategory])

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      
      {filtered.length === 0 ? (
        <Text style={styles.empty}>
          No hay pagos registrados para los filtros seleccionados.
        </Text>
      ) : (
        <View style={styles.listContainer}>
          <ScrollView 
            style={styles.scrollView}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {filtered.map((it, idx) => {
            const status = it.status ?? ''
            const statusColor = STATUS_COLORS[status] ?? '#D1E9E6'

            return (
              <View key={it.id ?? `${idx}`} style={styles.row}>
                <View style={[styles.avatar, { backgroundColor: it.iconBackgroundColor ?? '#E8F1FF' }]}> 
                  {it.iconName ? (
                    <Ionicons name={it.iconName as any} size={20} color={it.iconColor ?? '#1B3D48'} />
                  ) : null}
                </View>

                <View style={styles.meta}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {it.title}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatDate(it.date)}
                    {it.category ? ` • ${it.category}` : ''}
                  </Text>
                </View>

                <View style={styles.amountWrap}>
                  <Text style={styles.amount}>${formatCurrency(it.amount)}</Text>
                  {status ? (
                    <View style={[styles.badge, { backgroundColor: statusColor }]}> 
                      <Text style={styles.badgeText}>{status}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )
          })}
          </ScrollView>
        </View>
      )}

      {filtered.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {filtered.length} {filtered.length === 1 ? 'pago' : 'pagos'} encontrados
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B3D48',
    marginBottom: 12,
  },
  listContainer: {
    maxHeight: 400,
  },
  scrollView: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1FF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B3D48',
  },
  itemDate: {
    fontSize: 12,
    color: '#8A9AA0',
    marginTop: 4,
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B3D48',
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#0B2B28',
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7C82',
    fontWeight: '600',
  },
  empty: {
    color: '#6B7C82',
    fontSize: 14,
    paddingVertical: 24,
    textAlign: 'center',
  },
})
