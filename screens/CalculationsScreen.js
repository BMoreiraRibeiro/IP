import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FixationsCalculator, MLCConverter, BLSTotalCalculator } from '../components/NewCalculators';
import ImageGalleryModal from '../components/ImageGalleryModal';
import imageManifest from '../assets/imageManifest';

const CALCULATION_THEMES = [
  {
    id: 'rail',
    title: 'Carril',
    icon: 'train-outline',
    color: '#FF6B6B',
    description: 'Cálculos de carril e via férrea',
  },
  {
    id: 'ballast',
    title: 'Balastro',
    icon: 'cube-outline',
    color: '#4ECDC4',
    description: 'Volume e peso de balastro',
  },
  {
    id: 'sleepers',
    title: 'Travessas (BLS)',
    icon: 'grid-outline',
    color: '#95E1D3',
    description: 'Dilatação térmica',
  },
  {
    id: 'curves',
    title: 'Flechas e Raios',
    icon: 'git-compare-outline',
    color: '#FCBF49',
    description: 'Cálculo de curvas',
  },
  {
    id: 'superelevation',
    title: 'Superelevação',
    icon: 'triangle-outline',
    color: '#F77F00',
    description: 'Escalas em curvas',
  },
  {
    id: 'levelcrossing',
    title: 'Passagens Nível',
    icon: 'warning-outline',
    color: '#D62828',
    description: 'Visibilidade e segurança',
  },
  {
    id: 'fixations',
    title: 'Fixações',
    icon: 'construct-outline',
    color: '#06A77D',
    description: 'Quantidade de fixações',
  },
  {
    id: 'converter',
    title: 'Conversor MLC',
    icon: 'swap-horizontal-outline',
    color: '#845EC2',
    description: 'MLC ↔ Toneladas',
  },
  {
    id: 'bls-total',
    title: 'BLS Consolidado',
    icon: 'calculator-outline',
    color: '#FF9671',
    description: 'Totais e médias',
  },
];

