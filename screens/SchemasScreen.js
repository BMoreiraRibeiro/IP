import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageGalleryModal from '../components/ImageGalleryModal';
import imageManifest from '../assets/imageManifest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function SchemasScreen() {
  const [selectedCategory, setSelectedCategory] = useState('track');
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryBaseCount, setGalleryBaseCount] = useState(0);
  const [userImages, setUserImages] = useState([]);

  const CATEGORY_TO_MANIFESTS = {
    track: ['Balastro','VIAS','travessa_madeira_via','fixacoes_travessa_madeira_54'],
    catenary: ['forca_centrifuga','PGV'],
    components: ['fixacao_tbb_02','fixacao_tbb_03','fixacoes_travessa_madeira_54'],
    signaling: ['PNs'],
  };

  const openGalleryForCategory = (categoryId) => {
    const keys = CATEGORY_TO_MANIFESTS[categoryId] || [];
    const imgs = [];
    keys.forEach(k => {
      if (imageManifest[k]) imgs.push(...imageManifest[k]);
    });
    if (imgs.length === 0 && userImages.length === 0) {
      Alert.alert('Sem imagens', 'Não existem imagens técnicas para esta categoria.');
      return;
    }
    // include user images as well
    const all = [...imgs, ...userImages];
    setGalleryImages(all.length > 0 ? all : imgs);
    setGalleryBaseCount(imgs.length);
    setGalleryVisible(true);
  };

  // --- User images persistence ---
  const USER_IMAGES_KEY = '@schemas_user_images';

  const loadUserImages = async () => {
    try {
      const raw = await AsyncStorage.getItem(USER_IMAGES_KEY);
      if (raw) setUserImages(JSON.parse(raw));
    } catch (e) {
      console.warn('Erro a carregar imagens do utilizador', e);
    }
  };

  useEffect(() => {
    loadUserImages();
  }, []);

  const persistUserImages = async (arr) => {
    try {
      await AsyncStorage.setItem(USER_IMAGES_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('Erro ao guardar imagens do utilizador', e);
    }
  };

  const addUserImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para adicionar imagens');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets) {
      const uris = result.assets.map(a => ({ uri: a.uri }));
      const next = [...userImages, ...uris];
      setUserImages(next);
      await persistUserImages(next);
    }
  };

  const clearUserImage = (uri) => {
    Alert.alert('Remover imagem', 'Deseja remover esta imagem adicionada?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const next = userImages.filter(i => i.uri !== uri);
        setUserImages(next);
        await persistUserImages(next);
      } }
    ]);
  };

  const clearAllUserImages = () => {
    Alert.alert('Remover todas as imagens', 'Deseja remover todas as imagens adicionadas pelo utilizador?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover todas', style: 'destructive', onPress: async () => {
        setUserImages([]);
        await persistUserImages([]);
      } }
    ]);
  };

  const schemas = {
    track: [
      {
        id: '1',
        title: 'Via Balastrada',
        description: 'Estrutura tradicional com balastro',
        icon: 'git-branch-outline',
        details: 'Carril + Fixações + Travessas + Balastro + Sub-balastro + Plataforma. Permite ajustes e drenagem natural.',
      },
      {
        id: '2',
        title: 'Via em Laje',
        description: 'Plataforma de betão',
        icon: 'square-outline',
        details: 'Carril fixado diretamente em laje de betão. Maior durabilidade, menor manutenção, ideal para túneis e viadutos.',
      },
      {
        id: '3',
        title: 'Bitola Ibérica',
        description: '1668mm - Portugal e Espanha',
        icon: 'resize-outline',
        details: 'Distância entre faces internas dos carris: 1668mm. Bitola utilizada em Portugal e Espanha (exceto linha de alta velocidade).',
      },
      {
        id: '4',
        title: 'Bitola Europeia',
        description: '1435mm - Bitola UIC',
        icon: 'swap-horizontal-outline',
        details: 'Bitola padrão europeia (1435mm). Utilizada nas linhas de alta velocidade e maior parte da Europa.',
      },
    ],
    catenary: [
      {
        id: '5',
        title: 'Catenária Simples',
        description: 'Sistema de eletrificação básico',
        icon: 'flash-outline',
        details: 'Cabo sustentador + Pendurais + Cabo de contacto. Tensão típica: 25kV AC. Usado em linhas convencionais.',
      },
      {
        id: '6',
        title: 'Catenária Composta',
        description: 'Sistema para alta velocidade',
        icon: 'git-network-outline',
        details: 'Sistema mais complexo com cabo portador, pendurais e cabo de contacto. Permite velocidades >200 km/h.',
      },
      {
        id: '7',
        title: 'Cabo de Contacto Cu 107',
        description: 'Especificação técnica',
        icon: 'remove-outline',
        details: 'Cobre, secção 107mm². Peso: 1.07 kg/m. Resistência: 20kN. Tensão mecânica típica: 15-25 kN.',
      },
      {
        id: '8',
        title: 'Postes de Catenária',
        description: 'Suportes metálicos ou betão',
        icon: 'bar-chart-outline',
        details: 'Espaçamento típico: 60-80m em reta, 40-60m em curva. Altura: 5.5-6.5m acima do carril.',
      },
    ],
    components: [
      {
        id: '9',
        title: 'Fixação Pandrol',
        description: 'Sistema de fixação elástica',
        icon: 'link-outline',
        details: 'Grampo elástico que fixa o carril à travessa. Permite movimento controlado e absorve vibrações.',
      },
      {
        id: '10',
        title: 'Travessa Monobloco',
        description: 'Travessa de betão pré-esforçado',
        icon: 'remove-outline',
        details: 'Comprimento: 2.40-2.60m. Peso: 250-350kg. Vida útil: 50+ anos. Espaçamento: 0.6m típico.',
      },
      {
        id: '11',
        title: 'Junta de Dilatação',
        description: 'Permite expansão térmica',
        icon: 'analytics-outline',
        details: 'Folga de 6-10mm entre carris. Placas de união aparafusadas. Essencial em carris não soldados.',
      },
      {
        id: '12',
        title: 'Aparelho de Via (AMV)',
        description: 'Agulhas e cruzamentos',
        icon: 'git-merge-outline',
        details: 'Permite mudança de via. Componentes: agulhas, contra-carris, cruzamento, jabre. Raio mín: 190m (linha principal).',
      },
    ],
    signaling: [
      {
        id: '13',
        title: 'Sinal Luminoso',
        description: 'Sistema de sinalização',
        icon: 'radio-outline',
        details: 'Verde: Via livre. Amarelo: Atenção. Vermelho: Paragem. Distância de visibilidade mínima: 400m.',
      },
      {
        id: '14',
        title: 'Circuito de Via',
        description: 'Deteção de comboios',
        icon: 'pulse-outline',
        details: 'Sinal elétrico nos carris deteta presença do comboio. Falha segura: ausência de sinal = via ocupada.',
      },
      {
        id: '15',
        title: 'ERTMS/ETCS',
        description: 'Sistema europeu de controlo',
        icon: 'wifi-outline',
        details: 'Sistema de sinalização em cabina. Níveis 1, 2 e 3. Permite interoperabilidade europeia.',
      },
      {
        id: '16',
        title: 'ATP/ATO',
        description: 'Proteção e automação',
        icon: 'shield-checkmark-outline',
        details: 'ATP: Proteção automática de comboios. ATO: Operação automática. Sistema de segurança crítica.',
      },
    ],
  };

  const categories = [
    { id: 'track', name: 'Via Férrea', icon: 'train-outline' },
    { id: 'catenary', name: 'Catenária', icon: 'flash-outline' },
    { id: 'components', name: 'Componentes', icon: 'construct-outline' },
    { id: 'signaling', name: 'Sinalização', icon: 'radio-outline' },
  ];

  // Helper: determine which manifest keys match a schema card by checking
  // whether words from the manifest folder name appear in the schema text.
  const manifestKeys = Object.keys(imageManifest || {});

  const cleanText = (s = '') =>
    s
      .toString()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  const schemaMatchesAnyManifest = (schema) => {
    const text = cleanText(`${schema.title} ${schema.description} ${schema.details}`);
    for (const key of manifestKeys) {
      const cleanKey = cleanText(key).replace(/[^a-z0-9 ]+/g, ' ');
      const tokens = cleanKey.split(/\s+/).filter(Boolean);
      // require at least one token of length >= 3 to avoid matching short words
      for (const t of tokens) {
        if (t.length >= 3 && text.indexOf(t) !== -1) return true;
      }
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Esquemas</Text>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.addBtn} onPress={addUserImages}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Adicionar Imagens</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, styles.clearBtn]} onPress={clearAllUserImages}>
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Limpar imagens</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...Object.values(imageManifest).flat(), ...userImages]}
        keyExtractor={(_, idx) => String(idx)}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const isUser = item && item.uri;
          const source = isUser ? { uri: item.uri } : item;
          return (
            <TouchableOpacity
              style={styles.thumbWrap}
              onPress={() => {
                  const all = [...Object.values(imageManifest).flat(), ...userImages];
                  setGalleryImages(all);
                  setGalleryBaseCount(Object.values(imageManifest).flat().length);
                  setGalleryIndex(index);
                  setGalleryVisible(true);
              }}
              onLongPress={() => {
                if (isUser) clearUserImage(item.uri);
              }}
            >
              <Image source={source} style={styles.thumb} resizeMode="contain" />
              {isUser && (
                <TouchableOpacity style={styles.deleteOverlay} onPress={() => clearUserImage(item.uri)}>
                  <Ionicons name="trash" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {isUser && <Text style={styles.userBadge}>user</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <ImageGalleryModal
        visible={galleryVisible}
        images={galleryImages}
        initialIndex={galleryIndex}
        onClose={() => setGalleryVisible(false)}
        onDelete={(index) => {
          // index is in galleryImages. If index >= galleryBaseCount then corresponds to userImages
          if (index >= galleryBaseCount) {
            const userIndex = index - galleryBaseCount;
            const userImg = userImages[userIndex];
            if (userImg && userImg.uri) {
              // remove and persist
              const next = userImages.filter((_, i) => i !== userIndex);
              setUserImages(next);
              persistUserImages(next);
              // update galleryImages
              const nextGallery = [...galleryImages];
              nextGallery.splice(index, 1);
              setGalleryImages(nextGallery);
              // adjust index if needed
              if (nextGallery.length === 0) {
                setGalleryVisible(false);
              } else {
                setGalleryIndex(Math.max(0, index - 1));
              }
            }
          } else {
            Alert.alert('Não é possível apagar', 'Esta imagem é parte das imagens do app e não pode ser apagada.');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
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
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 72,
    borderRadius: 8,
    backgroundColor: '#2C2C2C',
  },
  categoryButtonActive: {
    backgroundColor: '#1976D2',
  },
  categoryText: {
    fontSize: 12,
    color: '#90CAF9',
    fontWeight: '600',
    flexShrink: 1,
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  controlsRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  clearBtn: {
    backgroundColor: '#D32F2F',
    marginLeft: 12,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 28,
  },
  thumbWrap: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  userBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
  },
  deleteOverlay: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 16,
  },
  schemaCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  schemaHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  schemaInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  schemaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  schemaDescription: {
    fontSize: 14,
    color: '#90CAF9',
  },
  schemaDetails: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 14,
    color: '#B0BEC5',
    lineHeight: 20,
  },
  colorStrip: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  colorBox: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#121212',
  },
  colorNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diagramContainer: {
    marginTop: 8,
  },
  openImagesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#122233',
    borderRadius: 8,
    marginBottom: 8,
  },
  openImagesText: {
    color: '#90CAF9',
    fontWeight: '600',
  },
  diagramPlaceholder: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  diagramText: {
    fontSize: 14,
    color: '#546E7A',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#546E7A',
  },
});
