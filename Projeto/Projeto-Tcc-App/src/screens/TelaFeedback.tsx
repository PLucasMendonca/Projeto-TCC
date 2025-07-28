import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../styles/cores';
import { submitFeedback } from '../services/feedback';

interface TelaFeedbackProps {
  navigation: any;
}

export default function TelaFeedback({ navigation }: TelaFeedbackProps) {
  const [appRating, setAppRating] = useState(0);
  const [compatibilityRating, setCompatibilityRating] = useState(0);
  const [metExpectations, setMetExpectations] = useState<boolean | null>(null);
  const [technicalIssues, setTechnicalIssues] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);

  const renderStars = (rating: number, setRating: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={cores.primaria}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (appRating === 0 || compatibilityRating === 0 || metExpectations === null) {
      Alert.alert('Atenção', 'Por favor, preencha todas as avaliações obrigatórias.');
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        appRating,
        compatibilityRating,
        metExpectations,
        technicalIssues: technicalIssues.trim(),
        suggestions: suggestions.trim(),
      });

      Alert.alert(
        'Sucesso!',
        'Obrigado pelo seu feedback! Sua opinião é muito importante para nós.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar seu feedback. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={cores.secundaria} />
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/android/res/mipmap-xxxhdpi/ic_launcher.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Queremos seu FeedBack !!</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avaliação Geral */}
        <View style={styles.section}>
          <Text style={styles.question}>
            Qual seu nível de satisfação com a precisão das recomendações de compatibilidade?
          </Text>
          {renderStars(appRating, setAppRating)}
        </View>

        {/* Expectativas */}
        <View style={styles.section}>
          <Text style={styles.question}>
            O sistema de análise de requisitos foi eficiente em identificar corretamente as especificações do seu dispositivo?
          </Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                metExpectations === true && styles.radioButtonSelected
              ]}
              onPress={() => setMetExpectations(true)}
            >
              <Text style={[
                styles.radioText,
                metExpectations === true && styles.radioTextSelected
              ]}>Sim</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.radioButton,
                metExpectations === false && styles.radioButtonSelected
              ]}
              onPress={() => setMetExpectations(false)}
            >
              <Text style={[
                styles.radioText,
                metExpectations === false && styles.radioTextSelected
              ]}>Não</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Velocidade */}
        <View style={styles.section}>
          <Text style={styles.question}>
            Como você avalia a interface e a facilidade de uso do aplicativo para verificar compatibilidade?
          </Text>
          {renderStars(compatibilityRating, setCompatibilityRating)}
        </View>

        {/* Problemas Técnicos */}
        <View style={styles.section}>
          <Text style={styles.question}>
            Quais aspectos do sistema de verificação de compatibilidade poderiam ser melhorados?
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={technicalIssues}
            onChangeText={setTechnicalIssues}
            placeholder="Ex: precisão da análise, informações adicionais necessárias, etc..."
            placeholderTextColor={cores.destaque}
          />
        </View>

        {/* Sugestões */}
        <View style={styles.section}>
          <Text style={styles.question}>
            Que funcionalidades adicionais você gostaria de ver em futuras versões do sistema?
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={suggestions}
            onChangeText={setSuggestions}
            placeholder="Ex: comparação entre jogos, análise de desempenho esperado, etc..."
            placeholderTextColor={cores.destaque}
          />
        </View>

        {/* Botão Enviar */}
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={cores.primaria} />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Feedback</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.primaria,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 50,
    paddingBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: cores.secundaria,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.secundaria,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
    backgroundColor: cores.secundaria,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  question: {
    fontSize: 16,
    color: cores.primaria,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: cores.primaria,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  radioButtonSelected: {
    backgroundColor: cores.secundaria,
  },
  radioText: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: '500',
  },
  radioTextSelected: {
    color: cores.primaria,
  },
  textInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 12,
    color: cores.primaria,
    borderWidth: 1,
    borderColor: cores.primaria,
    textAlignVertical: 'top',
    minHeight: 100,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: cores.secundaria,
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    color: cores.primaria,
    fontSize: 16,
    fontWeight: 'bold',
  },

});
