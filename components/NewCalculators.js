import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// CALCULADORA DE FIXAÇÕES
export function FixationsCalculator({ theme, onSave, styles }) {
  const [length, setLength] = useState('');
  const [spacing, setSpacing] = useState('0.6');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const L = parseFloat(length);
    const e = parseFloat(spacing);

    if (!L || !e || L <= 0 || e <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    // Fórmula: x = teto(L / e)
    const x = Math.ceil(L / e);

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Quantidade de Fixações',
      inputs: {
        'Comprimento': `${L} m`,
        'Espaçamento': `${e} m`,
      },
      result: `${x} fixações necessárias`,
    };

    setResult({ quantity: x });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Comprimento Total (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 216"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Espaçamento entre Fixações (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={spacing}
          onChangeText={setSpacing}
          placeholder="Ex: 0.6"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            Espaçamentos típicos: Travessas 0,6m | Parafusos 0,3m
          </Text>
        </View>

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado</Text>
            <View style={styles.resultItem}>
              <Ionicons name="construct-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Quantidade Total</Text>
                <Text style={styles.resultValue}>{result.quantity} fixações</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CONVERSOR MLC ↔ TONELADAS
export function MLCConverter({ theme, onSave, styles }) {
  const [conversionMode, setConversionMode] = useState('mlc-to-ton'); // 'mlc-to-ton' ou 'ton-to-mlc'
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState(null);

  // MLC (Module Load Class) - Sistema de classificação de carga
  // 1 MLC ≈ 1 tonelada métrica (aproximação simplificada)
  // Fórmula mais precisa: MLC = (Carga em toneladas × 1.1) para veículos com lagartas
  // Para rodas: MLC = Carga em toneladas × 0.9

  const calculate = () => {
    const value = parseFloat(inputValue);

    if (!value || value <= 0) {
      Alert.alert('Erro', 'Introduza um valor válido');
      return;
    }

    let resultValue;
    let resultUnit;
    let formula;

    if (conversionMode === 'mlc-to-ton') {
      // MLC para Toneladas (rodas)
      resultValue = (value / 0.9).toFixed(2);
      resultUnit = 't';
      formula = 'Ton = MLC / 0.9';
    } else {
      // Toneladas para MLC (rodas)
      resultValue = (value * 0.9).toFixed(2);
      resultUnit = 'MLC';
      formula = 'MLC = Ton × 0.9';
    }

    const calcResult = {
      themeName: theme.title,
      calculationType: conversionMode === 'mlc-to-ton' ? 'MLC → Toneladas' : 'Toneladas → MLC',
      inputs: {
        'Valor': `${value} ${conversionMode === 'mlc-to-ton' ? 'MLC' : 't'}`,
      },
      result: `${resultValue} ${resultUnit}`,
    };

    setResult({
      value: resultValue,
      unit: resultUnit,
      formula,
    });

    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Tipo de Conversão</Text>
        <View style={styles.conversionModeSelector}>
          <TouchableOpacity
            style={[
              styles.conversionModeButton,
              conversionMode === 'mlc-to-ton' && styles.conversionModeButtonActive,
            ]}
            onPress={() => {
              setConversionMode('mlc-to-ton');
              setResult(null);
            }}
          >
            <Text
              style={[
                styles.conversionModeText,
                conversionMode === 'mlc-to-ton' && styles.conversionModeTextActive,
              ]}
            >
              MLC → Toneladas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.conversionModeButton,
              conversionMode === 'ton-to-mlc' && styles.conversionModeButtonActive,
            ]}
            onPress={() => {
              setConversionMode('ton-to-mlc');
              setResult(null);
            }}
          >
            <Text
              style={[
                styles.conversionModeText,
                conversionMode === 'ton-to-mlc' && styles.conversionModeTextActive,
              ]}
            >
              Toneladas → MLC
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.calcLabel}>
          {conversionMode === 'mlc-to-ton' ? 'Valor em MLC' : 'Valor em Toneladas'}
        </Text>
        <TextInput
          style={styles.calcInput}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={conversionMode === 'mlc-to-ton' ? 'Ex: 50' : 'Ex: 55.56'}
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            MLC (Module Load Class) - Sistema NATO de classificação de pontes
          </Text>
        </View>

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Converter</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado</Text>
            <View style={styles.resultItem}>
              <Ionicons name="analytics-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Valor Convertido</Text>
                <Text style={styles.resultValue}>{result.value} {result.unit}</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="calculator-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Fórmula Utilizada</Text>
                <Text style={styles.resultValue}>{result.formula}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// BLS CONSOLIDADO
export function BLSTotalCalculator({ theme, onSave, styles }) {
  const [railWeight, setRailWeight] = useState('');
  const [ballastWeight, setBallastWeight] = useState('');
  const [fixationsWeight, setFixationsWeight] = useState('');
  const [length, setLength] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const M_rail = parseFloat(railWeight) || 0;
    const M_ballast = parseFloat(ballastWeight) || 0;
    const M_fix = parseFloat(fixationsWeight) || 0;
    const L = parseFloat(length);

    if (!L || L <= 0) {
      Alert.alert('Erro', 'Introduza o comprimento da via');
      return;
    }

    // Massa total
    const M_total = M_rail + M_ballast + M_fix;
    
    // Peso médio por metro
    const avgWeight = M_total / L;

    const calcResult = {
      themeName: theme.title,
      calculationType: 'BLS Consolidado',
      inputs: {
        'Carril': `${M_rail} t`,
        'Balastro': `${M_ballast} t`,
        'Fixações': `${M_fix} t`,
        'Comprimento': `${L} m`,
      },
      result: `Total: ${M_total.toFixed(2)} t, Média: ${avgWeight.toFixed(3)} t/m`,
    };

    setResult({
      total: M_total.toFixed(2),
      avgPerMeter: avgWeight.toFixed(3),
      railPercent: ((M_rail / M_total) * 100).toFixed(1),
      ballastPercent: ((M_ballast / M_total) * 100).toFixed(1),
      fixPercent: ((M_fix / M_total) * 100).toFixed(1),
    });

    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.sectionTitle}>Massas por Componente (toneladas)</Text>

        <Text style={styles.calcLabel}>Massa de Carril (t)</Text>
        <TextInput
          style={styles.calcInput}
          value={railWeight}
          onChangeText={setRailWeight}
          placeholder="Ex: 71.07"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Massa de Balastro (t)</Text>
        <TextInput
          style={styles.calcInput}
          value={ballastWeight}
          onChangeText={setBallastWeight}
          placeholder="Ex: 150.5"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Massa de Fixações (t) - opcional</Text>
        <TextInput
          style={styles.calcInput}
          value={fixationsWeight}
          onChangeText={setFixationsWeight}
          placeholder="Ex: 12.3"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Comprimento da Via (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 1250"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Consolidar</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Totais</Text>
            <View style={styles.resultItem}>
              <Ionicons name="barbell-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Massa Total</Text>
                <Text style={styles.resultValue}>{result.total} t</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="analytics-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Média por Metro</Text>
                <Text style={styles.resultValue}>{result.avgPerMeter} t/m</Text>
              </View>
            </View>
            <Text style={styles.resultSubtitle}>Distribuição Percentual</Text>
            <View style={styles.resultItem}>
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Carril: {result.railPercent}%</Text>
                <Text style={styles.resultLabel}>Balastro: {result.ballastPercent}%</Text>
                <Text style={styles.resultLabel}>Fixações: {result.fixPercent}%</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
