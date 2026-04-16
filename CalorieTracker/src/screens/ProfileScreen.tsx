import React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchProfile } from '../services/profileService';
import AreYouSureModal from '../components/AreYouSureModal';

type ProfileScreenProps = {
  onLogout: () => void;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProfile();
        setName(data.user.name || '');
        setEmail(data.user.email || '');
      } catch (loadError: any) {
        setError(loadError?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileTextWrap}>
          <Text style={styles.nameText}>{name || 'Your Name'}</Text>
          <Text style={styles.subtitle}>{email || 'No email available'}</Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actionsCard}>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Feedback (coming soon)</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Support (coming soon)</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 22,
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
    marginBottom: 14,
  },
  profileCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D1E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1E4F8A',
    fontSize: 18,
    fontWeight: '700',
  },
  profileTextWrap: {
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 19,
  },
  actionsCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    padding: 12,
    marginBottom: 14,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1E7FF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  secondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 13,
  },
});

export default ProfileScreen;
