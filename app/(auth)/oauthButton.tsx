import { styles } from "@/styles/auth.style";
import { useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Text, TouchableOpacity, View } from "react-native";

// ✅ call ONCE at module load
WebBrowser.maybeCompleteAuthSession();

export default function OAuthButtons() {
  const googleOAuth = useOAuth({ strategy: "oauth_google" });
  const facebookOAuth = useOAuth({ strategy: "oauth_facebook" });

  const onGooglePress = async () => {
    try {
      const { createdSessionId, setActive } =
        await googleOAuth.startOAuthFlow();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
    } catch (err) {
      alert("Google OAuth error:");
    }
  };

  const onFacebookPress = async () => {
    try {
      const { createdSessionId, setActive } =
        await facebookOAuth.startOAuthFlow();
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
    } catch (err) {
      alert("Facebook OAuth error:");
    }
  };

  return (
   <View style={{ flexDirection: "row", justifyContent: "center", gap: 10 }}>
  <TouchableOpacity style={styles.googleButton} onPress={onGooglePress}>
    <View style={styles.googleIconContainer}>
      <Ionicons name="logo-google" size={20} color="#000" />
    </View>
    <Text style={styles.googleButtonText}>Google</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.googleButton, { backgroundColor: "#1877F2" }]}
    onPress={onFacebookPress}
  >
    <View style={styles.googleIconContainer}>
      <Ionicons name="logo-facebook" size={20} color="#fff" />
    </View>
    <Text style={[styles.googleButtonText, { color: "#fff" }]}>Facebook</Text>
  </TouchableOpacity>
</View>

  );
}
