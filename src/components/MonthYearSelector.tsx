import Ionicons from "@expo/vector-icons/Ionicons"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { getMonthNames } from "../utils/dateHelpers"
import { useTema } from "@/hooks/useTema"

// month names are provided by i18n via getMonthNames()

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

  const { t } = useTranslation()
  const monthNames = getMonthNames()
  const formattedValue = `${monthNames[value.month]} ${value.year}`
  const { tema } = useTema()
  const isDark = tema === "dark"

  // Estilos dinámicos basados en tema
  const dynamicStyles = {
    selector: [styles.selector, isDark && styles.selectorDark],
    valueText: [styles.valueText, isDark && styles.valueTextDark],
    modalContent: [styles.modalContent, isDark && styles.modalContentDark],
    modalTitle: [styles.modalTitle, isDark && styles.modalTitleDark],
    modalSubtitle: [styles.modalSubtitle, isDark && styles.modalSubtitleDark],
    modalHandle: [styles.modalHandle, isDark && styles.modalHandleDark],
    closeButton: [styles.closeButton, isDark && styles.closeButtonDark],
    yearChip: (active: boolean) => [
      styles.yearChip,
      active && styles.yearChipActive,
      !active && isDark && styles.yearChipDark,
      active && isDark && styles.yearChipActiveDark,
    ],
    yearChipText: (active: boolean) => [
      styles.yearChipText,
      active && styles.yearChipTextActive,
      !active && isDark && styles.yearChipTextDark,
      active && isDark && styles.yearChipTextActiveDark,
    ],
    monthChip: (active: boolean) => [
      styles.monthChip,
      active && styles.monthChipActive,
      !active && isDark && styles.monthChipDark,
      active && isDark && styles.monthChipActiveDark,
    ],
    monthChipText: (active: boolean) => [
      styles.monthChipText,
      active && styles.monthChipTextActive,
      !active && isDark && styles.monthChipTextDark,
      active && isDark && styles.monthChipTextActiveDark,
    ],
    cancelButton: [
      styles.actionButton,
      styles.cancelButton,
      isDark && styles.cancelButtonDark,
    ],
    cancelButtonText: [
      styles.cancelButtonText,
      isDark && styles.cancelButtonTextDark,
    ],
  }

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i,
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
        <Pressable onPress={() => setIsOpen(true)} style={dynamicStyles.selector}>
          <Text style={dynamicStyles.valueText}>{formattedValue}</Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={isDark ? "#A3A3A3" : "#6B7280"}
          />
        </Pressable>

        <Pressable style={styles.iconButton} onPress={() => setIsOpen(true)}>
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

          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={dynamicStyles.modalTitle}>{t("SelectPeriod")}</Text>
                <Text style={dynamicStyles.modalSubtitle}>
                  {t("MonthSelectorMessage")}
                </Text>
              </View>

              <Pressable
                onPress={handleCancel}
                hitSlop={8}
                style={dynamicStyles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={isDark ? "#A3A3A3" : "#6B7280"}
                />
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
                    style={dynamicStyles.yearChip(isActive)}
                  >
                    <Text style={dynamicStyles.yearChipText(isActive)}>
                      {year}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <View style={styles.monthGrid}>
              {monthNames.map((monthName, index) => {
                const isActive = index === tempValue.month
                return (
                  <Pressable
                    key={index}
                    onPress={() => setTempValue({ ...tempValue, month: index })}
                    style={dynamicStyles.monthChip(isActive)}
                  >
                    <Text style={dynamicStyles.monthChipText(isActive)}>
                      {monthName}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleCancel}
                style={dynamicStyles.cancelButton}
              >
                <Text style={dynamicStyles.cancelButtonText}>{t("Cancel")}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirm}
                style={[styles.actionButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>{t("Confirm")}</Text>
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
  selectorDark: {
    backgroundColor: "#0B1220",
    borderColor: "#262626",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B3D48",
  },
  valueTextDark: {
    color: "#fafafa",
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
  modalContentDark: {
    backgroundColor: "#0B1220",
  },
  modalHandle: {
    width: 48,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHandleDark: {
    backgroundColor: "#404040",
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
  modalTitleDark: {
    color: "#fafafa",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  modalSubtitleDark: {
    color: "#a3a3a3",
  },
  closeButton: {
    width: 32,
    height: 32,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonDark: {
    backgroundColor: "#262626",
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
  yearChipDark: {
    backgroundColor: "#0B1220",
    borderColor: "#262626",
  },
  yearChipActive: {
    borderColor: "#1B3D48",
    backgroundColor: "#E8F1FF",
  },
  yearChipActiveDark: {
    borderColor: "#38bdf8",
    backgroundColor: "#0c4a6e",
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  yearChipTextDark: {
    color: "#a3a3a3",
  },
  yearChipTextActive: {
    color: "#1B3D48",
  },
  yearChipTextActiveDark: {
    color: "#38bdf8",
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
  monthChipDark: {
    backgroundColor: "#0B1220",
    borderColor: "#262626",
  },
  monthChipActive: {
    borderColor: "#1B3D48",
    backgroundColor: "#E8F1FF",
  },
  monthChipActiveDark: {
    borderColor: "#38bdf8",
    backgroundColor: "#0c4a6e",
  },
  monthChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  monthChipTextDark: {
    color: "#a3a3a3",
  },
  monthChipTextActive: {
    color: "#1B3D48",
  },
  monthChipTextActiveDark: {
    color: "#38bdf8",
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
  cancelButtonDark: {
    backgroundColor: "#262626",
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
  cancelButtonTextDark: {
    color: "#a3a3a3",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})
