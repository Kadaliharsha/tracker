import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { getTransactions } from '../utils/storage';
import FilterButtons from '../components/FilterButtons';

const screenWidth = Dimensions.get('window').width;

const COLORS = [
  '#00BFA5', '#FFB74D', '#4DD0E1', '#FFD54F', '#E57373', '#BA68C8', '#90A4AE', '#AED581', '#64B5F6', '#A1887F',
];

const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚌', Shopping: '🛍️', Entertainment: '🎬', Health: '💊', Rent: '🏠', Utilities: '💡', Salary: '💼', Other: '🔖',
};

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
}

function getFilterRange(filter, refDate = new Date()) {
  const now = refDate;
  let start, end;
  if (filter === 'This Month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (filter === 'This Year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    start = new Date(0);
    end = new Date(8640000000000000); // max date
  }
  return { start, end };
}

export default function AnalyticsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('This Month');
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' or 'income'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const data = await getTransactions();
        if (mounted) {
          setTransactions(data);
        }
      } catch (e) {
        console.error("Failed to fetch analytics data:", e);
        if (mounted) {
          setError("Could not load analytics. Please check your internet connection.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- Data Processing ---
  const yearsWithData = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  }, [transactions]);
  const minYear = yearsWithData.length > 0 ? yearsWithData[0] : selectedYear;
  const maxYear = yearsWithData.length > 0 ? yearsWithData[yearsWithData.length - 1] : selectedYear;

  const { start, end } = useMemo(() => getFilterRange(activeFilter), [activeFilter]);

  const filteredTransactions = useMemo(() =>
    transactions.filter(txn => {
      if (txn.type !== transactionType) return false;
      const d = new Date(txn.date);
      return d >= start && d <= end;
    }), [transactions, start, end, transactionType]);

  // --- Monthly totals for both income and expense ---
  const monthlyIncomeTotals = Array(12).fill(0);
  const monthlyExpenseTotals = Array(12).fill(0);
  transactions.forEach(txn => {
    const d = new Date(txn.date);
    if (d.getFullYear() === selectedYear) {
      if (txn.type === 'income') {
        monthlyIncomeTotals[d.getMonth()] += Number(txn.amount);
      } else if (txn.type === 'expense') {
        monthlyExpenseTotals[d.getMonth()] += Number(txn.amount);
      }
    }
  });
  const hasLineData = monthlyIncomeTotals.some(val => val > 0) || monthlyExpenseTotals.some(val => val > 0);

  function getPrevPeriodRange(filter, refDate = new Date()) {
    if (filter === 'This Month') {
      const p = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
      return { start: new Date(p.getFullYear(), p.getMonth(), 1), end: new Date(p.getFullYear(), p.getMonth() + 1, 0, 23, 59, 59, 999) };
    }
    if (filter === 'This Year') {
      const p = refDate.getFullYear() - 1;
      return { start: new Date(p, 0, 1), end: new Date(p, 11, 31, 23, 59, 59, 999) };
    }
    return { start: new Date(0), end: new Date(0) };
  }
  const prevRange = useMemo(() => getPrevPeriodRange(activeFilter), [activeFilter]);
  const prevPeriodTransactions = useMemo(() =>
    transactions.filter(txn => {
      if (txn.type !== transactionType) return false;
      const d = new Date(txn.date);
      return d >= prevRange.start && d <= prevRange.end;
    }), [transactions, prevRange.start, prevRange.end, transactionType]);

  const totalCurrent = filteredTransactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalPrev = prevPeriodTransactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const diff = totalCurrent - totalPrev;
  const diffColor = diff > 0 ? '#FF3B30' : '#00BFA5';

  const categoryTotals = {};
  filteredTransactions.forEach(txn => {
    categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + Number(txn.amount);
  });
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const topCategories = sortedCategories.slice(0, 5);
  const otherTotal = sortedCategories.slice(5).reduce((sum, c) => sum + c.amount, 0);
  const chartData = [...topCategories];
  if (otherTotal > 0) chartData.push({ category: 'Other', amount: otherTotal });

  const pieChartData = chartData.map((item, idx) => ({
    name: item.category,
    amount: item.amount,
    color: COLORS[idx % COLORS.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 14,
  }));

  const totalForPercent = chartData.reduce((sum, c) => sum + c.amount, 0);
  const listData = chartData.map((item, idx) => ({
    ...item,
    percent: totalForPercent ? (item.amount / totalForPercent) * 100 : 0,
    color: COLORS[idx % COLORS.length],
  }));

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 191, 165, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadowColorFromDataset: false,
  };

  // --- Render Logic ---
  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#00BFA5" style={{ marginTop: 60 }} /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.container}><Text style={styles.errorState}>{error}</Text></SafeAreaView>;
  }

  const verb = transactionType === 'expense' ? 'spent' : 'earned';
  const filterLabel = activeFilter.replace('This ', '').toLowerCase();
  const prevLabel = activeFilter !== 'All Time' ? `last ${filterLabel}` : '';
  const insightText = `You've ${verb} ₹${totalCurrent.toFixed(2)} this ${filterLabel}` + (prevLabel ? ', which is ' : '.');
  const diffText = prevLabel
    ? (diff === 0 ? `the same as ${prevLabel}.` : `${diff > 0 ? '₹' + Math.abs(diff).toFixed(2) + ' more' : '₹' + Math.abs(diff).toFixed(2) + ' less'} than ${prevLabel}.`)
    : '';

    return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={item => item.category}
        ListHeaderComponent={
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Analytics</Text>
              <TypeSelector transactionType={transactionType} setTransactionType={setTransactionType} />
            </View>
            <View style={{ marginHorizontal: 0, width: '100%' }}>
              <FilterButtons activeFilter={activeFilter} onChange={setActiveFilter} />
            </View>
            
            {filteredTransactions.length === 0 ? (
              <Text style={styles.emptyState}>No {transactionType}s found for this period.</Text>
            ) : (
              <>
                <View style={styles.insightCard}>
                  <Text style={styles.insightText}>
                    {insightText}
                    <Text style={{ color: diffColor, fontWeight: 'bold' }}>{diffText}</Text>
                  </Text>
                </View>
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 32}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  hasLegend={true}
                />
                <View style={styles.yearSelectorContainer}>
                  <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)} disabled={selectedYear === minYear} style={styles.yearArrow}>
                    <Text style={{ fontSize: 22, color: selectedYear === minYear ? '#ccc' : '#00BFA5' }}>{'<'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.yearLabel}>{selectedYear}</Text>
                  <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)} disabled={selectedYear === maxYear} style={styles.yearArrow}>
                    <Text style={{ fontSize: 22, color: selectedYear === maxYear ? '#ccc' : '#00BFA5' }}>{'>'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.sectionHeader, { textAlign: 'center'}]}>Monthly Income & Expenses ({selectedYear})</Text>
                {hasLineData ? (
                  <LineChart
                    data={{
                      labels: monthLabels,
                      datasets: [
                        {
                          data: monthlyExpenseTotals,
                          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // Red for expenses
                          strokeWidth: 2,
                          withDots: true,
                        },
                        {
                          data: monthlyIncomeTotals,
                          color: (opacity = 1) => `rgba(0, 191, 165, ${opacity})`, // Green for income
                          strokeWidth: 2,
                          withDots: true,
                        },
                      ],
                      legend: ['Expenses', 'Income'],
                    }}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    fromZero
                    style={{ borderRadius: 12, alignSelf: 'center', marginBottom: 10 }}
                  />
                ) : (
                  <Text style={styles.emptyState}>No monthly data available for this year.</Text>
                )}
                <Text style={[styles.sectionHeader, { textAlign: 'center'}]}>Breakdown by Category</Text>
              </>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', flex: 1 }}>
              <Text style={styles.categoryAmount}>₹{item.amount.toFixed(2)}</Text>
              <View style={styles.percentBarBg}>
                <View style={[styles.percentBar, { width: `${item.percent}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={styles.percentText}>{Math.round(item.percent)}% of total</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.content}
      />
        </SafeAreaView>
    );
}

function TypeSelector({ transactionType, setTransactionType }) {
  const options = [{ label: 'Expenses', value: 'expense' }, { label: 'Income', value: 'income' }];
  return (
    <View style={styles.typeSelector}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.typeButton, transactionType === opt.value && styles.typeButtonActive]}
          onPress={() => setTransactionType(opt.value)}
        >
          <Text style={[styles.typeButtonText, transactionType === opt.value && styles.typeButtonTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingTop: 0, paddingHorizontal: 16, paddingBottom: 50 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A2E35',
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
    margin: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 16,
    marginHorizontal: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    minWidth: 0,
    maxWidth: 70,
  },
  typeButtonActive: {
    backgroundColor: '#00BFA5',
    borderColor: '#00BFA5',
    elevation: 2,
  },
  typeButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  insightCard: {
    backgroundColor: '#E0F7FA',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    marginTop: 8,
  },
  insightText: {
    color: '#00796B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', color: '#1A2E35', marginTop: 28, marginBottom: 10, textAlign: 'left' },
  emptyState: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16, paddingHorizontal: 20 },
  errorState: {
    textAlign: 'center',
    color: '#FF3B30',
    marginTop: 80,
    fontSize: 17,
    paddingHorizontal: 24,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: { fontSize: 22, marginRight: 10 },
  categoryName: { fontSize: 16, color: '#1A2E35', fontWeight: '600' },
  categoryAmount: { fontSize: 16, color: '#1A2E35', fontWeight: 'bold' },
  percentBarBg: {
    width: 100,
    height: 7,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 2,
    overflow: 'hidden',
  },
  percentBar: {
    height: 7,
    borderRadius: 4,
  },
  percentText: { fontSize: 12, color: '#546E7A', marginTop: 0 },
  yearSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 0,
  },
  yearArrow: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A2E35',
    marginHorizontal: 10,
  },
});