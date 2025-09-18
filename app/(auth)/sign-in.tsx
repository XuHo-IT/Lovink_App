import { styles } from "@/styles/auth.style";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import OAuthButtons from "./oauthButton";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* 🔹 Login Section */}
      <View style={styles.loginSection}>
        {error ? (
          <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        ) : null}

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Continue Button */}
        <TouchableOpacity style={styles.button} onPress={onSignInPress}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Text style={{ color: "#999", marginVertical: 12 }}>or</Text>

        {/* Google Button */}
        <OAuthButtons />

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms and Privacy Policy
        </Text>

        {/* Switch to Sign Up */}
        <View style={styles.linkRow}>
          <Text style={{ color: "white" }}>Don't have an account? </Text>
          <Link href="/sign-up">
            <Text style={styles.link}>Sign up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
