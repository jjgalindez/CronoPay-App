import React, { useMemo } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native"
import Svg, { G, Circle, Text as SvgText } from "react-native-svg"
import Ionicons from "@expo/vector-icons/Ionicons"

export type DonutSlice = {
  label: string
  value: number
  color?: string
  month?: number // optional: 0-11 (Jan-Dec)
}

export type DonutChartProps = {
  data: DonutSlice[]
  size?: number // diameter in px
  thickness?: number // ring thickness
  showPercent?: boolean
  filterMonth?: number // optional: filter by month (0-11)
}

const DEFAULT_COLORS = ["#0F5B5C", "#12C48B", "#FFB020", "#7C4DFF", "#FF6B6B", "#3AA9FF"]

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  }
}

function isDarkColor(hex?: string) {
  if (!hex) return true
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const int = parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  // perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness < 150
}

export default function DonutChart({
  data,
  size = 160,
  thickness = 20,
  showPercent = true,
  filterMonth,
}: DonutChartProps) {
  // filter data by month if specified
  const filteredData = useMemo(() => {
    if (filterMonth === undefined) {
      return data
    }
    return data.filter((item) => item.month === undefined || item.month === filterMonth)
  }, [data, filterMonth])

  // make size responsive to screen width so donut doesn't overflow on small devices
  const windowWidth = Dimensions.get('window').width
  const legendWidth = 150
  const finalSize = 180 // Fixed larger size to ensure scroll
  const total = useMemo(() => filteredData.reduce((s, i) => s + Math.max(0, i.value), 0), [filteredData])

  const cx = finalSize / 2
  const cy = finalSize / 2
  const radius = Math.max(8, finalSize / 2 - thickness / 2 - 8)
  const circumference = 2 * Math.PI * radius

  // Calculate total width needed for content
  const contentWidth = finalSize + legendWidth + 40 // donut + legend + margins = 370px
  const containerWidth = windowWidth - 80 // TRIGGER VALUE: scroll when content exceeds screen - 80px
  const needsScroll = contentWidth > containerWidth

  // prepare slices with percent and angle
  const slices = useMemo(() => {
    const palette = DEFAULT_COLORS
    let acc = 0
    return filteredData.map((d, idx) => {
      const value = Math.max(0, d.value)
      const percent = total > 0 ? (value / total) * 100 : 0
      const length = circumference * (percent / 100)
      const slice = {
        ...d,
        color: d.color ?? palette[idx % palette.length],
        value,
        percent,
        length,
        offset: acc,
      }
      acc += length
      return slice
    })
  }, [filteredData, total, circumference])

  // legend width reserved to the right


  return (
    <View style={[styles.wrapper, { height: finalSize }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={needsScroll}
        contentContainerStyle={{ alignItems: 'center', minWidth: contentWidth }}
        style={{ height: finalSize }}
      >
        <View style={[styles.container, { height: finalSize, width: contentWidth }]}>
          <Svg width={finalSize} height={finalSize}>
            <G rotation={0} originX={cx} originY={cy}>
              {/* background ring */}
              <Circle cx={cx} cy={cy} r={radius} stroke="#E5E7EB" strokeWidth={thickness} fill="none" />

              {/* slices drawn as stroked circles using strokeDasharray */}
              {slices.map((s, i) => {
                const dashArray = `${s.length} ${Math.max(0, circumference - s.length)}`
                // strokeDashoffset moves the dash; negative offset advances clockwise
                const dashOffset = -s.offset
                return (
                  <Circle
                    key={`slice-${i}`}
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={s.color}
                    strokeWidth={thickness}
                    strokeLinecap="butt"
                    fill="none"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                  />
                )
              })}

              {/* inner percentage labels (one per slice) */}
              {slices.map((s, i) => {
                const midOffset = s.offset + s.length / 2
                const midAngle = (midOffset / circumference) * 360
                const innerLabelR = radius // center of the ring
                const innerLabelPos = polarToCartesian(cx, cy, innerLabelR, midAngle)
                const percentText = `${s.percent.toFixed(0)}%`
                const percentFill = isDarkColor(s.color) ? '#FFFFFF' : '#12343A'

                return (
                  <SvgText
                    key={`inner-${i}`}
                    x={innerLabelPos.x}
                    y={innerLabelPos.y + 4}
                    fontSize={12}
                    fill={percentFill}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {percentText}
                  </SvgText>
                )
              })}
            </G>
          </Svg>

          {/* legend to the right for better readability */}
          <View className="ml-4">
            {slices.map((s, i) => (
              <View key={`legend-${i}`} className="flex-row items-center mb-2">
                <View className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: s.color }} />
                <View className="flex-row justify-between flex-1">
                  <Text className="text-[13px] text-[#12343A] dark:text-gray-100">{s.label}</Text>
                  <Text className="text-[13px] text-[#12343A] dark:text-gray-100 font-semibold">{s.percent.toFixed(1)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {needsScroll && (
        <View pointerEvents="none" style={styles.scrollIndicator}>
          <Ionicons name="chevron-forward" size={20} color="rgba(107,114,128,0.6)" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  scrollIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
})
