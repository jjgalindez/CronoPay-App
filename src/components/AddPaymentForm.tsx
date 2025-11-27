import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PagoInsert, usePagos } from "../hooks/usePagos";
import { useAuth } from "providers/AuthProvider";
import { supabase } from "lib/supabase"

// Tipos para los catálogos
type Categoria = {
  id_categoria: number;
  nombre: string;
};

type MetodoPago = {
  id_metodo: number;
  tipo : string;
};

interface AddPaymentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddPaymentForm({ onSuccess, onCancel }: AddPaymentFormProps) {
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // const {t} = useTraslation();

  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const { create, isLoading } = usePagos(userId ?? undefined);

  // Estados del formulario
  const [titulo, setTitulo] = useState("");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [idMetodo, setIdMetodo] = useState<number | null>(null);

  // Catálogos
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al montar
  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      setLoadingCatalogos(true);

      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categoria")
        .select("*")
        .order("nombre");

      if (categoriasError) throw categoriasError;

      // Cargar métodos de pago
      const { data: metodosData, error: metodosError } = await supabase
        .from("metodo_pago")
        .select("*")
        .order("id_metodo");

      if (metodosError) throw metodosError;

      setCategorias(categoriasData || []);
      setMetodosPago(metodosData || []);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
      Alert.alert(
        "Error",
        "No se pudieron cargar las categorías y métodos de pago"
      );
    } finally {
      setLoadingCatalogos(false);
    }
  };

  // Formatear monto mientras se escribe
  const handleMontoChange = (text: string) => {
    // Permitir solo números y un punto decimal
    const cleaned = text.replace(/[^0-9.]/g, "");

    // Evitar múltiples puntos decimales
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return;
    }

    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setMonto(cleaned);
  };

  // Formatear fecha para mostrar
  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Manejar cambio de fecha
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFechaVencimiento(selectedDate);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!titulo.trim()) {
      Alert.alert("Campo requerido", "El título es obligatorio");
      return false;
    }

    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto válido mayor a 0");
      return false;
    }

    if (!userId) {
      Alert.alert("Error", "Usuario no autenticado");
      return false;
    }

    return true;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
    
      // Formatear fecha manteniendo la fecha local (YYYY-MM-DD)
      const year = fechaVencimiento.getFullYear();
      const month = String(fechaVencimiento.getMonth() + 1).padStart(2, '0');
      const day = String(fechaVencimiento.getDate()).padStart(2, '0');
      const fechaISO = `${year}-${month}-${day}`;

      const payload: PagoInsert = {
        titulo: titulo.trim(),
        monto: monto,
        fecha_vencimiento: fechaISO,
        estado: "Pendiente",
        id_usuario: userId!,
        id_categoria: idCategoria,
        id_metodo: idMetodo,
      };

      await create(payload);

      Alert.alert("¡Éxito!", "Pago guardado correctamente");

      // Limpiar formulario
      setTitulo("");
      setMonto("");
      setDescripcion("");
      setFechaVencimiento(new Date());
      setIdCategoria(null);
      setIdMetodo(null);

      // Notificar éxito
      onSuccess?.();
    } catch (err) {
      console.error("Error guardando pago:", err);
      Alert.alert("Error", "Hubo un problema al guardar el pago");
    }
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark].filter(Boolean)}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.header, isDark && styles.headerDark].filter(Boolean)}>
        Nuevo Pago
      </Text>

      {/* Título */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Título <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, isDark && styles.inputDark].filter(Boolean)}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ej: Pago de servicios"
          placeholderTextColor={isDark ? "#666" : "#999"}
          maxLength={100}
        />
      </View>

      {/* Monto */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Monto (COP) <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.montoContainer}>
          <Text style={[styles.montoSymbol, isDark && styles.montoSymbolDark].filter(Boolean)}>
            $
          </Text>
          <TextInput
            style={[styles.input, styles.montoInput, isDark && styles.inputDark].filter(Boolean)}
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={handleMontoChange}
            placeholder="0.00"
            placeholderTextColor={isDark ? "#666" : "#999"}
          />
        </View>
        {monto && parseFloat(monto) > 0 && (
          <Text style={[styles.montoPreview, isDark && styles.montoPreviewDark].filter(Boolean)}>
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            }).format(parseFloat(monto))}
          </Text>
        )}
      </View>

      {/* Fecha de vencimiento */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Fecha de vencimiento <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.dateButton, isDark && styles.dateButtonDark].filter(Boolean)}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, isDark && styles.dateTextDark].filter(Boolean)}>
            📅 {formatDateDisplay(fechaVencimiento)}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fechaVencimiento}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()}
            locale="es-CO"
          />
        )}
      </View>

      {/* Categoría */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Categoría (opcional)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              idCategoria === null && styles.chipSelected,
              isDark && styles.chipDark,
              idCategoria === null && isDark && styles.chipSelectedDark,
            ].filter(Boolean)}
            onPress={() => setIdCategoria(null)}
          >
            <Text
              style={[
                styles.chipText,
                idCategoria === null && styles.chipTextSelected,
                isDark && styles.chipTextDark,
              ].filter(Boolean)}
            >
              Sin categoría
            </Text>
          </TouchableOpacity>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat.id_categoria}
              style={[
                styles.chip,
                idCategoria === cat.id_categoria && styles.chipSelected,
                isDark && styles.chipDark,
                idCategoria === cat.id_categoria && isDark && styles.chipSelectedDark,
              ].filter(Boolean)}
              onPress={() => setIdCategoria(cat.id_categoria)}
            >
              <Text
                style={[
                  styles.chipText,
                  idCategoria === cat.id_categoria && styles.chipTextSelected,
                  isDark && styles.chipTextDark,
                ].filter(Boolean)}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Método de pago */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Método de pago (opcional)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              idMetodo === null && styles.chipSelected,
              isDark && styles.chipDark,
              idMetodo === null && isDark && styles.chipSelectedDark,
            ].filter(Boolean)}
            onPress={() => setIdMetodo(null)}
          >
            <Text
              style={[
                styles.chipText,
                idMetodo === null && styles.chipTextSelected,
                isDark && styles.chipTextDark,
              ].filter(Boolean)}
            >
              Sin método
            </Text>
          </TouchableOpacity>
          {metodosPago.map((metodo) => (
            <TouchableOpacity
              key={metodo.id_metodo}
              style={[
                styles.chip,
                idMetodo === metodo.id_metodo && styles.chipSelected,
                isDark && styles.chipDark,
                idMetodo === metodo.id_metodo && isDark && styles.chipSelectedDark,
              ].filter(Boolean)}
              onPress={() => setIdMetodo(metodo.id_metodo)}
            >
              <Text
                style={[
                  styles.chipText,
                  idMetodo === metodo.id_metodo && styles.chipTextSelected,
                  isDark && styles.chipTextDark,
                ].filter(Boolean)}
              >
                {metodo.tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Descripción adicional */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, isDark && styles.labelDark].filter(Boolean)}>
          Descripción adicional (opcional)
        </Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            isDark && styles.inputDark,
          ].filter(Boolean)}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Notas adicionales sobre este pago..."
          placeholderTextColor={isDark ? "#666" : "#999"}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            isLoading && styles.buttonDisabled,
          ].filter(Boolean)}
          onPress={handleSubmit}
          disabled={isLoading || loadingCatalogos}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? "Guardando..." : "Guardar Pago"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerDark: {
    backgroundColor: "#0a0a0a",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a0a0a",
    marginBottom: 24,
  },
  headerDark: {
    color: "#fafafa",
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  labelDark: {
    color: "#e5e5e5",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#0a0a0a",
  },
  inputDark: {
    backgroundColor: "#171717",
    borderColor: "#404040",
    color: "#fafafa",
  },
  montoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  montoSymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0a0a0a",
    marginRight: 8,
  },
  montoSymbolDark: {
    color: "#fafafa",
  },
  montoInput: {
    flex: 1,
  },
  montoPreview: {
    fontSize: 14,
    color: "#16a34a",
    marginTop: 4,
    fontWeight: "600",
  },
  montoPreviewDark: {
    color: "#22c55e",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dateButtonDark: {
    backgroundColor: "#171717",
    borderColor: "#404040",
  },
  dateText: {
    fontSize: 16,
    color: "#0a0a0a",
  },
  dateTextDark: {
    color: "#fafafa",
  },
  chipsContainer: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  chipDark: {
    backgroundColor: "#171717",
    borderColor: "#404040",
  },
  chipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  chipSelectedDark: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 14,
    color: "#0a0a0a",
    fontWeight: "500",
  },
  chipTextDark: {
    color: "#fafafa",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  cancelButtonText: {
    color: "#737373",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#16a34a",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});