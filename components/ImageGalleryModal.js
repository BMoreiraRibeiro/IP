import React, { useMemo, useRef, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Alert, Dimensions, FlatList, Image } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { Ionicons } from '@expo/vector-icons';

export default function ImageGalleryModal({ visible, images = [], onClose, initialIndex = 0, onDelete }) {

  const currentIndexRef = useRef(initialIndex || 0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [currentScale, setCurrentScale] = useState(1);
  const [zoomIndex, setZoomIndex] = useState(null);
  const { width, height } = Dimensions.get('window');

  const handleDeletePress = () => {
    if (typeof onDelete === 'function') {
      Alert.alert('Apagar imagem', 'Deseja apagar esta imagem?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => onDelete(currentIndexRef.current) },
      ]);
    } else {
      Alert.alert('Não é possível apagar', 'Esta imagem não pode ser apagada desta vista.');
    }
  };

  // render item for FlatList: wrap image in ImageZoom so we can control pan vs swipe
  const renderItem = ({ item, index }) => {
    // item can be a require(...) number, an object { uri }, or a string uri
    let source;
    if (typeof item === 'number') {
      source = item; // require(...) asset
    } else if (item && item.uri) {
      source = { uri: item.uri };
    } else if (typeof item === 'string') {
      source = { uri: item };
    } else {
      // defensive fallback: try to stringify
      source = { uri: String(item) };
    }
    // If this item is in explicit zoom mode render ImageZoom
    if (zoomIndex === index) {
      return (
        <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
          <ImageZoom
            cropWidth={width}
            cropHeight={height}
            imageWidth={width}
            imageHeight={height}
            panToMove={true}
            pinchToZoom={true}
            onMove={(position) => {
              const scale = position && position.scale ? position.scale : 1;
              setCurrentScale(scale);
              setScrollEnabled(!(scale > 1));
            }}
          >
            <Image source={source} style={{ width: width, height: height, resizeMode: 'contain' }} />
          </ImageZoom>

          {/* close zoom button */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 12, right: 12, padding: 8, zIndex: 5 }}
            onPress={() => {
              setZoomIndex(null);
              setCurrentScale(1);
              setScrollEnabled(true);
            }}
          >
            <Ionicons name="close-circle" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    }

    // Default (not zoomed): render plain Image so FlatList can handle horizontal swipes
    return (
      <View style={{ width, height, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <Image source={source} style={{ width: width, height: height, resizeMode: 'contain' }} />

        {/* zoom entry button: expansion icon + 'Zoom' label */}
        <TouchableOpacity
          style={styles.zoomEntryButton}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
          onPress={() => {
            setZoomIndex(index);
            setScrollEnabled(false);
          }}
        >
          <Ionicons name="expand" size={35} color="#FFFFFF" />
          <Text style={styles.zoomEntryText}>Zoom</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDeletePress} style={styles.leftBtn}>
          <Ionicons name="trash" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{images.length} imagens</Text>

        <TouchableOpacity onPress={onClose} style={styles.rightBtn}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        scrollEnabled={scrollEnabled}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          currentIndexRef.current = newIndex;
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 2,
  },
  leftBtn: {
    padding: 8,
  },
  rightBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  zoomEntryButton: {
    position: 'absolute',
    top: '5%',
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  zoomEntryText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '700',
  },
});
