import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'

export type PaymentItem = {
  id?: string
  title: string
  date: string | Date
  amount: number
  status?: 'Pagado' | 'Pendiente' | 'Rechazado' | string
  iconName?: string
  iconColor?: string
  iconBackgroundColor?: string
}

type RecentPaymentsProps = {
  items?: PaymentItem[]
  maxItems?: number // default 5
  // minItems deprecated: padding with placeholders removed
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
    // fallback
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

export default function RecentPayments({ items = [], maxItems = 5 }: RecentPaymentsProps) {
  // filter state: 'month' | 'trimester' | 'year'
  const [filter, setFilter] = useState<'month' | 'trimester' | 'year'>('month')

  // parse and sort by date desc
  const sorted = useMemo(() => {
    return [...items]
      .map((it) => ({ ...it, _date: typeof it.date === 'string' ? new Date(it.date) : it.date }))
      .sort((a, b) => (b._date as Date).getTime() - (a._date as Date).getTime())
  }, [items])

  const filtered = useMemo(() => {
    // use the most recent item date as reference so filters work on mock data
    const reference = (sorted.length > 0 ? (sorted[0]._date as Date) : new Date())
    let start: Date
    if (filter === 'month') {
      start = new Date(reference.getFullYear(), reference.getMonth(), 1)
    } else if (filter === 'trimester') {
      const month = reference.getMonth()
      const quarterStart = Math.floor(month / 3) * 3
      start = new Date(reference.getFullYear(), quarterStart, 1)
    } else {
      // year
      start = new Date(reference.getFullYear(), 0, 1)
    }

    return sorted.filter((it) => (it._date as Date).getTime() >= start.getTime())
  }, [sorted, filter])

  // visible items limited by maxItems, no placeholders
  const visible = filtered.slice(0, maxItems)

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Últimos Movimientos</Text>

      {visible.length === 0 ? (
        <Text style={styles.empty}>No hay movimientos para este periodo.</Text>
      ) : (
        visible.map((it, idx) => {
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
                <Text style={styles.itemDate}>{formatDate(it.date)}</Text>
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
        })
      )}

      {/* small action row (non-interactive) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'month' ? styles.filterActive : null]}
          onPress={() => setFilter('month')}
        >
          <Text style={filter === 'month' ? styles.filterTextActive : styles.filterText}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'trimester' ? styles.filterActive : null]}
          onPress={() => setFilter('trimester')}
        >
          <Text style={filter === 'trimester' ? styles.filterTextActive : styles.filterText}>Trimestre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'year' ? styles.filterActive : null]}
          onPress={() => setFilter('year')}
        >
          <Text style={filter === 'year' ? styles.filterTextActive : styles.filterText}>Año</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12343A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F1FF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    backgroundColor: '#F1F5F6',
  },
  meta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#12343A',
  },
  itemDate: {
    fontSize: 12,
    color: '#8A9AA0',
    marginTop: 2,
  },
  amountWrap: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12343A',
  },
  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#0B2B28',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#E1E7E8',
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F6',
    marginRight: 8,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#062A34',
  },
  filterText: {
    color: '#5E6B71',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  empty: {
    color: '#6B7C82',
    fontSize: 14,
    paddingVertical: 12,
    textAlign: 'center',
  },
})
