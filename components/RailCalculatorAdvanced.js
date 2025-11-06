// CALCULADORA DE CARRIL COMPLETA - Para substituir a versão básica
// Baseada no guia de cálculo completo

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

export function RailCalculatorAdvanced({ theme, onSave, styles }) {
  const [railType, setRailType] = useState('UIC60');
  const [length, setLength] = useState('');
  const [barLength, setBarLength] = useState('108');
  const [loss, setLoss] = useState('0');
  const [result, setResult] = useState(null);

  const railTypes = {
    UIC60: { weight: 60.34, name: 'UIC 60' },
    UIC54: { weight: 54.77, name: 'UIC 54 (54E1)' },
    S49: { weight: 49.43, name: 'S49' },
    UIC45: { weight: 45.00, name: 'UIC 45' },
  };

  const calculate = () => {
    const L = parseFloat(length);
    const k = parseFloat(barLength);
    const p = parseFloat(loss);
    const z = railTypes[railType].weight;

    if (!L || L <= 0 || !k || k <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    // Número de barras (com ou sem perdas)
    const x = p > 0 ? Math.ceil(L / (k - p)) : Math.ceil(L / k);
    
    // Comprimento efetivo fornecido
    const Le = x * k;
    
    // Sobra ou falta
    const deltaL = Le - L;
    
    // Massa total (em toneladas)
    const weightExact = (L * z) / 1000;
    const weightBars = (x * k * z) / 1000;
    
    // Número de soldaduras
    const welds = x - 1;

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Cálculo Completo de Carril',
      inputs: {
        'Tipo': railTypes[railType].name,
        'Comprimento': `${L} m`,
        'Barra': `${k} m`,
        'Perda': `${p} m`,
      },
      result: `${x} barras, ${weightBars.toFixed(2)} t, ${welds} soldaduras, sobra: ${deltaL.toFixed(1)} m`,
    };

    setResult({
      bars: x,
      effectiveLength: Le.toFixed(1),
      surplus: deltaL.toFixed(1),
      weightExact: weightExact.toFixed(2),
      weightBars: weightBars.toFixed(2),
      welds,
    });

    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Tipo de Carril</Text>
        <View style={styles.railTypeSelector}>
          {Object.entries(railTypes).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.railTypeButton,
                railType === key && styles.railTypeButtonActive,
              ]}
              onPress={() => setRailType(key)}
            >
              <Text
                style={[
                  styles.railTypeText,
                  railType === key && styles.railTypeTextActive,
                ]}
              >
                {key}
              </Text>
              <Text style={styles.railTypeWeight}>{value.weight} kg/m</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.calcLabel}>Comprimento Total da Via (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 1250"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Comprimento da Barra (m)</Text>
        <View style={styles.barLengthSelector}>
          {['108', '60', '36', '18'].map(len => (
            <TouchableOpacity
              key={len}
              style={[
                styles.barLengthButton,
                barLength === len && styles.barLengthButtonActive,
              ]}
              onPress={() => setBarLength(len)}
            >
              <Text
                style={[
                  styles.barLengthText,
                  barLength === len && styles.barLengthTextActive,
                ]}
              >
                {len} m
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.calcLabel}>Perda por Barra (m) - opcional</Text>
        <TextInput
          style={styles.calcInput}
          value={loss}
          onChangeText={setLoss}
          placeholder="Ex: 0.3"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            Fórmula: x = teto(L / (k - p)) | Soldaduras = x - 1
          </Text>
        </View>

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            <View style={styles.resultItem}>
              <Ionicons name="layers-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Número de Barras</Text>
                <Text style={styles.resultValue}>{result.bars} barras</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="resize-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Comprimento Efetivo</Text>
                <Text style={styles.resultValue}>{result.effectiveLength} m</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="git-compare-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Sobra Técnica</Text>
                <Text style={styles.resultValue}>{result.surplus} m</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="barbell-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Massa Total (barras)</Text>
                <Text style={styles.resultValue}>{result.weightBars} t</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="link-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Soldaduras</Text>
                <Text style={styles.resultValue}>{result.welds} soldaduras</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
