import React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDailyGoals } from '../services/profileService';
import { DailyGoals } from '../types/profile';

const DailyGoalsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<DailyGoals | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDailyGoals();
        setGoals(data);
      } catch (loadError: any) {
        setError(loadError?.message || 'Failed to fetch daily goals');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Goals</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!goals?.isComplete ? (
        <Text style={styles.subtitle}>Complete Personal Details to generate your goals.</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.row}>BMI: {goals?.bmi ?? '-'}</Text>
          <Text style={styles.row}>BMR: {goals?.bmr ?? '-'} kcal</Text>
          <Text style={styles.row}>TDEE: {goals?.tdee ?? '-'} kcal</Text>
          <Text style={styles.row}>Target Calories: {goals?.targetCalories ?? '-'} kcal</Text>
          <Text style={styles.row}>Water: {goals?.waterMl ?? '-'} ml</Text>
          <Text style={styles.sectionTitle}>Macros</Text>
          <Text style={styles.row}>Protein: {goals?.macros?.proteinGrams ?? '-'} g</Text>
          <Text style={styles.row}>Carbs: {goals?.macros?.carbsGrams ?? '-'} g</Text>
          <Text style={styles.row}>Fats: {goals?.macros?.fatsGrams ?? '-'} g</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
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
  },
  card: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    padding: 16,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  row: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 13,
  },
});

export default DailyGoalsScreen;
