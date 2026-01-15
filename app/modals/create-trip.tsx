import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Trip } from '@/types';

export default function CreateTripModal() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [tripData, setTripData] = useState<Partial<Trip>>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    destination: {
      city: '',
      country: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    isPublic: true,
    tags: []
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDestinationChange = (field: string, value: string) => {
    setTripData(prev => ({
      ...prev,
      destination: {
        ...prev.destination!,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tripData.tags?.includes(tagInput.trim())) {
      setTripData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTripData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleCreateTrip = () => {
    // Make sure user filled out the required fields
    if (!tripData.title?.trim()) {
      Alert.alert('Missing Information', 'Please enter a trip title');
      return;
    }
    if (!tripData.destination?.city?.trim() || !tripData.destination?.country?.trim()) {
      Alert.alert('Missing Information', 'Please enter destination city and country');
      return;
    }

    // TODO: Hook this up to Supabase to actually save the trip
    // For now just show success and go back
    Alert.alert(
      'Trip Created!',
      `Your trip "${tripData.title}" has been created successfully.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where are you going?</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Trip Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Summer Vacation 2025"
          value={tripData.title}
          onChangeText={(text) => handleInputChange('title', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Destination</Text>
        <View style={styles.row}>
          <View style={[styles.input, { flex: 1, marginRight: 8 }]}>
            <TextInput
              placeholder="City"
              value={tripData.destination?.city}
              onChangeText={(text) => handleDestinationChange('city', text)}
              style={{ padding: 0 }}
            />
          </View>
          <View style={[styles.input, { flex: 1 }]}>
            <TextInput
              placeholder="Country"
              value={tripData.destination?.country}
              onChangeText={(text) => handleDestinationChange('country', text)}
              style={{ padding: 0 }}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Dates</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.dateInput, { flex: 1, marginRight: 8 }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {tripData.startDate?.toLocaleDateString()}
            </Text>
            {showStartDatePicker && (
              <DateTimePicker
                value={tripData.startDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    handleInputChange('startDate', selectedDate);
                  }
                }}
              />
            )}
          </TouchableOpacity>
          
          <Text style={styles.dateDivider}>to</Text>
          
          <TouchableOpacity 
            style={[styles.dateInput, { flex: 1 }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {tripData.endDate?.toLocaleDateString()}
            </Text>
            {showEndDatePicker && (
              <DateTimePicker
                value={tripData.endDate || new Date()}
                mode="date"
                display="default"
                minimumDate={tripData.startDate}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    handleInputChange('endDate', selectedDate);
                  }
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Tell us about your trip..."
          multiline
          numberOfLines={4}
          value={tripData.description}
          onChangeText={(text) => handleInputChange('description', text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tags (optional)</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            placeholder="e.g., beach, adventure, family"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagsContainer}>
          {tripData.tags?.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.privacyContainer}>
        <Text style={styles.label}>Privacy</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, tripData.isPublic && styles.radioButtonActive]}
            onPress={() => handleInputChange('isPublic', true)}
          >
            <View style={[styles.radioOuter, tripData.isPublic && styles.radioOuterActive]}>
              {tripData.isPublic && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Public</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.radioButton, !tripData.isPublic && styles.radioButtonActive]}
            onPress={() => handleInputChange('isPublic', false)}
          >
            <View style={[styles.radioOuter, !tripData.isPublic && styles.radioOuterActive]}>
              {!tripData.isPublic && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Private</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add activities</Text>
      <Text style={styles.stepSubtitle}>
        Start planning your trip by adding activities, accommodations, and more.
      </Text>
      
      <View style={styles.emptyState}>
        <Ionicons name="map" size={64} color="#ddd" />
        <Text style={styles.emptyStateText}>No activities added yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Tap the + button below to add activities to your trip
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Invite friends</Text>
      <Text style={styles.stepSubtitle}>
        Invite friends to collaborate on this trip plan.
      </Text>
      
      <View style={styles.emptyState}>
        <Ionicons name="people" size={64} color="#ddd" />
        <Text style={styles.emptyStateText}>No collaborators yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Start typing to search for friends to invite
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => activeStep > 1 ? setActiveStep(activeStep - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.stepIndicatorContainer}>
          {[1, 2, 3].map((step) => (
            <View 
              key={step} 
              style={[
                styles.stepIndicator, 
                step === activeStep && styles.stepIndicatorActive,
                step < activeStep && styles.stepIndicatorCompleted
              ]} 
            />
          ))}
        </View>
        
        <TouchableOpacity 
          onPress={activeStep < 3 ? () => setActiveStep(activeStep + 1) : handleCreateTrip}
          disabled={!tripData.title || !tripData.destination?.city || !tripData.destination?.country}
        >
          <Text 
            style={[
              styles.nextButton, 
              (!tripData.title || !tripData.destination?.city || !tripData.destination?.country) && 
              styles.nextButtonDisabled
            ]}
          >
            {activeStep < 3 ? 'Next' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeStep === 1 && renderStep1()}
        {activeStep === 2 && renderStep2()}
        {activeStep === 3 && renderStep3()}
      </ScrollView>

      {activeStep === 2 && (
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  stepIndicatorActive: {
    width: 16,
    backgroundColor: '#0fa3a3',
  },
  stepIndicatorCompleted: {
    backgroundColor: '#0fa3a3',
  },
  nextButton: {
    color: '#0fa3a3',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateDivider: {
    marginHorizontal: 8,
    color: '#666',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0fa3a3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  privacyContainer: {
    marginTop: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButtonActive: {
    // Add styles for active state if needed
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioOuterActive: {
    borderColor: '#0fa3a3',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0fa3a3',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0fa3a3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
