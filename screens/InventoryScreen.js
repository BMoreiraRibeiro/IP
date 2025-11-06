import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const scrollViewRef = useRef(null);
  const [items, setItems] = useState([
    { id: '1', name: 'Carril UIC 60', quantity: 120, location: 'Armazém A', unit: 'unid' },
    { id: '2', name: 'Travessas de Betão', quantity: 800, location: 'Armazém A', unit: 'unid' },
    { id: '3', name: 'Balastro Granítico', quantity: 500, location: 'Armazém B', unit: 'ton' },
    { id: '4', name: 'Fixações Pandrol', quantity: 2400, location: 'Armazém A', unit: 'unid' },
    { id: '5', name: 'Cabo Catenária Cu 107mm²', quantity: 1500, location: 'Armazém C', unit: 'm' },
    { id: '6', name: 'Isoladores Cerâmicos', quantity: 350, location: 'Armazém C', unit: 'unid' },
    { id: '7', name: 'Parafusos M24', quantity: 5000, location: 'Armazém B', unit: 'unid' },
    { id: '8', name: 'Geotêxtil', quantity: 2000, location: 'Armazém B', unit: 'm²' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    location: '',
    unit: 'ton',
  });

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        location: item.location,
        unit: item.unit,
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', quantity: '', location: '', unit: 'ton' });
    }
    setModalVisible(true);
  };

  const saveItem = () => {
    if (!formData.name || !formData.quantity || !formData.location) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (editingItem) {
      setItems(items.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, quantity: parseInt(formData.quantity) }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        name: formData.name,
        quantity: parseInt(formData.quantity),
        location: formData.location,
        unit: formData.unit,
      };
      setItems([...items, newItem]);
    }
    setModalVisible(false);
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Confirmar',
      'Deseja eliminar este item?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setItems(items.filter(item => item.id !== id)) },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconButton}>
            <Ionicons name="create-outline" size={22} color="#64B5F6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={22} color="#EF5350" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#90CAF9" />
          <Text style={styles.detailText}>
            {item.quantity} {item.unit}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#90CAF9" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventário</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Ionicons name="add-circle" size={28} color="#64B5F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#B0BEC5" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.formContainer}
              contentContainerStyle={styles.formContentContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Nome do item"
                  placeholderTextColor="#546E7A"
                />

              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.input}
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                placeholder="Quantidade"
                placeholderTextColor="#546E7A"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Unidade</Text>
              <View style={styles.unitSelector}>
                {['unid', 'm', 'ton', 'm²'].map(unit => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.unitButton,
                      formData.unit === unit && styles.unitButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, unit })}
                  >
                    <Text style={[
                      styles.unitButtonText,
                      formData.unit === unit && styles.unitButtonTextActive
                    ]}>
                      {unit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Localização</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Localização"
                placeholderTextColor="#546E7A"
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
                <Text style={styles.saveButtonText}>
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#B0BEC5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formContentContainer: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#90CAF9',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  unitSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  unitButton: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  unitButtonActive: {
    backgroundColor: '#1976D2',
    borderColor: '#64B5F6',
  },
  unitButtonText: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
