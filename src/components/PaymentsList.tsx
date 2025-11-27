import React, { useMemo } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useColorScheme } from 'nativewind'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from "react-i18next"

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
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'

  // dark-mode fallbacks (only applied when there is no explicit color prop)
  const DARK_CARD_BG = '#0B1220'
  const DARK_TITLE = '#FFFFFF'
  const DARK_MUTED = '#9CA3AF'
  // subtle dark border to sit gently on dark backgrounds (e.g. slate-900)
  const DARK_BORDER = '#111827'
  const DARK_AVATAR_BG = '#1F2933'
  const DARK_AMOUNT = '#FFFFFF'
  const BADGE_TEXT_COLOR = '#FFFFFF'
  // parse and sort by date desc
  const sorted = useMemo(() => {
    return [...items]
      .map((it) => ({ ...it, _date: typeof it.date === 'string' ? new Date(it.date) : it.date }))
      .sort((a, b) => (b._date as Date).getTime() - (a._date as Date).getTime())
  }, [items])
  const { t } = useTranslation()

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
    <View className={`rounded-[18px] p-4 mb-4 bg-white dark:bg-[${DARK_CARD_BG}] shadow-md`}> 
      <Text className="text-primary-700 dark:text-neutral-100 text-lg font-bold mb-3">{title}</Text>

      {filtered.length === 0 ? (
        <Text className="text-[#6B7C82] text-base py-6 text-center">
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
                  <View key={it.id ?? `${idx}`} className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: isDark ? DARK_BORDER : '#F8FAFC' }}>
                    <View className="w-11 h-11 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: it.iconBackgroundColor ?? (isDark ? DARK_AVATAR_BG : '#E8F1FF') }}> 
                        {it.iconName ? (
                          <Ionicons name={it.iconName as any} size={20} color={it.iconColor ?? (isDark ? '#FFFFFF' : '#1B3D48')} />
                        ) : null}
                      </View>

                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-[#1B3D48]" numberOfLines={1}>
                      {it.title}
                    </Text>
                  <Text className={isDark ? 'text-neutral-400 text-[12px] mt-1' : 'text-[12px] text-[#8A9AA0] mt-1'}> 
                      {formatDate(it.date)}
                      {it.category ? ` • ${it.category}` : ''}
                    </Text>
                  </View>

                <View className="items-end ml-3">
                  <Text className="text-primary-700 dark:text-neutral-100 text-[16px] font-bold">${formatCurrency(it.amount)}</Text>
                    {status ? (
                    <View className="mt-1 rounded-[12px] px-3 py-1" style={{ backgroundColor: statusColor }}> 
                      <Text className="text-[11px] font-bold" style={{ color: BADGE_TEXT_COLOR }}>{status}</Text>
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
        <View className="mt-3 pt-3 border-t items-center" style={{ borderTopWidth: 1, borderTopColor: isDark ? DARK_BORDER : '#F8FAFC' }}> 
          <Text className="text-[13px] font-semibold" style={{ color: isDark ? DARK_MUTED : undefined }}> 
            {filtered.length} {filtered.length === 1 ? t("Payment") : t("Payments")} {t("Found")}
          </Text>
        </View>
      )}
    </View>
  )
}

