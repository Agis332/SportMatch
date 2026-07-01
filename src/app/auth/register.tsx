import { router } from 'expo-router';
import { Check, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BLUE = '#208AEF';

function PasswordInput({
  value, onChangeText, placeholder, autoComplete,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  autoComplete?: 'password' | 'new-password';
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.inputRow}>
      <Lock size={17} color="#9CA3AF" strokeWidth={2} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete={autoComplete ?? 'new-password'}
      />
      <TouchableOpacity onPress={() => setShow(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {show
          ? <EyeOff size={17} color="#9CA3AF" strokeWidth={2} />
          : <Eye size={17} color="#9CA3AF" strokeWidth={2} />}
      </TouchableOpacity>
    </View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() &&
    password.length >= 6 && password === confirmPassword && agreedToTerms;

  async function handleRegister() {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>S</Text>
          </View>
          <Text style={styles.logoTitle}>Create Account</Text>
          <Text style={styles.logoSub}>Join SportMatch to find your trainer</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {/* Name row */}
          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>First Name</Text>
              <View style={styles.inputRow}>
                <User size={17} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              <View style={styles.inputRow}>
                <User size={17} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputRow}>
              <Mail size={17} color="#9CA3AF" strokeWidth={2} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </View>

          {/* Confirm password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          {/* Terms */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreedToTerms(v => !v)}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryBtn, (!canSubmit || loading) && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={canSubmit && !loading ? 0.85 : 1}
            disabled={!canSubmit || loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>

        {/* Login link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 28,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
    gap: 8,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  logoMarkText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  // Form
  form: {
    gap: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 7,
  },
  fieldWrap: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    color: BLUE,
    fontWeight: '600',
  },

  // Primary button
  primaryBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
  },
});
