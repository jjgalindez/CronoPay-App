import React, { useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
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
      .map((it) => ({
        ...it,
        parsedDate: typeof it.date === 'string' ? new Date(it.date) : it.date,
      }))
      .sort((a, b) => (b.parsedDate as Date).getTime() - (a.parsedDate as Date).getTime())
  }, [items])

  // filter by month and category
  const filtered = useMemo(() => {
    let result = sorted
    if (typeof filterMonth === 'number') {
      result = result.filter((it) => {
        const itemDate = it.parsedDate as Date
        return itemDate.getMonth() === filterMonth
      })
    }
    if (filterCategory) {
      result = result.filter((it) => it.category === filterCategory)
    }
    return result
  }, [sorted, filterMonth, filterCategory])

  return (
    <View className="bg-white dark:bg-black rounded-[18px] p-4 mb-4 shadow-sm">
      <Text className="text-lg font-bold text-[#1B3D48] dark:text-gray-100 mb-3">{title}</Text>

      {filtered.length === 0 ? (
        <Text className="text-[#6B7C82] dark:text-gray-400 text-sm text-center py-6">
          No hay pagos registrados para los filtros seleccionados.
        </Text>
      ) : (
        <View className="max-h-[400px]">
          <ScrollView
            className="max-h-[400px]"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {filtered.map((it, idx) => {
              const status = it.status ?? ''
              const statusColor = STATUS_COLORS[status] ?? '#D1E9E6'

              return (
                <View key={it.id ?? `${idx}`} className="flex-row items-center py-3 border-b border-[#F1F5F6] dark:border-gray-800">
                  <View
                    className="w-11 h-11 rounded-full mr-3 items-center justify-center"
                    style={{ backgroundColor: it.iconBackgroundColor ?? '#E8F1FF' }}
                  >
                    {it.iconName ? (
                      <Ionicons name={it.iconName as any} size={20} color={it.iconColor ?? '#1B3D48'} />
                    ) : null}
                  </View>

                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-[#1B3D48] dark:text-gray-100" numberOfLines={1}>
                      {it.title}
                    </Text>
                    <Text className="text-xs text-[#8A9AA0] dark:text-gray-400 mt-1">
                      {formatDate(it.date)}
                      {it.category ? ` • ${it.category}` : ''}
                    </Text>
                  </View>

                  <View className="items-end ml-3">
                    <Text className="text-base font-bold text-[#1B3D48] dark:text-gray-100">${formatCurrency(it.amount)}</Text>
                    {status ? (
                      <View
                        className="mt-1.5 px-2.5 py-1 rounded-xl"
                        style={{ backgroundColor: statusColor }}
                      >
                        <Text className="text-[11px] text-[#0B2B28] font-bold">{status}</Text>
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
        <View className="mt-3 pt-3 border-t border-[#F1F5F6] dark:border-gray-800 items-center">
          <Text className="text-[13px] text-[#6B7C82] dark:text-gray-400 font-semibold">
            {filtered.length} {filtered.length === 1 ? 'pago' : 'pagos'} encontrados
          </Text>
        </View>
      )}
    </View>
  )
}
