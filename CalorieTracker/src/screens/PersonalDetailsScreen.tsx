import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { fetchProfile, saveProfile } from '../services/profileService';
import { UserProfile } from '../types/profile';

const ACTIVITY_OPTIONS: Array<{ label: string; value: NonNullable<UserProfile['activityLevel']>; subtitle?: string }> = [
  {
    label: 'Sedentary',
    value: 'sedentary',
    subtitle: 'Desk job or mostly sitting all day, little to no intentional exercise',
  },
  {
    label: 'Light',
    value: 'light',
    subtitle: 'Light exercise or walking 1–3 days per week, mostly a non-physical lifestyle',
  },
  {
    label: 'Moderate',
    value: 'moderate',
    subtitle: 'Moderate exercise or sports 3–5 days per week, active during parts of the day',
  },
  {
    label: 'Active',
    value: 'active',
    subtitle: 'Hard exercise or sports 6–7 days per week, physically demanding daily routine',
  },
  {
    label: 'Very Active',
    value: 'very_active',
    subtitle: 'Intense training twice a day, heavy manual labor, or professional athlete level activity',
  },
];

const GOAL_OPTIONS: Array<{ label: string; value: NonNullable<UserProfile['goalType']> }> = [
  { label: 'Lose weight', value: 'lose' },
  { label: 'Maintain weight', value: 'maintain' },
  { label: 'Gain weight', value: 'gain' },
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

// ── Radio picker modal ────────────────────────────────────────────────────────
type PickerModalProps = {
  visible: boolean;
  title: string;
  options: Array<{ label: string; value: string; subtitle?: string }>;
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

function PickerModal({ visible, title, options, selected, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((o, i) => (
            <Pressable
              key={o.value}
              style={[styles.modalOption, i < options.length - 1 && styles.modalOptionBorder]}
              onPress={() => { onSelect(o.value); onClose(); }}
            >
              <View style={styles.modalOptionTextWrap}>
                <Text style={[styles.modalOptionText, selected === o.value && styles.modalOptionTextActive]}>
                  {o.label}
                </Text>
                {o.subtitle ? (
                  <Text style={styles.modalOptionSubtitle}>{o.subtitle}</Text>
                ) : null}
              </View>
              {selected === o.value && <Check size={16} color="#4A90E2" />}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
type ActiveInput = 'heightCm' | 'weightKg' | 'age' | 'weeklyGoalRateKg' | 'targetWeightKg' | null;
type ActivePicker = 'gender' | 'activityLevel' | 'goalType' | null;

const PersonalDetailsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

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
      weeklyGoalRateKg: profile.weeklyGoalRateKg !== undefined ? String(profile.weeklyGoalRateKg) : '0',
      targetWeightKg: profile.targetWeightKg ? String(profile.targetWeightKg) : '',
    });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfile();
      hydrateForm(data.profile || {});
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const setField = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setActiveInput(null);
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
      if (onBack) onBack();
    } catch (e: any) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const activityLabel = ACTIVITY_OPTIONS.find((o) => o.value === form.activityLevel)?.label ?? '—';
  const goalLabel = GOAL_OPTIONS.find((o) => o.value === form.goalType)?.label ?? '—';
  const genderLabel = GENDER_OPTIONS.find((o) => o.value === form.gender)?.label ?? '—';

  // helper to render a numeric input row
  const NumericRow = ({
    label, field, placeholder, suffix,
  }: { label: string; field: ActiveInput & string; placeholder: string; suffix: string }) => (
    <Pressable style={styles.row} onPress={() => setActiveInput(activeInput === field ? null : field as ActiveInput)}>
      <Text style={styles.rowLabel}>{label}</Text>
      {activeInput === field ? (
        <TextInput
          autoFocus
          style={styles.rowInput}
          value={form[field as keyof typeof form]}
          keyboardType="numeric"
          onChangeText={(v) => setField(field as keyof typeof form, v)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
        />
      ) : (
        <Text style={styles.rowValue}>
          {form[field as keyof typeof form] ? `${form[field as keyof typeof form]} ${suffix}` : '—'}
        </Text>
      )}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          {onBack ? (
            <Pressable style={styles.backBtn} onPress={onBack}>
              <ChevronLeft size={22} color="#4A90E2" />
            </Pressable>
          ) : <View style={styles.backBtn} />}
          <Text style={styles.headerTitle}>Personal Details</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Form card */}
        <View style={styles.card}>

          <NumericRow label="Height" field="heightCm" placeholder="cm" suffix="cm" />
          <View style={styles.divider} />
          <NumericRow label="Weight" field="weightKg" placeholder="kg" suffix="kg" />
          <View style={styles.divider} />

          {/* Gender */}
          <Pressable style={styles.row} onPress={() => setActivePicker('gender')}>
            <Text style={styles.rowLabel}>Gender</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{genderLabel}</Text>
              <ChevronRight size={15} color="#9ca3af" />
            </View>
          </Pressable>
          <View style={styles.divider} />

          <NumericRow label="Age" field="age" placeholder="years" suffix="" />
          <View style={styles.divider} />

          {/* Activity */}
          <Pressable style={styles.row} onPress={() => setActivePicker('activityLevel')}>
            <Text style={styles.rowLabel}>Activity</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{activityLabel}</Text>
              <ChevronRight size={15} color="#9ca3af" />
            </View>
          </Pressable>
          <View style={styles.divider} />

          {/* Goal */}
          <Pressable style={styles.row} onPress={() => setActivePicker('goalType')}>
            <Text style={styles.rowLabel}>Goal</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{goalLabel}</Text>
              <ChevronRight size={15} color="#9ca3af" />
            </View>
          </Pressable>
          <View style={styles.divider} />

          <NumericRow label="Weekly Rate" field="weeklyGoalRateKg" placeholder="kg/week" suffix="kg/wk" />
          <View style={styles.divider} />
          <NumericRow label="Target Weight" field="targetWeightKg" placeholder="kg" suffix="kg" />

        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
          <Text style={styles.saveText}>{saving ? 'SAVING...' : 'SAVE'}</Text>
        </Pressable>

      </ScrollView>

      {/* Picker modals */}
      <PickerModal
        visible={activePicker === 'gender'}
        title="Gender"
        options={GENDER_OPTIONS}
        selected={form.gender}
        onSelect={(v) => setField('gender', v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'activityLevel'}
        title="Activity Level"
        options={ACTIVITY_OPTIONS}
        selected={form.activityLevel}
        onSelect={(v) => setField('activityLevel', v)}
        onClose={() => setActivePicker(null)}
      />
      <PickerModal
        visible={activePicker === 'goalType'}
        title="Goal"
        options={GOAL_OPTIONS}
        selected={form.goalType}
        onSelect={(v) => setField('goalType', v)}
        onClose={() => setActivePicker(null)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  card: {
    backgroundColor: '#EEF5FF', borderRadius: 16,
    borderWidth: 1, borderColor: '#DDEAFB',
    overflow: 'hidden', marginBottom: 16,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  rowLabel: { fontSize: 15, color: '#111827', fontWeight: '500' },
  rowValue: { fontSize: 15, color: '#4A90E2', fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowInput: {
    fontSize: 15, color: '#4A90E2', fontWeight: '600',
    textAlign: 'right', minWidth: 80, padding: 0,
  },
  divider: { height: 1, backgroundColor: '#DDEAFB', marginHorizontal: 16 },
  saveButton: {
    backgroundColor: '#4A90E2', borderRadius: 14,
    alignItems: 'center', paddingVertical: 15,
  },
  saveText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  errorText: { color: '#dc2626', fontSize: 13, marginBottom: 12 },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#ffffff',
    borderRadius: 16, overflow: 'hidden',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16, fontWeight: '700', color: '#111827',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#DDEAFB',
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15,
  },
  modalOptionBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalOptionText: { fontSize: 15, color: '#374151' },
  modalOptionTextActive: { color: '#4A90E2', fontWeight: '700' },
  modalOptionTextWrap: { flex: 1 },
  modalOptionSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});

export default PersonalDetailsScreen;
