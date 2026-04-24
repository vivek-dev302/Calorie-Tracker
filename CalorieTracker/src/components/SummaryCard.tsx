import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Flame, Salad } from 'lucide-react-native'

type CaloriesData = {
  netCalories: number
  intake: number
  burned: number
}

type MacrosData = {
  carbs: number
  proteins: number
  fats: number
}

type SummaryCardProps = {
  calories: CaloriesData
  macros: MacrosData
  macroTargets?: { carbs: number; protein: number; fat: number } | null
  calorieTarget?: number | null
}

const SummaryCard: React.FC<SummaryCardProps> = ({ calories, macros, macroTargets, calorieTarget }) => {
  return (
    <View style={styles.container}>
      {/* Calories Section */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Flame size={13} color="#FF6B35" />
          <Text style={styles.headerText}>Calories</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>{calories.intake}{calorieTarget ? <Text style={styles.target}>/{calorieTarget}</Text> : null}</Text>
            <Text style={styles.label}>Intake</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>{calories.burned}</Text>
            <Text style={styles.label}>Burned</Text>
          </View>

          <View style={styles.column}>
            <Text style={[styles.value, styles.bold]}>{calories.netCalories}</Text>
            <Text style={styles.label}>Total</Text>
          </View>
        </View>
      </View>

      {/* Macros Section */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Salad size={13} color="#22C55E" />
          <Text style={styles.headerText}>Macros</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.value}>
              <Text>{macros.carbs}</Text>
              {macroTargets ? <Text style={styles.target}>/{macroTargets.carbs}</Text> : null}
            </Text>
            <Text style={styles.label}>Carbs (g)</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>
              <Text>{macros.proteins}</Text>
              {macroTargets ? <Text style={styles.target}>/{macroTargets.protein}</Text> : null}
            </Text>
            <Text style={styles.label}>Protein (g)</Text>
          </View>

          <View style={styles.column}>
            <Text style={styles.value}>
              <Text>{macros.fats}</Text>
              {macroTargets ? <Text style={styles.target}>/{macroTargets.fat}</Text> : null}
            </Text>
            <Text style={styles.label}>Fat (g)</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
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
  headerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '400',
  },
  bold: {
    fontWeight: '500',
  },
  target: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9499a1ff',
  },
  label: {
    fontSize: 10.5,
    color: '#555',
    marginTop: 1,
    textAlign: 'center',
  },
})

export default SummaryCard