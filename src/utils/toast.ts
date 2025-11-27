import { Platform, ToastAndroid, Alert } from 'react-native'

export default function showToast(message: string) {
  try {
    if (Platform.OS === 'android' && ToastAndroid && typeof ToastAndroid.show === 'function') {
      ToastAndroid.show(message, ToastAndroid.SHORT)
      return
    }
  } catch (e) {
    // fallthrough to Alert
  }
  // Fallback for iOS or if ToastAndroid not available
  Alert.alert(message)
}
