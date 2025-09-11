import { useAuth } from "@clerk/clerk-expo";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/auth.style";
export default function index() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => signOut()}>
        <Text style={{ color: "white" }}> Signout</Text>
      </TouchableOpacity>
    </View>
  );
}
