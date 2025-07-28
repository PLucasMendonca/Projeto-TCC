import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { cores } from '../styles/cores';
import { Ionicons } from '@expo/vector-icons';

interface ConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectOption: (option: 'perfil' | 'historico' | 'feedback') => void;
}

export default function ConfigModal({ visible, onClose, onSelectOption }: ConfigModalProps) {
  const options = [
    {
      id: 'perfil',
      title: 'Perfil',
      icon: 'person-outline',
    },
    {
      id: 'historico',
      title: 'Histórico',
      icon: 'book-outline',
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: 'star-outline',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.option}
              onPress={() => {
                onSelectOption(option.id as 'perfil' | 'historico' | 'feedback');
                onClose();
              }}
            >
              <Ionicons
                name={option.icon as any}
                size={24}
                color={cores.secundaria}
                style={styles.icon}
              />
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContainer: {
    backgroundColor: cores.primaria,
    marginTop: Platform.OS === 'ios' ? 100 : 60,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    color: cores.secundaria,
    fontSize: 16,
    fontWeight: '500',
  },
});
