// app/screens/AnalyticsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { getTransactions } from '../utils/storage';

// Get the width of the screen for chart sizing
const screenWidth = Dimensions.get('window').width;

function filterTransactionsByPeriod(transactions, period) {
  const now = new Date();
  if (period === 'Week') {
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); return transactions.filter(txn => new Date(txn.date) >= weekAgo);
  }
  if (period === 'Month') {
    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1); return transactions.filter(txn => new Date(txn.date) >= monthAgo);
  }
  if (period === 'Year') {
    const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1); return transactions.filter(txn => new Date(txn.date) >= yearAgo);
  }
  return transactions;
}

// Soft, harmonious color palette for pie chart
const pieColors = [
  '#4DD0E1', // soft teal
  '#81C784', // soft green
  '#FFD54F', // soft yellow
  '#FFB74D', // soft orange
  '#A1887F', // soft brown
  '#90A4AE', // soft blue-grey
  '#BA68C8', // soft purple
  '#E57373', // soft red
  '#64B5F6', // soft blue
  '#FFF176', // soft lemon
  '#AED581', // soft lime
  '#B0BEC5', // soft grey
];

const AnalyticsScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTransactions();
      setTransactions(data);
    };
    fetchData();
  }, []);

  // Always filter and process data on every render
  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);

  // Summary
  const totalIncome = filteredTransactions
    .filter(txn => txn.type === 'income')
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalExpenses = filteredTransactions
    .filter(txn => txn.type === 'expense')
    .reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalSavings = totalIncome - totalExpenses;

  // Pie Chart: Expense Breakdown by Category (multi-color)
  const categoryTotals = {};
  filteredTransactions.forEach(txn => {
    if (txn.type === 'expense') {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + Number(txn.amount);
    }
  });
  const pieChartData = Object.keys(categoryTotals).map((category, idx) => ({
    name: category,
    amount: categoryTotals[category],
    color: pieColors[idx % pieColors.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 14,
  }));

  // Bar Chart: Income vs Expense by Month (chart-kit, single color per dataset)
  const monthly = {};
  filteredTransactions.forEach(txn => {
    const date = new Date(txn.date);
    const month = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    if (txn.type === 'income') monthly[month].income += Number(txn.amount);
    if (txn.type === 'expense') monthly[month].expense += Number(txn.amount);
  });
  const months = Object.keys(monthly);
  const incomeData = months.map(m => monthly[m].income);
  const expenseData = months.map(m => monthly[m].expense);
  const barChartData = {
    labels: months,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => `rgba(0, 191, 165, ${opacity})`, // Income bars green
      },
      {
        data: expenseData,
        color: (opacity = 1) => `rgba(255, 112, 67, ${opacity})`, // Expense bars orange
      },
    ],
    legend: ['Income', 'Expenses'],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    fillShadowGradient: '#00BFA5', // or your bar color
    fillShadowGradientOpacity: 1,
    color: (opacity = 1) => `rgba(0, 191, 165, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.8,
    useShadows: false,
    labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    propsForLabels: { fontSize: 12 },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Analytics</Text>
        {/* --- Time Period Selector --- */}
        <View style={styles.periodSelector}>
          {['Week', 'Month', 'Year'].map(period => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>{period}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* --- Summary Cards --- */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#00BFA5' }]}>₹{totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>₹{totalExpenses.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Savings</Text>
            <Text style={styles.summaryValue}>₹{totalSavings.toFixed(2)}</Text>
          </View>
        </View>
        {/* --- Expense Breakdown Pie Chart --- */}
        <Text style={styles.chartTitle}>Expense Breakdown</Text>
        <View style={styles.chartCard}>
          {pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
              hasLegend={true}
            />
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginBottom: 20 }}>No expense data available.</Text>
          )}
        </View>
        {/* --- Income vs Expense Bar Chart (chart-kit) --- */}
        <Text style={styles.chartTitle}>Income vs Expense</Text>
        <View style={styles.chartCard}>
          {months.length > 0 ? (
            <BarChart
              data={barChartData}
              width={screenWidth - 48}
              height={250}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              showBarTops={false}
              withInnerLines={false}
              style={{ borderRadius: 12, alignSelf: 'center' }}
            />
          ) : (
            <Text style={{ textAlign: 'center', color: '#888', marginBottom: 20 }}>No monthly data available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A2E35', marginBottom: 20 },
  periodSelector: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F0F0F0', borderRadius: 8, marginBottom: 20 },
  periodButton: { flex: 1, paddingVertical: 10, borderRadius: 8 },
  periodButtonActive: { backgroundColor: '#00BFA5' },
  periodText: { textAlign: 'center', color: '#546E7A', fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  summaryCard: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 8, alignItems: 'center', flex: 1, marginHorizontal: 5 },
  summaryLabel: { color: '#546E7A', fontSize: 14, marginBottom: 5 },
  summaryValue: { color: '#1A2E35', fontSize: 18, fontWeight: 'bold' },
  chartTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A2E35', marginTop: 20, marginBottom: 15 },
  chartCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 24,
    // No alignItems for full-width charts
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
});

export default AnalyticsScreen;