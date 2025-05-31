import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const interestRates = [3, 4, 7, 12];

const getTodayIST = () => {
  const nowUTC = new Date();
  const offset = 5.5 * 60 * 60000; // IST offset in ms
  return new Date(nowUTC.getTime() + offset);
};

const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDateString = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};

export default function App() {
  const [principal, setPrincipal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(formatDateToDDMMYYYY(getTodayIST()));
  const [error, setError] = useState('');
  const [principalError, setPrincipalError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [results, setResults] = useState<{ dayDiff: number; data: { rate: number; interest: string }[]; startDate: string; endDate: string } | null>(null);

  const formatDateInput = (value: string, previousValue: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    let formatted = '';
    if (digits.length > 0) formatted += digits.slice(0, 2);
    if (digits.length > 2) formatted += '/' + digits.slice(2, 4);
    if (digits.length > 4) formatted += '/' + digits.slice(4, 8);
    
    return formatted;
  };

  const calculateInterest = () => {
    const principalNum = parseFloat(principal);
    const startDateObj = parseDateString(startDate);
    const endDateObj = parseDateString(endDate);

    // Reset all errors
    setPrincipalError(false);
    setStartDateError(false);
    setError('');

    // Check for empty fields
    if (!principal || principal.trim() === '') {
      setPrincipalError(true);
      setError('Principal amount is required');
      setResults(null);
      return;
    }

    if (!startDate || startDate.trim() === '') {
      setStartDateError(true);
      setError('Start date is required');
      setResults(null);
      return;
    }

    // Validate principal amount
    if (!principalNum || isNaN(principalNum) || principalNum <= 0) {
      setError('Enter valid principal amount');
      setResults(null);
      return;
    }

    // Validate dates
    if (!startDateObj || !endDateObj) {
      setError('Enter valid dates');
      setResults(null);
      return;
    }

    if (startDateObj > endDateObj) {
      setError('Start date cannot be after end date');
      setResults(null);
      return;
    }

    const dayDiff = Math.floor(
      (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    const data = interestRates.map((rate) => {
      const interest = (principalNum * rate * dayDiff) / (100 * 365);
      return { rate, interest: interest.toFixed(2) };
    });

    setResults({ dayDiff, data, startDate, endDate });
  };

  useEffect(() => {
    if (principal || startDate || endDate) {
      calculateInterest();
    }
  }, [principal, startDate, endDate]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Simple Interest Calculator</Text>

      <Text style={styles.label}>Principal Amount</Text>
      <TextInput
        style={[styles.input, principalError && styles.inputError]}
        keyboardType="numeric"
        placeholder="Enter amount"
        value={principal}
        onChangeText={setPrincipal}
      />

      <Text style={styles.label}>Start Date (DD/MM/YYYY)</Text>
      <TextInput
        style={[styles.input, startDateError && styles.inputError]}
        placeholder="DD/MM/YYYY"
        value={startDate}
        onChangeText={(value) => setStartDate(formatDateInput(value, startDate))}
        maxLength={10}
        keyboardType="number-pad"
        returnKeyType="done"
      />

      <Text style={styles.label}>End Date (DD/MM/YYYY)</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/YYYY"
        value={endDate}
        onChangeText={(value) => setEndDate(formatDateInput(value, endDate))}
        maxLength={10}
        keyboardType="number-pad"
        returnKeyType="done"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {results && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>Interest Calculation</Text>
            <Text style={styles.resultDays}>{results.dayDiff} day(s)</Text>
          </View>
          <Text style={styles.dateRange}>
            From {results.startDate} to {results.endDate}
          </Text>
          {results.data.map((item) => (
            <View key={item.rate} style={styles.resultItem}>
              <Text style={styles.rateLabel}>{item.rate}% Interest</Text>
              <Text style={styles.amountValue}>₹{item.interest}</Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3f51b5',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 6,
  },
  inputError: {
    borderBottomColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  resultCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 6,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3f51b5',
  },
  resultDays: {
    fontSize: 13,
    color: '#888',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rateLabel: {
    fontSize: 14,
    color: '#555',
  },
  amountValue: {
    fontWeight: '600',
    color: '#1a237e',
  },
  dateRange: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
});
