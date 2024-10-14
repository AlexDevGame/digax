import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [people, setPeople] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null); // Para controlar o ID da pessoa sendo editada

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    try {
      const savedPeople = await AsyncStorage.getItem('people');
      if (savedPeople) {
        setPeople(JSON.parse(savedPeople));
      }
    } catch (error) {
      console.error("Erro ao carregar pessoas", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const savePerson = async () => {
    if (!name || !address || !city || !state || !phone || !photo) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma foto.');
      return;
    }

    let updatedPeople;
    if (editingId !== null) {
      updatedPeople = people.map(person =>
        person.id === editingId
          ? { id: editingId, photo, name, address, city, state, phone }
          : person
      );
      setEditingId(null); 
    } else {

      const newPerson = { id: Date.now(), photo, name, address, city, state, phone };
      updatedPeople = [...people, newPerson];
    }

    setPeople(updatedPeople);
    await AsyncStorage.setItem('people', JSON.stringify(updatedPeople));
    clearFields();
  };

  const clearFields = () => {
    setPhoto(null);
    setName('');
    setAddress('');
    setCity('');
    setState('');
    setPhone('');
    setEditingId(null); 
  };

  const deletePerson = async (id: number) => {
    const updatedPeople = people.filter(person => person.id !== id);
    setPeople(updatedPeople);
    await AsyncStorage.setItem('people', JSON.stringify(updatedPeople));
  };

  const editPerson = (person: any) => {
    setEditingId(person.id);
    setPhoto(person.photo);
    setName(person.name);
    setAddress(person.address);
    setCity(person.city);
    setState(person.state);
    setPhone(person.phone);
  };

  return (
    <ScrollView>
      <View style={styles.form}>
        <Button title="Escolher imagem" onPress={pickImage} />
        {photo && <Image source={{ uri: photo }} style={styles.image} />}

        <Text style={styles.label}>Nome:</Text>
        <TextInput
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <Text style={styles.label}>Endereço:</Text>
        <TextInput
          placeholder="Digite seu endereço"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        
        <Text style={styles.label}>Cidade:</Text>
        <TextInput
          placeholder="Digite sua cidade"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        
        <Text style={styles.label}>Estado:</Text>
        <TextInput
          placeholder="Digite seu estado"
          value={state}
          onChangeText={setState}
          style={styles.input}
        />
        
        <Text style={styles.label}>Telefone:</Text>
        <TextInput
          placeholder="Digite seu telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Button title={editingId !== null ? "Atualizar" : "Salvar"} onPress={savePerson} />

        <Text style={styles.title}>Pessoas cadastradas:</Text>
        {people.length > 0 ? (
          people.map((person) => (
            <View key={person.id} style={styles.person}>
              {person.photo && <Image source={{ uri: person.photo }} style={styles.listImage} />}
              <View style={styles.personInfo}>
                <Text style={styles.personText}>{person.name}</Text>
                <Text style={styles.personText}>{person.phone}</Text>
              </View>
              <Button title="Editar" onPress={() => editPerson(person)} />
              <Button title="Excluir" onPress={() => deletePerson(person.id)} />
            </View>
          ))
        ) : (
          <Text>Nenhuma pessoa cadastrada</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 20,
    marginVertical: 10,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  personInfo: {
    flex: 1,
    marginLeft: 10,
  },
  personText: {
    fontSize: 16,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});