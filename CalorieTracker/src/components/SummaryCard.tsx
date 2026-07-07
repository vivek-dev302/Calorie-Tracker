import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Flame, Salad } from 'lucide-react-native'

type CaloriesData = { netCalories: number; intake: number; burned: number }
type MacrosData = { carbs: number; proteins: number; fats: number }

type SummaryCardProps = {
  calories: CaloriesData
  macros: MacrosData
  macroTargets?: { carbs: number; protein: number; fat: number } | null
  calorieTarget?: number | null
}

const r = (n: number) => Math.round(n)

const SummaryCard: React.FC<SummaryCardProps> = ({ calories, macros, macroTargets, calorieTarget }) => {
  const remaining = calorieTarget != null ? calorieTarget - r(calories.intake) : null

  return (
    <View style={styles.container}>

      {/* Calories */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Flame size={13} color="#FF6B35" />
          <Text style={styles.headerText}>Calories</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>{r(calories.intake)}</Text>
            <Text style={styles.label}>Intake</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.value}>{r(calories.burned)}</Text>
            <Text style={styles.label}>Burned</Text>
          </View>
          <View style={styles.column}>
            <Text style={[styles.value, remaining != null && remaining < 0 && styles.over]}>
              {remaining != null ? remaining : r(calories.netCalories)}
            </Text>
            <Text style={styles.label}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* Macros */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Salad size={13} color="#22C55E" />
          <Text style={styles.headerText}>Macros</Text>
        </View>
        <View style={styles.row}>
          {[
            { current: macros.carbs, target: macroTargets?.carbs, label: 'Carbs' },
            { current: macros.proteins, target: macroTargets?.protein, label: 'Protein' },
            { current: macros.fats, target: macroTargets?.fat, label: 'Fat' },
          ].map((m) => (
            <View key={m.label} style={styles.column}>
              <View style={styles.macroValueRow}>
                <Text style={styles.value}>{r(m.current)}</Text>
                {m.target != null
                  ? <Text style={styles.target}>/{m.target}</Text>
                  : null}
              </View>
              <Text style={styles.label}>{m.label} (g)</Text>
            </View>
          ))}
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  card: {
    flex: 1,
    backgroundColor: '#EEF5FF',
    borderRadius: 12,
    padding: 10,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  headerText: { fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { alignItems: 'center', flex: 1 },
  macroValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  value: { fontSize: 15, fontWeight: '500', color: '#111827' },
  over: { color: '#dc2626' },
  target: { fontSize: 11, fontWeight: '400', color: '#969ba3ff' },
  label: { fontSize: 10, color: '#6b7280', marginTop: 2, textAlign: 'center' },
})

export default SummaryCard
