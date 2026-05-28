import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { tabBar } from '../components/theme';

// ── Écrans temporaires ────────────────────────
const TempScreen = ({ nom }) => () => (
  <View style={{ flex:1, backgroundColor:'#0F0A1E', justifyContent:'center', alignItems:'center' }}>
    <Text style={{ color:'#A78BFA', fontSize:18, fontWeight:'700' }}>{nom}</Text>
    <Text style={{ color:'#6B7280', fontSize:13, marginTop:8 }}>En cours de développement</Text>
  </View>
);

// ── Écrans temporaires par rôle ───────────────
const AdminTemp      = TempScreen({ nom: 'Dashboard Admin' });
const EnseignantTemp = TempScreen({ nom: 'Dashboard Enseignant' });
const EtudiantTemp   = TempScreen({ nom: 'Dashboard Étudiant' });
const SplashTemp     = TempScreen({ nom: 'Splash Screen' });
const AccueilTemp    = TempScreen({ nom: 'Écran d\'accueil' });
const ConnexionTemp  = TempScreen({ nom: 'Connexion' });

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const AdminTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Dashboard"    component={AdminTemp} options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Utilisateurs" component={AdminTemp} options={{ tabBarLabel: 'Utilisateurs' }} />
    <Tab.Screen name="Validations"  component={AdminTemp} options={{ tabBarLabel: 'Validations' }} />
    <Tab.Screen name="Categories"   component={AdminTemp} options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Profil"       component={AdminTemp} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

const EnseignantTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Accueil"     component={EnseignantTemp} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Ressources"  component={EnseignantTemp} options={{ tabBarLabel: 'Ressources' }} />
    <Tab.Screen name="Moderation"  component={EnseignantTemp} options={{ tabBarLabel: 'Modération' }} />
    <Tab.Screen name="Notifs"      component={EnseignantTemp} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"      component={EnseignantTemp} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

const EtudiantTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown: false,
    tabBarStyle: { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Accueil"    component={EtudiantTemp} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Categories" component={EtudiantTemp} options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Creer"      component={EtudiantTemp} options={{ tabBarLabel: 'Créer' }} />
    <Tab.Screen name="Notifs"     component={EtudiantTemp} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={EtudiantTemp} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#0F0A1E' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash"   component={SplashTemp} />
            <Stack.Screen name="Accueil"  component={AccueilTemp} />
            <Stack.Screen name="Connexion" component={ConnexionTemp} />
          </>
        ) : (
          <>
            {user?.role === 'admin'      && <Stack.Screen name="AdminTabs"      component={AdminTabs} />}
            {user?.role === 'enseignant' && <Stack.Screen name="EnseignantTabs" component={EnseignantTabs} />}
            {user?.role === 'etudiant'   && <Stack.Screen name="EtudiantTabs"   component={EtudiantTabs} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;