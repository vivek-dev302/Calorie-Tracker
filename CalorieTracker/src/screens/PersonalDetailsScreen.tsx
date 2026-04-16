import React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProfile, saveProfile } from '../services/profileService';
import { UserProfile } from '../types/profile';

const PersonalDetailsScreen: React.FC = () => {
  const activityOptions: Array<{ label: string; value: UserProfile['activityLevel'] }> = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: 'Light', value: 'light' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Active', value: 'active' },
    { label: 'Very Active', value: 'very_active' },
  ];

  const goalOptions: Array<{ label: string; value: UserProfile['goalType'] }> = [
    { label: 'Lose', value: 'lose' },
    { label: 'Maintain', value: 'maintain' },
    { label: 'Gain', value: 'gain' },
  ];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<'activityLevel' | 'goalType' | null>(null);

  const [form, setForm] = useState({
    heightCm: '',
    weightKg: '',
    age: '',
    gender: 'male',
    activityLevel: 'sedentary',
    goalType: 'maintain',
    weeklyGoalRateKg: '0',
    targetWeightKg: '',
  });

  const hydrateForm = (profile: UserProfile) => {
    setForm({
      heightCm: profile.heightCm ? String(profile.heightCm) : '',
      weightKg: profile.weightKg ? String(profile.weightKg) : '',
      age: profile.age ? String(profile.age) : '',
      gender: profile.gender || 'male',
      activityLevel: profile.activityLevel || 'sedentary',
      goalType: profile.goalType || 'maintain',
      weeklyGoalRateKg:
        profile.weeklyGoalRateKg !== undefined ? String(profile.weeklyGoalRateKg) : '0',
      targetWeightKg: profile.targetWeightKg ? String(profile.targetWeightKg) : '',
    });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfile();
      hydrateForm(data.profile || {});
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);

      await saveProfile({
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as UserProfile['gender'],
        activityLevel: form.activityLevel as UserProfile['activityLevel'],
        goalType: form.goalType as UserProfile['goalType'],
        weeklyGoalRateKg: Number(form.weeklyGoalRateKg || 0),
        targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : undefined,
        unitSystem: 'metric',
      });

      await loadProfile();
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.subtitle}>Update your body metrics and goal configuration.</Text>

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={form.heightCm}
        keyboardType="numeric"
        onChangeText={(value) => setField('heightCm', value)}
        placeholder="Height (cm)"
      />
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={form.weightKg}
        keyboardType="numeric"
        onChangeText={(value) => setField('weightKg', value)}
        placeholder="Weight (kg)"
      />
      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={form.age}
        keyboardType="numeric"
        onChangeText={(value) => setField('age', value)}
        placeholder="Age"
      />
      <Text style={styles.label}>Gender</Text>
      <TextInput
        style={styles.input}
        value={form.gender}
        onChangeText={(value) => setField('gender', value.toLowerCase())}
        placeholder="Gender (male/female)"
      />
      <Text style={styles.label}>Activity Level</Text>
      <Pressable
        style={styles.dropdownTrigger}
        onPress={() =>
          setOpenDropdown((prev) => (prev === 'activityLevel' ? null : 'activityLevel'))
        }
      >
        <Text style={styles.dropdownValue}>
          {activityOptions.find((option) => option.value === form.activityLevel)?.label ||
            'Select activity level'}
        </Text>
      </Pressable>
      {openDropdown === 'activityLevel' ? (
        <View style={styles.dropdownOptions}>
          {activityOptions.map((option) => (
            <Pressable
              key={option.value}
              style={styles.dropdownOption}
              onPress={() => {
                setField('activityLevel', option.value || 'sedentary');
                setOpenDropdown(null);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  form.activityLevel === option.value && styles.dropdownOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>Goal Type</Text>
      <Pressable
        style={styles.dropdownTrigger}
        onPress={() => setOpenDropdown((prev) => (prev === 'goalType' ? null : 'goalType'))}
      >
        <Text style={styles.dropdownValue}>
          {goalOptions.find((option) => option.value === form.goalType)?.label ||
            'Select goal type'}
        </Text>
      </Pressable>
      {openDropdown === 'goalType' ? (
        <View style={styles.dropdownOptions}>
          {goalOptions.map((option) => (
            <Pressable
              key={option.value}
              style={styles.dropdownOption}
              onPress={() => {
                setField('goalType', option.value || 'maintain');
                setOpenDropdown(null);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  form.goalType === option.value && styles.dropdownOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Text style={styles.label}>Weekly Goal Rate (kg)</Text>
      <TextInput
        style={styles.input}
        value={form.weeklyGoalRateKg}
        keyboardType="numeric"
        onChangeText={(value) => setField('weeklyGoalRateKg', value)}
        placeholder="Weekly Goal Rate (kg)"
      />
      <Text style={styles.label}>Target Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={form.targetWeightKg}
        keyboardType="numeric"
        onChangeText={(value) => setField('targetWeightKg', value)}
        placeholder="Target Weight (kg)"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Details'}</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D1E7FF',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    color: '#111827',
    fontSize: 14,
  },
  dropdownTrigger: {
    borderWidth: 1.5,
    borderColor: '#D1E7FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  dropdownValue: {
    color: '#374151',
    fontSize: 14,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#DDEAFB',
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#EEF5FF',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDEAFB',
  },
  dropdownOptionText: {
    color: '#374151',
    fontSize: 14,
  },
  dropdownOptionTextSelected: {
    color: '#1E4F8A',
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 13,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 4,
    fontSize: 13,
  },
});

export default PersonalDetailsScreen;
