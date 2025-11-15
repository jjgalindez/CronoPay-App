import { memo, useMemo } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import Svg, {
  Circle,
  Line,
  Polyline,
  Text as SvgText,
  Defs,
  ClipPath,
  Rect,
  G,
} from "react-native-svg"

const CARD_BG = "#FFFFFF"
const LINE_COLOR = "#0F5B5C"
const NODE_COLOR = "#12C48B"
const GRID_COLOR = "rgba(15, 91, 92, 0.08)"
const DEFAULT_WIDTH = 312
const DEFAULT_HEIGHT = 180

export type LineStatsPoint = {
  label: string
  value: number
}

export type LineStatsGraphProps = {
  data: LineStatsPoint[]
  title?: string
  width?: number
  height?: number
  valueFormatter?: (value: number) => string
}

const defaultFormatter = (value: number) => {
  try {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  } catch (error) {
    console.warn("Intl not available, returning raw value", error)
    return `${Math.round(value)}`
  }
}

function LineStatsGraph({
  data,
  title = "Evolución de Pagos",
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  valueFormatter = defaultFormatter,
}: LineStatsGraphProps) {
  const sanitizedData = useMemo(() => data.filter((point) => point.value >= 0), [
    data,
  ])

  const { minValue, maxValue } = useMemo(() => {
    if (sanitizedData.length === 0) {
      return { minValue: 0, maxValue: 0 }
    }
    const values = sanitizedData.map((point) => point.value)
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const padding = (maxVal - minVal || minVal || 1) * 0.15
    return {
      minValue: Math.max(0, minVal - padding),
      maxValue: maxVal + padding,
    }
  }, [sanitizedData])

  // layout paddings shared across renders
  const leftPadding = 48
  const rightPadding = 12
  const topPadding = 12
  const bottomPadding = 16

  const { polylinePoints, nodePoints } = useMemo(() => {
    if (sanitizedData.length === 0) {
      return { polylinePoints: "", nodePoints: [] as Array<{ x: number; y: number }> }
    }
    const chartWidth = width - leftPadding - rightPadding
    const chartHeight = height - topPadding - bottomPadding
    const stepX =
      sanitizedData.length > 1 ? chartWidth / (sanitizedData.length - 1) : chartWidth

    const toChartY = (value: number) => {
      if (maxValue === minValue) return chartHeight / 2
      const normalized = (value - minValue) / (maxValue - minValue)
      return chartHeight - normalized * chartHeight
    }

    const points: string[] = []
    const nodes: Array<{ x: number; y: number }> = []

    sanitizedData.forEach((point, index) => {
      const x = leftPadding + stepX * index
      const y = topPadding + toChartY(point.value)
      points.push(`${x},${y}`)
      nodes.push({ x, y })
    })

    return {
      polylinePoints: points.join(" "),
      nodePoints: nodes,
    }
  }, [sanitizedData, maxValue, minValue, width, height])

  const yTicks = useMemo(() => {
    if (maxValue === minValue) return [maxValue]
    const divisions = 4
    const step = (maxValue - minValue) / divisions
    return Array.from({ length: divisions + 1 }).map((_, index) =>
      Math.round(minValue + step * index),
    )
  }, [maxValue, minValue])

  // card has internal padding; compute available svg width inside the padded card
  const cardPadding = 20
  const svgContainerWidth = Math.max(0, width - cardPadding * 2)
  const pointSpacing = 72
  const desiredInnerWidth =
    sanitizedData.length > 1
      ? leftPadding + rightPadding + (sanitizedData.length - 1) * pointSpacing
      : svgContainerWidth
  const svgInnerWidth = Math.max(svgContainerWidth, desiredInnerWidth)
  const showScrollIndicator = svgInnerWidth > svgContainerWidth

  return (
    <View style={[styles.card, { width: "100%" }]}> 
      <Text style={styles.title}>{title}</Text>
      <View style={{ height, marginTop: 12, borderRadius: 12, position: "relative" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ width: svgInnerWidth, marginLeft: 16 }}
        >
          <Svg width={svgInnerWidth} height={height}>
          {/* grid lines */}
          <Line
            x1={leftPadding}
            y1={topPadding}
            x2={leftPadding}
            y2={height - bottomPadding}
            stroke={GRID_COLOR}
            strokeDasharray="4 6"
          />
          <Line
            x1={leftPadding}
            y1={height - bottomPadding}
            x2={svgInnerWidth - rightPadding}
            y2={height - bottomPadding}
            stroke={GRID_COLOR}
            strokeDasharray="4 6"
          />

          {/* horizontal grid lines for each y tick (scrolls with the chart) */}
          {yTicks.map((tick, index) => {
            const chartHeight = height - topPadding - bottomPadding
            const y =
              topPadding +
              chartHeight -
              ((tick - minValue) / (maxValue - minValue || 1)) * chartHeight
            return (
              <Line
                key={`hgrid-${tick}-${index}`}
                x1={leftPadding}
                y1={y}
                x2={svgInnerWidth - rightPadding}
                y2={y}
                stroke={GRID_COLOR}
                strokeDasharray="4 6"
              />
            )
          })}

          {/* clip the chart to avoid overflow */}
          <Defs>
            <ClipPath id="clip">
              <Rect
                x={leftPadding}
                y={topPadding}
                width={svgInnerWidth - leftPadding - rightPadding}
                height={height - topPadding - bottomPadding}
              />
            </ClipPath>
          </Defs>

          {polylinePoints ? (
            <G clipPath="url(#clip)">
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {nodePoints.map((node, index) => (
                <Circle
                  key={`node-${index}`}
                  cx={node.x}
                  cy={node.y}
                  r={5}
                  fill={NODE_COLOR}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </G>
          ) : null}

          {/* x labels (months) */}
          {sanitizedData.map((point, index) => {
            if (!nodePoints[index]) return null
            const { x } = nodePoints[index]
            const y = height - 4
            return (
              <SvgText
                key={`label-${point.label}`}
                x={x}
                y={y}
                fontSize={11}
                fill="#6B7C82"
                textAnchor="middle"
              >
                {point.label}
              </SvgText>
            )
          })}

          {/* y ticks are rendered outside the SVG so they stay fixed while the chart scrolls */}
          </Svg>
        </ScrollView>
        {showScrollIndicator ? (
          <View pointerEvents="none" style={styles.scrollIndicator}>
            <Ionicons name="chevron-forward" size={20} color="rgba(27,61,72,0.6)" />
          </View>
        ) : null}

        {/* static Y labels placed to the left of the scrollable chart */}
        <View
          pointerEvents="none"
          style={[
            styles.yLabelsContainer,
            { width: leftPadding + 4, backgroundColor: CARD_BG, zIndex: 2, borderTopLeftRadius: 12 },
          ]}
        >
          {yTicks.map((tick, index) => {
            const chartHeight = height - topPadding - bottomPadding
            const y = topPadding + chartHeight - ((tick - minValue) / (maxValue - minValue || 1)) * chartHeight
            return (
              <Text
                key={`tick-${tick}-${index}`}
                style={[
                  styles.yLabel,
                  { top: y - 8 },
                ]}
              >
                {valueFormatter(tick)}
              </Text>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3D48",
  },
  scrollIndicator: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  yLabelsContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-start",
  },
  yLabel: {
    position: "absolute",
    right: 10, // small inner offset so labels sit just left of the chart area
    fontSize: 11,
    width: 50,
    color: "#6B7C82",
  },
})

export default memo(LineStatsGraph)