export default function CalculationsScreen() {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('@calculation_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveToHistory = async (calculation) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        ...calculation,
        timestamp: new Date().toISOString(),
      };
      const newHistory = [newEntry, ...history].slice(0, 50);
      setHistory(newHistory);
      await AsyncStorage.setItem('@calculation_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Erro ao guardar histórico:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Deseja eliminar todo o histórico de cálculos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            setHistory([]);
            await AsyncStorage.removeItem('@calculation_history');
          },
        },
      ]
    );
  };

  const openTheme = (theme) => {
    setSelectedTheme(theme);
  };

  const THEME_TO_MANIFEST = {
    rail: 'VIAS',
    ballast: 'Balastro',
    sleepers: 'fixacoes_travessa_madeira_54',
    curves: 'calculo_flechas_raios',
    superelevation: 'Escalas',
    levelcrossing: 'PNs',
    fixations: 'fixacao_tbb_02',
    converter: 'Escalas',
    'bls-total': 'Balastro',
  };

  const openGalleryFor = (themeId) => {
    const key = THEME_TO_MANIFEST[themeId];
    const imgs = (key && imageManifest[key]) ? imageManifest[key] : [];
    if (!imgs || imgs.length === 0) {
      Alert.alert('Sem imagens', 'Não existem imagens técnicas para este tema.');
      return;
    }
    setGalleryImages(imgs);
    setGalleryVisible(true);
  };

  const closeTheme = () => {
    setSelectedTheme(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cálculos</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
        >
          <Ionicons name="time-outline" size={24} color="#64B5F6" />
          {history.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{history.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Selecione o tipo de cálculo</Text>
        
        <View style={styles.themesGrid}>
          {CALCULATION_THEMES.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={styles.themeCard}
              onPress={() => openTheme(theme)}
              activeOpacity={0.7}
            >
              <View style={[styles.themeIcon, { backgroundColor: theme.color + '20' }]}>
                <Ionicons name={theme.icon} size={32} color={theme.color} />
              </View>
              <Text style={styles.themeTitle}>{theme.title}</Text>
              <Text style={styles.themeDescription}>{theme.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color="#64B5F6" />
          <Text style={styles.infoText}>
            Todos os cálculos são guardados automaticamente no histórico
          </Text>
        </View>
      </ScrollView>

      {/* Render the calculator as an overlay so the gallery modal can also render above it */}
      {selectedTheme && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={false}
          onRequestClose={closeTheme}
        >
          <CalculatorModal
            theme={selectedTheme}
            onClose={closeTheme}
            onSaveHistory={saveToHistory}
            openGallery={openGalleryFor}
          />
        </Modal>
      )}

      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.historyModal}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Histórico de Cálculos</Text>
              <View style={styles.historyActions}>
                {history.length > 0 && (
                  <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
                    <Ionicons name="trash-outline" size={22} color="#EF5350" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowHistory(false)}>
                  <Ionicons name="close" size={28} color="#B0BEC5" />
                </TouchableOpacity>
              </View>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="calculator-outline" size={64} color="#2C2C2C" />
                <Text style={styles.emptyText}>Sem cálculos no histórico</Text>
              </View>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemTheme}>{item.themeName}</Text>
                      <Text style={styles.historyItemDate}>
                        {new Date(item.timestamp).toLocaleString('pt-PT')}
                      </Text>
                    </View>
                    <Text style={styles.historyItemCalc}>{item.calculationType}</Text>
                    <View style={styles.historyItemValues}>
                      {Object.entries(item.inputs).map(([key, value]) => (
                        <Text key={key} style={styles.historyItemValue}>
                          {key}: {value}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.historyItemResult}>
                      <Ionicons name="arrow-forward" size={16} color="#64B5F6" />
                      <Text style={styles.historyItemResultText}>{item.result}</Text>
                    </View>
                    
                    {/* Mostrar imagens anexadas */}
                    {item.images && item.images.length > 0 && (
                      <View style={styles.historyImagesSection}>
                        <View style={styles.historyImagesHeader}>
                          <Ionicons name="images-outline" size={16} color="#64B5F6" />
                          <Text style={styles.historyImagesLabel}>
                            {item.images.length} {item.images.length === 1 ? 'imagem' : 'imagens'} anexada(s)
                          </Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyImagesScroll}>
                          {item.images.map((uri, index) => (
                            <Image 
                              key={index} 
                              source={{ uri }} 
                              style={styles.historyImageThumb}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
                contentContainerStyle={styles.historyList}
              />
            )}
          </View>
        </View>
      </Modal>
      <ImageGalleryModal
        visible={galleryVisible}
        images={galleryImages}
        onClose={() => setGalleryVisible(false)}
      />
    </View>
  );
}

function CalculatorModal({ theme, onClose, onSaveHistory, openGallery }) {
  const handleSave = (calcResult) => {
    // Save calculation result (no images attached from this modal)
    onSaveHistory(calcResult);
  };

  const renderCalculator = () => {
    switch (theme.id) {
      case 'rail':
        return <RailCalculator theme={theme} onSave={handleSave} />;
      case 'ballast':
        return <BallastCalculator theme={theme} onSave={handleSave} />;
      case 'sleepers':
        return <SleepersCalculator theme={theme} onSave={handleSave} />;
      case 'curves':
        return <CurvesCalculator theme={theme} onSave={handleSave} />;
      case 'superelevation':
        return <SuperelevationCalculator theme={theme} onSave={handleSave} />;
      case 'levelcrossing':
        return <LevelCrossingCalculator theme={theme} onSave={handleSave} />;
      case 'fixations':
        return <FixationsCalculator theme={theme} onSave={handleSave} styles={styles} />;
      case 'converter':
        return <MLCConverter theme={theme} onSave={handleSave} styles={styles} />;
      case 'bls-total':
        return <BLSTotalCalculator theme={theme} onSave={handleSave} styles={styles} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.calculatorHeader, { backgroundColor: theme.color }]}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.calculatorHeaderContent}>
          <Ionicons name={theme.icon} size={28} color="#FFFFFF" />
          <Text style={styles.calculatorTitle}>{theme.title}</Text>
        </View>
      </View>

      {/* Botão para abrir imagens técnicas (abre a galeria, sem anexar) */}
      <View style={styles.techImagesRow}>
        <TouchableOpacity
          style={[styles.imageButton, styles.techButton]}
          onPress={() => openGallery && openGallery(theme.id)}
        >
          <Ionicons name="images" size={18} color="#64B5F6" />
          <Text style={[styles.imageButtonText, { marginLeft: 8 }]} numberOfLines={1}>Imagens técnicas</Text>
        </TouchableOpacity>
      </View>

      

      {renderCalculator()}
    </KeyboardAvoidingView>
  );
}

// CALCULADORA DE CARRIL
function RailCalculator({ theme, onSave }) {
  const [railType, setRailType] = useState('UIC60');
  const [length, setLength] = useState('');
  const [result, setResult] = useState(null);

  const railTypes = {
    UIC60: { weight: 60.34, name: 'UIC 60 (60.34 kg/m)' },
    UIC54: { weight: 54.43, name: 'UIC 54 (54.43 kg/m)' },
    S49: { weight: 49.43, name: 'S49 (49.43 kg/m)' },
    UIC45: { weight: 45.00, name: 'UIC 45 (45.00 kg/m)' },
  };

  const calculate = () => {
    const len = parseFloat(length);
    if (!len || len <= 0) {
      Alert.alert('Erro', 'Introduza um comprimento válido');
      return;
    }

    const weight = railTypes[railType].weight;
    const totalWeight = (weight * len).toFixed(2);
    const rails = Math.ceil(len / 18);
    const totalWeightBoth = (totalWeight * 2).toFixed(2);

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Peso e Quantidade de Carril',
      inputs: {
        'Tipo': railTypes[railType].name,
        'Comprimento': `${len} m`,
      },
      result: `${totalWeight} kg (linha simples), ${totalWeightBoth} kg (via completa), ${rails} carris necessários`,
    };

    setResult({
      weightPerRail: totalWeight,
      weightBothRails: totalWeightBoth,
      numberOfRails: rails,
      totalLength: len,
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

        <Text style={styles.calcLabel}>Comprimento do Troço (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 1000"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            <View style={styles.resultItem}>
              <Ionicons name="barbell-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Peso (1 linha)</Text>
                <Text style={styles.resultValue}>{result.weightPerRail} kg</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Peso (via completa)</Text>
                <Text style={styles.resultValue}>{result.weightBothRails} kg</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="layers-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Carris necessários (18m)</Text>
                <Text style={styles.resultValue}>{result.numberOfRails} unidades</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE BALASTRO
function BallastCalculator({ theme, onSave }) {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('3.5');
  const [thickness, setThickness] = useState('0.3');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const len = parseFloat(length);
    const w = parseFloat(width);
    const t = parseFloat(thickness);

    if (!len || !w || !t || len <= 0 || w <= 0 || t <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    const volume = (len * w * t).toFixed(2);
    const weight = (volume * 1.6).toFixed(2);
    const truckLoads = Math.ceil(weight / 20);

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Volume e Peso de Balastro',
      inputs: {
        'Comprimento': `${len} m`,
        'Largura': `${w} m`,
        'Espessura': `${t} m`,
      },
      result: `${volume} m³, ${weight} toneladas, ${truckLoads} camiões`,
    };

    setResult({ volume, weight, truckLoads });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Comprimento (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 1000"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Largura da Via (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={width}
          onChangeText={setWidth}
          placeholder="Ex: 3.5"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Espessura da Camada (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={thickness}
          onChangeText={setThickness}
          placeholder="Ex: 0.3"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            <View style={styles.resultItem}>
              <Ionicons name="cube-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Volume</Text>
                <Text style={styles.resultValue}>{result.volume} m³</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="barbell-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Peso Total</Text>
                <Text style={styles.resultValue}>{result.weight} toneladas</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="car-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Camiões Necessários</Text>
                <Text style={styles.resultValue}>{result.truckLoads} unidades</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE CATENÁRIA
function CatenaryCalculator({ theme, onSave }) {
  const [span, setSpan] = useState('');
  const [tension, setTension] = useState('20');
  const [weight, setWeight] = useState('1.07');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const L = parseFloat(span);
    const T = parseFloat(tension);
    const w = parseFloat(weight);

    if (!L || !T || !w || L <= 0 || T <= 0 || w <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    const sag = ((w * L * L) / (8 * T * 1000)).toFixed(3);
    const minHeight = (5.5 + parseFloat(sag)).toFixed(2);

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Flecha e Altura da Catenária',
      inputs: {
        'Vão': `${L} m`,
        'Tensão': `${T} kN`,
        'Peso': `${w} kg/m`,
      },
      result: `Flecha: ${sag} m, Altura mín: ${minHeight} m`,
    };

    setResult({ sag, minHeight });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Comprimento do Vão (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={span}
          onChangeText={setSpan}
          placeholder="Ex: 60"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Tensão Mecânica (kN)</Text>
        <TextInput
          style={styles.calcInput}
          value={tension}
          onChangeText={setTension}
          placeholder="Ex: 20"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Peso do Cabo (kg/m)</Text>
        <TextInput
          style={styles.calcInput}
          value={weight}
          onChangeText={setWeight}
          placeholder="Ex: 1.07"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            <View style={styles.resultItem}>
              <Ionicons name="trending-down-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Flecha</Text>
                <Text style={styles.resultValue}>{result.sag} m</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="arrow-up-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Altura Mínima</Text>
                <Text style={styles.resultValue}>{result.minHeight} m</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE SINALIZAÇÃO
function SignalingCalculator({ theme, onSave }) {
  const [speed, setSpeed] = useState('');
  const [calcType, setCalcType] = useState('braking');
  const [gradient, setGradient] = useState('0');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const v = parseFloat(speed);
    const g = parseFloat(gradient);

    if (!v || v <= 0) {
      Alert.alert('Erro', 'Introduza uma velocidade válida');
      return;
    }

    let brakingDistance, reactionTime, totalDistance;

    if (calcType === 'braking') {
      const deceleration = 0.8 - (g / 1000);
      brakingDistance = ((v / 3.6) ** 2) / (2 * deceleration);
      reactionTime = 2;
      const reactionDistance = (v / 3.6) * reactionTime;
      totalDistance = (brakingDistance + reactionDistance).toFixed(0);

      const calcResult = {
        themeName: theme.title,
        calculationType: 'Distância de Travagem',
        inputs: {
          'Velocidade': `${v} km/h`,
          'Gradiente': `${g} ‰`,
        },
        result: `${totalDistance} m (${brakingDistance.toFixed(0)}m travagem + ${reactionDistance.toFixed(0)}m reação)`,
      };

      setResult({
        brakingDistance: brakingDistance.toFixed(0),
        reactionDistance: reactionDistance.toFixed(0),
        totalDistance,
      });
      onSave(calcResult);
    } else {
      const signalDistance = ((v / 3.6) * 60).toFixed(0);
      
      const calcResult = {
        themeName: theme.title,
        calculationType: 'Espaçamento de Sinais',
        inputs: {
          'Velocidade': `${v} km/h`,
        },
        result: `${signalDistance} m entre sinais`,
      };

      setResult({ signalDistance });
      onSave(calcResult);
    }
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Tipo de Cálculo</Text>
        <View style={styles.railTypeSelector}>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcType === 'braking' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcType('braking')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcType === 'braking' && styles.railTypeTextActive,
              ]}
            >
              Travagem
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcType === 'spacing' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcType('spacing')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcType === 'spacing' && styles.railTypeTextActive,
              ]}
            >
              Espaçamento
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.calcLabel}>Velocidade (km/h)</Text>
        <TextInput
          style={styles.calcInput}
          value={speed}
          onChangeText={setSpeed}
          placeholder="Ex: 120"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        {calcType === 'braking' && (
          <>
            <Text style={styles.calcLabel}>Gradiente (‰)</Text>
            <TextInput
              style={styles.calcInput}
              value={gradient}
              onChangeText={setGradient}
              placeholder="Ex: 5 (positivo = subida)"
              placeholderTextColor="#546E7A"
              keyboardType="numeric"
            />
          </>
        )}

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            {calcType === 'braking' ? (
              <>
                <View style={styles.resultItem}>
                  <Ionicons name="speedometer-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Distância de Travagem</Text>
                    <Text style={styles.resultValue}>{result.brakingDistance} m</Text>
                  </View>
                </View>
                <View style={styles.resultItem}>
                  <Ionicons name="time-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Distância de Reação</Text>
                    <Text style={styles.resultValue}>{result.reactionDistance} m</Text>
                  </View>
                </View>
                <View style={styles.resultItem}>
                  <Ionicons name="resize-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Distância Total</Text>
                    <Text style={styles.resultValue}>{result.totalDistance} m</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.resultItem}>
                <Ionicons name="swap-horizontal-outline" size={20} color="#64B5F6" />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultLabel}>Espaçamento entre Sinais</Text>
                  <Text style={styles.resultValue}>{result.signalDistance} m</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE DRENAGEM
function DrainageCalculator({ theme, onSave }) {
  const [area, setArea] = useState('');
  const [rainfall, setRainfall] = useState('50');
  const [runoff, setRunoff] = useState('0.6');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const A = parseFloat(area);
    const I = parseFloat(rainfall);
    const C = parseFloat(runoff);

    if (!A || !I || !C || A <= 0 || I <= 0 || C <= 0 || C > 1) {
      Alert.alert('Erro', 'Introduza valores válidos (C entre 0 e 1)');
      return;
    }

    const flow = ((C * I * A) / 360).toFixed(2);
    const diameter = Math.ceil((Math.sqrt(flow / 0.3) * 100) / 50) * 50;

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Capacidade de Drenagem',
      inputs: {
        'Área': `${A} m²`,
        'Precipitação': `${I} mm/h`,
        'Coef. Escoamento': C,
      },
      result: `${flow} L/s, Ø ${diameter} mm`,
    };

    setResult({ flow, diameter });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Área de Drenagem (m²)</Text>
        <TextInput
          style={styles.calcInput}
          value={area}
          onChangeText={setArea}
          placeholder="Ex: 5000"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Intensidade de Precipitação (mm/h)</Text>
        <TextInput
          style={styles.calcInput}
          value={rainfall}
          onChangeText={setRainfall}
          placeholder="Ex: 50"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Coeficiente de Escoamento (0-1)</Text>
        <TextInput
          style={styles.calcInput}
          value={runoff}
          onChangeText={setRunoff}
          placeholder="Ex: 0.6"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            Coeficiente típico: Balastro 0.5-0.6, Betão 0.8-0.9
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
              <Ionicons name="water-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Caudal</Text>
                <Text style={styles.resultValue}>{result.flow} L/s</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="resize-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Diâmetro Sugerido</Text>
                <Text style={styles.resultValue}>{result.diameter} mm</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE TRAVESSAS (BLS) - DILATAÇÃO TÉRMICA
function SleepersCalculator({ theme, onSave }) {
  const [length, setLength] = useState('');
  const [tempCurrent, setTempCurrent] = useState('');
  const [tempTarget, setTempTarget] = useState('30');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const len = parseFloat(length);
    const tCurr = parseFloat(tempCurrent);
    const tTarget = parseFloat(tempTarget);

    if (!len || len <= 0) {
      Alert.alert('Erro', 'Introduza um comprimento válido');
      return;
    }

    // Fórmula do Excel: Alongamento = coef × extensão × ΔTemperatura
    const dilationCoef = 0.0105; // Coeficiente de dilatação do aço
    const deltaTemp = tTarget - tCurr;
    const elongationMeters = len * dilationCoef * deltaTemp;
    const elongationMM = (elongationMeters * 1000).toFixed(1);

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Dilatação Térmica BLS',
      inputs: {
        'Extensão': `${len} m`,
        'Temp. Atual': `${tCurr} °C`,
        'Temp. Regularização': `${tTarget} °C`,
      },
      result: `Alongamento: ${elongationMM} mm (${deltaTemp > 0 ? 'expandir' : 'contrair'})`,
    };

    setResult({
      elongationMM,
      elongationMeters: elongationMeters.toFixed(4),
      deltaTemp: deltaTemp.toFixed(1),
    });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Extensão a Regularizar (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={length}
          onChangeText={setLength}
          placeholder="Ex: 400"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Temperatura Atual (°C)</Text>
        <TextInput
          style={styles.calcInput}
          value={tempCurrent}
          onChangeText={setTempCurrent}
          placeholder="Ex: 11"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Temperatura de Regularização (°C)</Text>
        <TextInput
          style={styles.calcInput}
          value={tempTarget}
          onChangeText={setTempTarget}
          placeholder="Ex: 30"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            Coeficiente de dilatação do aço: 0.0105 mm/(m·°C)
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
              <Ionicons name="thermometer-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Variação de Temperatura</Text>
                <Text style={styles.resultValue}>{result.deltaTemp} °C</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="resize-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Alongamento</Text>
                <Text style={styles.resultValue}>{result.elongationMM} mm</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="expand-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Alongamento (metros)</Text>
                <Text style={styles.resultValue}>{result.elongationMeters} m</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE FLECHAS E RAIOS
function CurvesCalculator({ theme, onSave }) {
  const [calcMode, setCalcMode] = useState('radius'); // 'radius' ou 'arrow'
  const [chord, setChord] = useState('20');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const c = parseFloat(chord);
    const val = parseFloat(input);

    if (!c || !val || c <= 0 || val <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    const semiChord = c / 2;

    if (calcMode === 'radius') {
      // Dado o raio, calcular a flecha
      // Fórmula: Flecha = (Semi-Corda)² / (2 × Raio)
      const radius = val;
      const arrowMeters = (semiChord * semiChord) / (2 * radius);
      const arrowMM = (arrowMeters * 1000).toFixed(2);

      // Calcular flechas intermédias (F1-F6)
      const F4 = arrowMeters;
      const F1 = (0.4375 * F4 * 1000).toFixed(2);
      const F2 = (0.75 * F4 * 1000).toFixed(2);
      const F3 = (0.9375 * F4 * 1000).toFixed(2);
      const F5 = F3;
      const F6 = F2;

      const calcResult = {
        themeName: theme.title,
        calculationType: 'Cálculo de Flechas',
        inputs: {
          'Corda': `${c} m`,
          'Raio': `${radius} m`,
        },
        result: `Flecha: ${arrowMM} mm (F1:${F1}, F2:${F2}, F3:${F3})`,
      };

      setResult({
        arrow: arrowMM,
        semiChord: semiChord.toFixed(2),
        flechas: { F1, F2, F3, F4: (F4 * 1000).toFixed(2), F5, F6 },
      });
      onSave(calcResult);
    } else {
      // Dada a flecha, calcular o raio
      // Fórmula: Raio = (Semi-Corda)² / (2 × Flecha)
      const arrowMeters = val / 1000; // converter mm para metros
      const radius = (semiChord * semiChord) / (2 * arrowMeters);

      const calcResult = {
        themeName: theme.title,
        calculationType: 'Cálculo de Raio',
        inputs: {
          'Corda': `${c} m`,
          'Flecha': `${val} mm`,
        },
        result: `Raio: ${radius.toFixed(2)} m`,
      };

      setResult({
        radius: radius.toFixed(2),
        semiChord: semiChord.toFixed(2),
      });
      onSave(calcResult);
    }
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Modo de Cálculo</Text>
        <View style={styles.railTypeSelector}>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcMode === 'radius' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcMode('radius')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcMode === 'radius' && styles.railTypeTextActive,
              ]}
            >
              Calcular Flecha
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcMode === 'arrow' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcMode('arrow')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcMode === 'arrow' && styles.railTypeTextActive,
              ]}
            >
              Calcular Raio
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.calcLabel}>Corda (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={chord}
          onChangeText={setChord}
          placeholder="Ex: 20"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>
          {calcMode === 'radius' ? 'Raio (m)' : 'Flecha (mm)'}
        </Text>
        <TextInput
          style={styles.calcInput}
          value={input}
          onChangeText={setInput}
          placeholder={calcMode === 'radius' ? 'Ex: 500' : 'Ex: 100'}
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            <View style={styles.resultItem}>
              <Ionicons name="git-branch-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Semi-Corda</Text>
                <Text style={styles.resultValue}>{result.semiChord} m</Text>
              </View>
            </View>
            {calcMode === 'radius' ? (
              <>
                <View style={styles.resultItem}>
                  <Ionicons name="trending-down-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Flecha (F4)</Text>
                    <Text style={styles.resultValue}>{result.arrow} mm</Text>
                  </View>
                </View>
                <View style={styles.resultItem}>
                  <Ionicons name="list-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Flechas Intermédias</Text>
                    <Text style={styles.resultValue}>
                      F1:{result.flechas.F1} F2:{result.flechas.F2} F3:{result.flechas.F3}mm
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.resultItem}>
                <Ionicons name="radio-button-on-outline" size={20} color="#64B5F6" />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultLabel}>Raio da Curva</Text>
                  <Text style={styles.resultValue}>{result.radius} m</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE SUPERELEVAÇÃO (ESCALAS)
function SuperelevationCalculator({ theme, onSave }) {
  const [speed, setSpeed] = useState('');
  const [radius, setRadius] = useState('');
  const [scaleType, setScaleType] = useState('theoretical');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const v = parseFloat(speed);
    const r = parseFloat(radius);

    if (!v || !r || v <= 0 || r <= 0) {
      Alert.alert('Erro', 'Introduza valores válidos');
      return;
    }

    // Fórmulas do Excel:
    // Escala teórica = (V² / R) × 13.7
    // Escala prática = (V² × 7) / R
    const theoreticalScale = ((v * v) / r) * 13.7;
    const practicalScale = ((v * v) * 7) / r;
    const insufficiency = theoreticalScale - practicalScale;

    const calcResult = {
      themeName: theme.title,
      calculationType: 'Superelevação',
      inputs: {
        'Velocidade': `${v} km/h`,
        'Raio': `${r} m`,
      },
      result: `Teórica: ${theoreticalScale.toFixed(1)}mm, Prática: ${practicalScale.toFixed(1)}mm, Insuf: ${insufficiency.toFixed(1)}mm`,
    };

    setResult({
      theoretical: theoreticalScale.toFixed(1),
      practical: practicalScale.toFixed(1),
      insufficiency: insufficiency.toFixed(1),
      excess: (-insufficiency).toFixed(1),
    });
    onSave(calcResult);
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Velocidade (km/h)</Text>
        <TextInput
          style={styles.calcInput}
          value={speed}
          onChangeText={setSpeed}
          placeholder="Ex: 80"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <Text style={styles.calcLabel}>Raio da Curva (m)</Text>
        <TextInput
          style={styles.calcInput}
          value={radius}
          onChangeText={setRadius}
          placeholder="Ex: 297"
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            Superelevação (escala): elevação do carril exterior em curvas para compensar força centrífuga
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
              <Ionicons name="trending-up-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Escala Teórica</Text>
                <Text style={styles.resultValue}>{result.theoretical} mm</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="speedometer-outline" size={20} color="#64B5F6" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Escala Prática</Text>
                <Text style={styles.resultValue}>{result.practical} mm</Text>
              </View>
            </View>
            <View style={styles.resultItem}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF6B6B" />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultLabel}>Insuficiência de Escala</Text>
                <Text style={styles.resultValue}>{result.insufficiency} mm</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// CALCULADORA DE PASSAGENS DE NÍVEL
function LevelCrossingCalculator({ theme, onSave }) {
  const [calcMode, setCalcMode] = useState('visibility'); // 'visibility' ou 'speed'
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const val = parseFloat(input);

    if (!val || val <= 0) {
      Alert.alert('Erro', 'Introduza um valor válido');
      return;
    }

    if (calcMode === 'visibility') {
      // Dado a velocidade, calcular visibilidade
      // Fórmula: Visibilidade = 3.5 × Velocidade
      const visibility = 3.5 * val;

      const calcResult = {
        themeName: theme.title,
        calculationType: 'Distância de Visibilidade PN',
        inputs: {
          'Velocidade TVM': `${val} km/h`,
        },
        result: `Visibilidade mínima: ${visibility.toFixed(0)} m`,
      };

      setResult({
        visibility: visibility.toFixed(0),
        speed: val,
      });
      onSave(calcResult);
    } else {
      // Dada a visibilidade, calcular velocidade máxima
      // Fórmula: Velocidade = Visibilidade / 3.5
      const speed = val / 3.5;

      const calcResult = {
        themeName: theme.title,
        calculationType: 'Velocidade Máxima PN',
        inputs: {
          'Visibilidade': `${val} m`,
        },
        result: `Velocidade máxima: ${speed.toFixed(0)} km/h`,
      };

      setResult({
        speed: speed.toFixed(0),
        visibility: val,
      });
      onSave(calcResult);
    }
  };

  return (
    <ScrollView style={styles.calculatorContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.calculatorCard}>
        <Text style={styles.calcLabel}>Modo de Cálculo</Text>
        <View style={styles.railTypeSelector}>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcMode === 'visibility' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcMode('visibility')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcMode === 'visibility' && styles.railTypeTextActive,
              ]}
            >
              Calcular Visibilidade
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.railTypeButton,
              calcMode === 'speed' && styles.railTypeButtonActive,
            ]}
            onPress={() => setCalcMode('speed')}
          >
            <Text
              style={[
                styles.railTypeText,
                calcMode === 'speed' && styles.railTypeTextActive,
              ]}
            >
              Calcular Velocidade
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.calcLabel}>
          {calcMode === 'visibility' ? 'Velocidade TVM (km/h)' : 'Visibilidade Disponível (m)'}
        </Text>
        <TextInput
          style={styles.calcInput}
          value={input}
          onChangeText={setInput}
          placeholder={calcMode === 'visibility' ? 'Ex: 80' : 'Ex: 280'}
          placeholderTextColor="#546E7A"
          keyboardType="numeric"
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={16} color="#64B5F6" />
          <Text style={styles.infoBoxText}>
            TEM QUE SER 3.5 vezes a velocidade do comboio (requisito de segurança)
          </Text>
        </View>

        <TouchableOpacity style={[styles.calculateBtn, { backgroundColor: theme.color }]} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFFFFF" />
          <Text style={styles.calculateBtnText}>Calcular</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultados</Text>
            {calcMode === 'visibility' ? (
              <>
                <View style={styles.resultItem}>
                  <Ionicons name="speedometer-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Velocidade do Comboio</Text>
                    <Text style={styles.resultValue}>{result.speed} km/h</Text>
                  </View>
                </View>
                <View style={styles.resultItem}>
                  <Ionicons name="eye-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Distância de Visibilidade Mínima</Text>
                    <Text style={styles.resultValue}>{result.visibility} m</Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.resultItem}>
                  <Ionicons name="eye-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Visibilidade Disponível</Text>
                    <Text style={styles.resultValue}>{result.visibility} m</Text>
                  </View>
                </View>
                <View style={styles.resultItem}>
                  <Ionicons name="speedometer-outline" size={20} color="#64B5F6" />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultLabel}>Velocidade Máxima Permitida</Text>
                    <Text style={styles.resultValue}>{result.speed} km/h</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#90CAF9',
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    alignItems: 'center',
  },
  themeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 12,
    color: '#90CAF9',
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#B0BEC5',
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  calculatorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calculatorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calculatorContent: {
    flex: 1,
    backgroundColor: '#121212',
  },
  calculatorCard: {
    margin: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  calcLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#90CAF9',
    marginBottom: 8,
    marginTop: 12,
  },
  calcInput: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  railTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  railTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  railTypeButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#64B5F6',
  },
  railTypeText: {
    color: '#B0BEC5',
    fontSize: 15,
    fontWeight: 'bold',
  },
  railTypeTextActive: {
    color: '#FFFFFF',
  },
  railTypeWeight: {
    color: '#546E7A',
    fontSize: 11,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#90CAF9',
  },
  calculateBtn: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  calculateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64B5F6',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3C3C3C',
    gap: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 13,
    color: '#B0BEC5',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  historyModal: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  clearButton: {
    padding: 4,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyItemTheme: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64B5F6',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#546E7A',
  },
  historyItemCalc: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  historyItemValues: {
    backgroundColor: '#1E1E1E',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  historyItemValue: {
    fontSize: 13,
    color: '#B0BEC5',
    marginBottom: 4,
  },
  historyItemResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3C3C3C',
  },
  historyItemResultText: {
    fontSize: 14,
    color: '#90CAF9',
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#546E7A',
    marginTop: 16,
  },
  // Estilos para anexos de imagens
  imageAttachmentSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#64B5F6',
    marginRight: 8,
    maxWidth: 120,
    minHeight: 36,
    paddingHorizontal: 12,
  },
  imageButtonText: {
    fontSize: 14,
    color: '#64B5F6',
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: 84,
  },

  imageAttachmentScroll: {
    maxHeight: 56,
  },
  techImagesRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  techButton: {
    backgroundColor: '#1E1E1E',
    borderColor: '#64B5F6',
  },
  imageConfirmSection: {
    backgroundColor: '#1E1E1E',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  imagePreviewContainer: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  imagePreviewWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#121212',
    borderRadius: 12,
  },
  historyImagesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3C3C3C',
  },
  historyImagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  historyImagesLabel: {
    fontSize: 12,
    color: '#64B5F6',
    fontWeight: '600',
  },
  historyImagesScroll: {
    marginTop: 4,
  },
  historyImageThumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#2C2C2C',
  },
  confirmImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  confirmImageButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  imageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  imageIndicatorText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Estilos para conversor MLC
  conversionModeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  conversionModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    alignItems: 'center',
  },
  conversionModeButtonActive: {
    backgroundColor: '#845EC2',
    borderColor: '#845EC2',
  },
  conversionModeText: {
    fontSize: 13,
    color: '#B0BEC5',
    fontWeight: '600',
  },
  conversionModeTextActive: {
    color: '#FFFFFF',
  },
  // Estilos para seletor de comprimento de barra
  barLengthSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  barLengthButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#2C2C2C',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    alignItems: 'center',
  },
  barLengthButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  barLengthText: {
    fontSize: 12,
    color: '#B0BEC5',
    fontWeight: '600',
  },
  barLengthTextActive: {
    color: '#FFFFFF',
  },
  // Estilos adicionais
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64B5F6',
    marginBottom: 16,
  },
  resultSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#90CAF9',
    marginTop: 12,
    marginBottom: 8,
  },
});

