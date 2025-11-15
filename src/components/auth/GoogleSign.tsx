// components/OAuthGoogle.tsx
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin"
import { supabase } from "lib/supabase"

export default function GoogleSign() {
  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices({
            showPlayServicesUpdateDialog: true,
          })
          const response = await GoogleSignin.signIn()

          if (!isSuccessResponse(response)) return

          const idToken = response.data.idToken
          if (!idToken) {
            console.warn("No idToken returned from Google sign-in")
            return
          }

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: idToken,
          })

          if (error) {
            console.error("Supabase auth error:", error, data)
          }
        } catch (error: any) {
          if (error.code === statusCodes.IN_PROGRESS) {
            console.warn("Sign-in already in progress")
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.warn("Play Services not available or outdated")
          } else {
            console.error("Google sign-in error:", error)
          }
        }
      }}
    />
  )
}
