import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { fetchProfile } from '../services/profileService';
import AreYouSureModal from '../components/AreYouSureModal';
import PersonalDetailsScreen from './PersonalDetailsScreen';
import { UserProfile } from '../types/profile';

type ProfileScreenProps = {
  onLogout: () => void;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfile();
      setName(data.user.name || '');
      setEmail(data.user.email || '');
      setAvatar(data.user.avatar || null);
      setProfile(data.profile || null);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (showPersonalDetails) {
    return (
      <PersonalDetailsScreen
        onBack={() => { setShowPersonalDetails(false); loadProfile(); }}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const initials =
    name.split(' ').filter(Boolean).slice(0, 2)
      .map((p) => p[0]?.toUpperCase()).join('') || 'U';

  const activityLabel: Record<string, string> = {
    sedentary: 'Sedentary', light: 'Light', moderate: 'Moderate',
    active: 'Active', very_active: 'Very Active',
  };
  const goalLabel: Record<string, string> = {
    lose: 'Lose weight', maintain: 'Maintain weight', gain: 'Gain weight',
  };

  const hasDetails = !!(profile?.heightCm || profile?.weightKg || profile?.age);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* User card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileTextWrap}>
            <Text style={styles.nameText}>{name || 'Your Name'}</Text>
            <Text style={styles.subtitle}>{email || 'No email available'}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Personal Details card */}
        <Pressable style={styles.detailsCard} onPress={() => setShowPersonalDetails(true)}>
          <View style={styles.detailsCardHeader}>
            <Text style={styles.detailsCardTitle}>Personal Details</Text>
            <ChevronRight size={18} color="#4A90E2" />
          </View>

          {hasDetails ? (
            <>
              <View style={styles.statsRow}>
                {[
                  { label: 'HEIGHT', value: profile?.heightCm ? `${profile.heightCm} cm` : '—' },
                  { label: 'WEIGHT', value: profile?.weightKg ? `${profile.weightKg} kg` : '—' },
                  { label: 'GENDER', value: profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '—' },
                  { label: 'AGE', value: profile?.age ? String(profile.age) : '—' },
                ].map((item, i, arr) => (
                  <View key={item.label} style={[styles.statCell, i < arr.length - 1 && styles.statCellBorder]}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {profile?.activityLevel ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailRowValue}>
                    {activityLabel[profile.activityLevel] ?? profile.activityLevel}
                  </Text>
                  <Text style={styles.detailRowLabel}>ACTIVITY LEVEL</Text>
                </View>
              ) : null}

              {profile?.goalType ? (
                <View style={[styles.detailRow, styles.detailRowLast]}>
                  <Text style={styles.detailRowValue}>
                    {goalLabel[profile.goalType] ?? profile.goalType}
                  </Text>
                  <Text style={styles.detailRowLabel}>GOAL</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.detailsEmpty}>Tap to add your body metrics and goals.</Text>
          )}
        </Pressable>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Feedback (coming soon)</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginBottom: 0 }]}>
            <Text style={styles.secondaryText}>Support (coming soon)</Text>
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <AreYouSureModal
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={() => { setShowLogoutModal(false); onLogout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 32 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 14 },
  // User card
  profileCard: {
    backgroundColor: '#EEF5FF', borderRadius: 14, borderWidth: 1,
    borderColor: '#DDEAFB', padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#D1E7FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { color: '#1E4F8A', fontSize: 18, fontWeight: '700' },
  profileTextWrap: { flex: 1 },
  nameText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  subtitle: { fontSize: 14, color: '#4b5563', lineHeight: 19 },
  errorText: { color: '#dc2626', marginBottom: 10, fontSize: 13 },
  // Personal details card
  detailsCard: {
    backgroundColor: '#EEF5FF', borderRadius: 14, borderWidth: 1,
    borderColor: '#DDEAFB', marginBottom: 12, overflow: 'hidden',
  },
  detailsCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#DDEAFB',
  },
  detailsCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  detailsEmpty: { fontSize: 13, color: '#9ca3af', padding: 16 },
  statsRow: { flexDirection: 'row' },
  statCell: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
  },
  statCellBorder: { borderRightWidth: 1, borderRightColor: '#DDEAFB' },
  statValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 3 },
  statLabel: { fontSize: 10, color: '#9ca3af', letterSpacing: 0.6 },
  detailRow: {
    paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#DDEAFB',
  },
  detailRowLast: {},
  detailRowValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 3 },
  detailRowLabel: { fontSize: 10, color: '#9ca3af', letterSpacing: 0.6 },
  // Actions
  actionsCard: {
    backgroundColor: '#EEF5FF', borderRadius: 14, borderWidth: 1,
    borderColor: '#DDEAFB', padding: 12, marginBottom: 14,
  },
  secondaryButton: {
    backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1,
    borderColor: '#D1E7FF', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
  },
  secondaryText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  logoutButton: {
    backgroundColor: '#4A90E2', borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 13,
  },
  logoutText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});

export default ProfileScreen;
