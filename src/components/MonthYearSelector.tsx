import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export type MonthYearValue = {
  month: number // 0-11
  year: number
}

type MonthYearSelectorProps = {
  label?: string
  value: MonthYearValue
  onChange: (value: MonthYearValue) => void
  minYear?: number
  maxYear?: number
}

export default function MonthYearSelector({
  label = "Selecciona el mes para ver el resumen de tus pagos",
  value,
  onChange,
  minYear = 2020,
  maxYear = 2030,
}: MonthYearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempValue, setTempValue] = useState<MonthYearValue>(value)

  const formattedValue = `${MONTHS[value.month]} ${value.year}`

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  )

  const handleConfirm = () => {
    onChange(tempValue)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTempValue(value)
    setIsOpen(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.row}>
        <Pressable
          onPress={() => setIsOpen(true)}
          style={styles.selector}
        >
          <Text style={styles.valueText}>{formattedValue}</Text>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={() => setIsOpen(true)}
        >
          <Ionicons name="calendar-outline" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCancel} />

          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Elige un periodo</Text>
                <Text style={styles.modalSubtitle}>
                  Selecciona el año y luego el mes para filtrar tus reportes.
                </Text>
              </View>

              <Pressable
                onPress={handleCancel}
                hitSlop={8}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={16} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.yearScroll}
              contentContainerStyle={styles.yearScrollContent}
            >
              {years.map((year) => {
                const isActive = year === tempValue.year
                return (
                  <Pressable
                    key={year}
                    onPress={() => setTempValue({ ...tempValue, year })}
                    style={[
                      styles.yearChip,
                      isActive && styles.yearChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.yearChipText,
                        isActive && styles.yearChipTextActive,
                      ]}
                    >
                      {year}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <View style={styles.monthGrid}>
              {MONTHS.map((monthName, index) => {
                const isActive = index === tempValue.month
                return (
                  <Pressable
                    key={monthName}
                    onPress={() => setTempValue({ ...tempValue, month: index })}
                    style={[
                      styles.monthChip,
                      isActive && styles.monthChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthChipText,
                        isActive && styles.monthChipTextActive,
                      ]}
                    >
                      {monthName}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleCancel}
                style={[styles.actionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.actionButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  selector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3D48",
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: "#12C48B",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0E8F64",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 48,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B3D48",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  yearScroll: {
    marginBottom: 20,
  },
  yearScrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  yearChipActive: {
    borderColor: "#1B3D48",
    backgroundColor: "#E8F1FF",
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  yearChipTextActive: {
    color: "#1B3D48",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  monthChip: {
    width: "30%",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  monthChipActive: {
    borderColor: "#1B3D48",
    backgroundColor: "#E8F1FF",
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  monthChipTextActive: {
    color: "#1B3D48",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#12C48B",
    shadowColor: "#0E8F64",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})
