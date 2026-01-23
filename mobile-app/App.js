import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import axios from 'axios';

// URL de tu Nginx en AWS
const API_URL =
  'http://app-alb-896588448.us-east-1.elb.amazonaws.com/api/users';

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Intentamos obtener usuarios del microservicio
      const response = await axios.get(`${API_URL}/search`);
      const data = response.data.users || response.data.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
      </View>
      <View>
        <Text style={styles.userName}>{item.name || 'Usuario'}</Text>
        <Text style={styles.userCareer}>{item.career || 'Estudiante'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Request Mobile 📱</Text>
        <Text style={styles.subtitle}>Comunidad Universitaria</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={{ marginTop: 10, color: '#64748b' }}>
            Conectando con microservicios...
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No se encontraron usuarios activos</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
  subtitle: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  userCareer: { fontSize: 13, color: '#64748b', marginTop: 2 },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 50,
    fontWeight: '500',
  },
});
