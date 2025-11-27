import React, { useMemo } from "react"
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native"
import { useColorScheme } from "nativewind"
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
  // Deprecated / legacy props (still supported for backwards compatibility)
  diameter?: number
  strokeWidth?: number
  showLabels?: boolean
  legendWidth?: number
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

export default function DonutChart(props: DonutChartProps) {
  const {
    data,
    size,
    thickness,
    showPercent,
    filterMonth,
    // deprecated
    diameter,
    strokeWidth,
    showLabels,
    legendWidth: legendWidthProp,
  } = props

  // Backwards compatibility for deprecated props
  let effectiveSize = size ?? diameter ?? 160
  let effectiveThickness = thickness ?? strokeWidth ?? 20
  let effectiveShowPercent = typeof showPercent === 'boolean' ? showPercent : (typeof showLabels === 'boolean' ? showLabels : true)
  let legendWidth = legendWidthProp ?? 150

  if (diameter !== undefined) console.warn('DonutChart: `diameter` prop is deprecated, use `size` instead')
  if (strokeWidth !== undefined) console.warn('DonutChart: `strokeWidth` prop is deprecated, use `thickness` instead')
  if (showLabels !== undefined) console.warn('DonutChart: `showLabels` prop is deprecated, use `showPercent` instead')
  if (legendWidthProp !== undefined) console.warn('DonutChart: `legendWidth` prop is deprecated, use layout overrides instead')
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  // filter data by month if specified
  const filteredData = useMemo(() => {
    if (filterMonth === undefined) {
      return data
    }
    return data.filter((item) => item.month === undefined || item.month === filterMonth)
  }, [data, filterMonth])

  // make size responsive to screen width so donut doesn't overflow on small devices
  const windowWidth = Dimensions.get('window').width
  const legendWidthLocal = legendWidth
  const finalSize = Math.max(80, effectiveSize)
  const total = useMemo(() => filteredData.reduce((s, i) => s + Math.max(0, i.value), 0), [filteredData])

  const cx = finalSize / 2
  const cy = finalSize / 2
  const radius = Math.max(8, finalSize / 2 - effectiveThickness / 2 - 8)
  const circumference = 2 * Math.PI * radius

  // Calculate total width needed for content
  const contentWidth = finalSize + legendWidthLocal + 40 // donut + legend + margins
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
    <View style={[styles.wrapper, { height: finalSize, backgroundColor: isDark ? '#0B1220' : undefined }]}> 
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
              <Circle cx={cx} cy={cy} r={radius} stroke={isDark ? '#111827' : '#E5E7EB'} strokeWidth={effectiveThickness} fill="none" />

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
                    strokeWidth={effectiveThickness}
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

                if (!effectiveShowPercent) return null

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
            <View style={styles.legend}>
              {slices.map((s, i) => (
                <View key={`legend-${i}`} style={styles.legendRow}>
                  <View style={[styles.swatch, { backgroundColor: s.color }]} />
                  <View style={styles.legendTextWrap}>
                    <Text style={[styles.legendLabel, isDark ? { color: '#E5E7EB' } : undefined]}>{s.label}</Text>
                      <Text style={[styles.legendPercent, isDark ? { color: '#E5E7EB' } : undefined]}>{s.percent.toFixed(1)}%</Text>
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
  legend: {
    marginLeft: 12,
    width: 150,
    justifyContent: 'center'
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  legendLabel: {
    fontSize: 13,
    color: '#12343A',
  },
  legendPercent: {
    fontSize: 13,
    color: '#12343A',
    fontWeight: '600'
  }
})
