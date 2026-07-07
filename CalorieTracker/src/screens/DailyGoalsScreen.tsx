import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { Flame } from 'lucide-react-native';
import { fetchDailyGoals } from '../services/profileService';
import { DailyGoals } from '../types/profile';

const COLORS = { carbs: '#4A90E2', protein: '#6366f1', fat: '#64748b' };
const SIZE = 190;
const STROKE = 55;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type DonutProps = { carbs: number; protein: number; fat: number };

function DonutChart({ carbs, protein, fat }: DonutProps) {
  const total = carbs + protein + fat || 1;
  const carbsPct = Math.round((carbs / total) * 100);
  const proteinPct = Math.round((protein / total) * 100);
  const fatPct = 100 - carbsPct - proteinPct;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const segments = [
    { pct: carbsPct, color: COLORS.carbs },
    { pct: proteinPct, color: COLORS.protein },
    { pct: fatPct, color: COLORS.fat },
  ];

  let offset = 0;
  return (
    <Svg width={SIZE} height={SIZE}>
      <Circle cx={cx} cy={cy} r={R - STROKE / 2 + 2} fill="#EEF5FF" />
      <G rotation="-90" origin={`${cx},${cy}`}>
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * CIRCUMFERENCE;
          const gap = CIRCUMFERENCE - dash;
          const dashOffset = -((offset / 100) * CIRCUMFERENCE);
          offset += seg.pct;
          return (
            <Circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </G>
      {segments.map((seg, i) => {
        const midAngle =
          ((segments.slice(0, i).reduce((a, s) => a + s.pct, 0) + seg.pct / 2) / 100) *
            2 * Math.PI - Math.PI / 2;
        const lx = cx + R * Math.cos(midAngle);
        const ly = cy + R * Math.sin(midAngle);
        return (
          <SvgText key={i} x={lx} y={ly} textAnchor="middle" alignmentBaseline="middle"
            fill="#fff" fontSize={12} fontWeight="700">
            {seg.pct}%
          </SvgText>
        );
      })}
    </Svg>
  );
}

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
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  const macros = goals?.macros;
  const carbsKcal = Math.round((macros?.carbsGrams ?? 0) * 4);
  const proteinKcal = Math.round((macros?.proteinGrams ?? 0) * 4);
  const fatKcal = Math.round((macros?.fatsGrams ?? 0) * 9);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Daily Goals</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {goals?.warnings?.length ? (
          <View style={styles.warningCard}>
            {goals.warnings.map((w, i) => (
              <Text key={i} style={styles.warningText}>⚠ {w}</Text>
            ))}
          </View>
        ) : null}

        {!goals?.isComplete ? (
          <View style={styles.card}>
            <Text style={styles.incompleteText}>
              Complete your Personal Details to generate your daily goals.
            </Text>
          </View>
        ) : (
          <>
            {/* Calorie card */}
            <View style={styles.calorieCard}>
              <View style={styles.calorieIconWrap}>
                <Flame size={24} color="#4A90E2" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.calorieLabel}>DAILY CALORIC REQUIREMENT</Text>
                <Text style={styles.calorieValue}>{goals.targetCalories} kcal</Text>
              </View>
            </View>

            {/* Macros card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>

              <View style={styles.macroRow}>
                {[
                  { label: 'Carbs', grams: macros?.carbsGrams, kcal: carbsKcal, color: COLORS.carbs },
                  { label: 'Protein', grams: macros?.proteinGrams, kcal: proteinKcal, color: COLORS.protein },
                  { label: 'Fat', grams: macros?.fatsGrams, kcal: fatKcal, color: COLORS.fat },
                ].map((m) => (
                  <View key={m.label} style={styles.macroItem}>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                    <Text style={[styles.macroGrams, { color: m.color }]}>{m.grams ?? '-'} g</Text>
                    <Text style={styles.macroKcal}>{m.kcal} kcal</Text>
                  </View>
                ))}
              </View>

              <View style={styles.chartWrap}>
                <DonutChart
                  carbs={macros?.carbsGrams ?? 0}
                  protein={macros?.proteinGrams ?? 0}
                  fat={macros?.fatsGrams ?? 0}
                />
              </View>

              <View style={styles.legend}>
                {[
                  { label: 'Carbs', color: COLORS.carbs },
                  { label: 'Protein', color: COLORS.protein },
                  { label: 'Fat', color: COLORS.fat },
                ].map((item) => (
                  <View key={item.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Body Stats</Text>
              {[
                { label: 'BMI', value: goals.bmi ?? '-' },
                { label: 'BMR', value: goals.bmr ? `${goals.bmr} kcal` : '-' },
                { label: 'TDEE', value: goals.tdee ? `${goals.tdee} kcal` : '-' },
                { label: 'Water', value: goals.waterMl ? `${goals.waterMl} ml` : '-' },
              ].map((item, i, arr) => (
                <View key={item.label}
                  style={[styles.statRow, i < arr.length - 1 && styles.statBorder]}>
                  <Text style={styles.statLabel}>{item.label}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scroll: { padding: 16, paddingBottom: 32 },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 16 },
  errorText: { color: '#dc2626', marginBottom: 12, fontSize: 13 },
  card: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    padding: 16,
    marginBottom: 12,
  },
  incompleteText: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  warningText: { fontSize: 13, color: '#92400e', lineHeight: 20 },
  // Calorie card
  calorieCard: {
    backgroundColor: '#EEF5FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDEAFB',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  calorieLabel: { fontSize: 10, color: '#6b7280', letterSpacing: 0.8, marginBottom: 3 },
  calorieValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  // Macros
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  macroItem: { flex: 1, alignItems: 'center' },
  macroLabel: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  macroGrams: { fontSize: 18, fontWeight: '700', marginBottom: 1 },
  macroKcal: { fontSize: 11, color: '#9ca3af' },
  chartWrap: { alignItems: 'center', marginVertical: 8 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: '#4b5563' },
  // Stats
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  statBorder: { borderBottomWidth: 1, borderBottomColor: '#DDEAFB' },
  statLabel: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
});

export default DailyGoalsScreen;
