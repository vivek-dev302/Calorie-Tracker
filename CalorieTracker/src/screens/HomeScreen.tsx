import { ScrollView, StatusBar, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import InputBox from '../components/InputBox';
import EntryCard from '../components/entryCard';
import { SkeletonEntryCard, ErrorEntryCard } from '../components/skeletons';
import SummaryCard from '../components/SummaryCard';
import DateStrip from '../components/DateStrip';
import TopNav from '../components/TopNav';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../services/apiClient';
import { fetchDailyGoals } from '../services/profileService';

type Props = {
  onLogout: () => void;
};

const HomeScreen: React.FC<Props> = ({ onLogout }) => {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [dayData, setDayData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [macroTargets, setMacroTargets] = useState<{ carbs: number; protein: number; fat: number } | null>(null);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [analyzingEntry, setAnalyzingEntry] = useState<string | null>(null);
  const [entryError, setEntryError] = useState<{
    userText: string;
    message: string;
    retryFn?: () => void;
  } | null>(null);

  const fetchDayData = async (date: string) => {
    const apiUrl = `${API_ENDPOINTS.ENTRIES}?date=${date}`;
    try {
      setLoading(true)
      const response = await apiRequest(apiUrl, 'GET');
      const responseData = await response.json();
      setDayData(responseData.data);
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyGoals()
      .then((goals) => {
        if (goals?.macros) {
          setMacroTargets({
            carbs: goals.macros.carbsGrams,
            protein: goals.macros.proteinGrams,
            fat: goals.macros.fatsGrams,
          });
        }
        if (goals?.targetCalories) {
          setCalorieTarget(goals.targetCalories);
        }
      })
      .catch(() => {}); // non-critical, fail silently
  }, []);

  const handleEntrySubmit = (userText: string) => {
    setEntryError(null);
    setAnalyzingEntry(userText);
  };

  const handleEntryAdded = (date: string) => {
    setAnalyzingEntry(null);
    setEntryError(null);
    fetchDayData(date);
  };

  const handleEntryError = (
    userText: string,
    errorMessage: string,
    retryFn?: () => void
  ) => {
    setAnalyzingEntry(null);
    setEntryError({ userText, message: errorMessage, retryFn });
  };

  const handleRetryEntry = () => {
    if (entryError?.retryFn) {
      setEntryError(null);
      entryError.retryFn();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDayData(selectedDate);
    setRefreshing(false);
  };

  const handleDismissError = () => {
    setEntryError(null);
  };

  const shareDay = (date: string) => {
    // share logic
  };

  return (
      <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#ffffff"
          />
          <TopNav
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenDrawer={() => {}}
            onShare={() => shareDay(selectedDate)}
          />
          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <SummaryCard
            calories={dayData?.summary?.calories || 0}
            macros={dayData?.summary?.macros || {}}
            macroTargets={macroTargets}
            calorieTarget={calorieTarget}
          />

          <ScrollView style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16 }}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              {analyzingEntry && (
              <SkeletonEntryCard userText={analyzingEntry} />
              )}
            {entryError && (
              <ErrorEntryCard
                userText={entryError.userText}
                errorMessage={entryError.message}
                onRetry={handleRetryEntry}
                onDismiss={handleDismissError}
              />
            )}
            {dayData?.entries?.map((entry: any) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onDeleteSuccess={() => fetchDayData(selectedDate)}
              />
            ))}
            {!loading && !analyzingEntry && !entryError && (!dayData?.entries || dayData.entries.length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>Nothing logged yet</Text>
                <Text style={styles.emptySubtitle}>Type what you ate or drank below and we'll handle the rest</Text>
              </View>
            )}
          </ScrollView>
          <InputBox
            selectedDate={selectedDate}
            onEntrySubmit={handleEntrySubmit}
            onEntryAdded={handleEntryAdded}
            onEntryError={handleEntryError}
          />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 19,
  },
});

export default HomeScreen;
