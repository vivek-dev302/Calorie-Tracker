import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SummaryCard from '../components/SummaryCard';
import DateStrip from '../components/DateStrip';
import TopNav from '../components/TopNav';
import EntryCard from '../components/entryCard';
import { SkeletonEntryCard, ErrorEntryCard } from '../components/skeletons';
import InputBox from '../components/InputBox';
import { API_ENDPOINTS } from '../config/api';
import { apiRequest } from '../services/apiClient';
import { fetchDailyGoals } from '../services/profileService';

type SuggestionEntry = {
  _id: string;
  userText: string;
  name: string;
  type: string;
  items?: any[];
  proteins?: number;
  carbs?: number;
  fats?: number;
  calories: number;
  duration?: number;
  healthAnalysis?: string;
  createdAt: string;
};

const SuggestScreen: React.FC = () => {
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [dayData, setDayData] = useState<any>(null);
  const [macroTargets, setMacroTargets] = useState<{ carbs: number; protein: number; fat: number } | null>(null);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionEntry[]>([]);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [error, setError] = useState<{ userText: string; message: string; retryFn?: () => void } | null>(null);

  useEffect(() => {
    fetchDayData(todayISO);
    fetchDailyGoals()
      .then((goals) => {
        if (goals?.macros) {
          setMacroTargets({
            carbs: goals.macros.carbsGrams,
            protein: goals.macros.proteinGrams,
            fat: goals.macros.fatsGrams,
          });
        }
        if (goals?.targetCalories) setCalorieTarget(goals.targetCalories);
      })
      .catch(() => {});
  }, []);

  const fetchDayData = async (date: string) => {
    try {
      const response = await apiRequest(`${API_ENDPOINTS.ENTRIES}?date=${date}`, 'GET');
      const responseData = await response.json();
      setDayData(responseData.data);
    } catch (e) {
      console.error('Failed to fetch day data:', e);
    }
  };

  const handleEntrySubmit = (userText: string) => {
    setError(null);
    setSuggestions([]);
    setAnalyzing(userText);
  };

  const handleEntryAdded = (_date: string) => {
    // not used for suggest, but required by InputBox signature
  };

  const handleEntryError = (userText: string, errorMessage: string, retryFn?: () => void) => {
    setAnalyzing(null);
    setError({ userText, message: errorMessage, retryFn });
  };

  const handleSuggest = async (userText: string) => {
    handleEntrySubmit(userText);
    try {
      const response = await apiRequest(API_ENDPOINTS.SUGGEST_MEALS, 'POST', { user_text: userText }, 60000);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to get suggestions');
      const mapped: SuggestionEntry[] = data.data.suggestions.map((s: any, i: number) => ({
        ...s,
        _id: `suggestion-${i}`,
        createdAt: new Date().toISOString(),
      }));
      setSuggestions(mapped);
      setAnalyzing(null);
    } catch (e: any) {
      let msg = 'Network error. Please check your connection.';
      if (e.name === 'AbortError') msg = 'Request timed out. Please try again.';
      else if (e.message) msg = e.message;
      handleEntryError(userText, msg, () => handleSuggest(userText));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TopNav
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onOpenDrawer={() => {}}
        onShare={() => {}}
      />
      <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <SummaryCard
        calories={dayData?.summary?.calories || 0}
        macros={dayData?.summary?.macros || {}}
        macroTargets={macroTargets}
        calorieTarget={calorieTarget}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!analyzing && suggestions.length === 0 && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>What fits your budget?</Text>
            <Text style={styles.emptySubtitle}>
              Tell us your remaining calories and macros — e.g. "400 calories, 22g protein" — and we'll suggest meals that fit.
            </Text>
          </View>
        )}

        {analyzing && <SkeletonEntryCard userText={analyzing} />}

        {error && (
          <ErrorEntryCard
            userText={error.userText}
            errorMessage={error.message}
            onRetry={() => { if (error.retryFn) { setError(null); error.retryFn(); } }}
            onDismiss={() => setError(null)}
          />
        )}

        {suggestions.map((s) => (
          <EntryCard key={s._id} entry={s} readOnly />
        ))}
      </ScrollView>

      <InputBox
        selectedDate={selectedDate}
        placeholder="e.g. 400 calories, 22g protein..."
        hideSecondaryActions
        onEntrySubmit={handleEntrySubmit}
        onEntryAdded={handleEntryAdded}
        onEntryError={handleEntryError}
        onSuggest={handleSuggest}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { padding: 16 },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SuggestScreen;
