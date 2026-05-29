import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { tabBar } from '../components/theme';

// ── Auth ──────────────────────────────────────
import SplashScreen                from '../screens/auth/SplashScreen';
import AccueilScreen               from '../screens/auth/AccueilScreen';
import ChoixRoleScreen             from '../screens/auth/ChoixRoleScreen';
import InscriptionEtudiantScreen   from '../screens/auth/InscriptionEtudiantScreen';
import InscriptionEnseignantScreen from '../screens/auth/InscriptionEnseignantScreen';
import VerificationEmailScreen     from '../screens/auth/VerificationEmailScreen';
import ConnexionScreen             from '../screens/auth/ConnexionScreen';

// ── Admin ─────────────────────────────────────
/*import DashboardScreen    from '../screens/admin/DashboardScreen';
import UtilisateursScreen from '../screens/admin/UtilisateursScreen';
import ValidationsScreen  from '../screens/admin/ValidationsScreen';
import CategoriesScreen   from '../screens/admin/CategoriesScreen';
import ProfilAdminScreen  from '../screens/admin/ProfilAdminScreen';*/

// ── Écrans temporaires ────────────────────────
const TempScreen = () => (
  <View style={{ flex:1, backgroundColor:'#0F0A1E', justifyContent:'center', alignItems:'center' }}>
    <ActivityIndicator color="#A78BFA" />
  </View>
);

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ── Navigation Admin ──────────────────────────
const AdminTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown:             false,
    tabBarStyle:             { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Dashboard"    component={DashboardScreen}    options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Utilisateurs" component={UtilisateursScreen} options={{ tabBarLabel: 'Utilisateurs' }} />
    <Tab.Screen name="Validations"  component={ValidationsScreen}  options={{ tabBarLabel: 'Validations' }} />
    <Tab.Screen name="Categories"   component={CategoriesScreen}   options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Profil"       component={ProfilAdminScreen}  options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// ── Navigation Enseignant ─────────────────────
const EnseignantTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown:             false,
    tabBarStyle:             { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Accueil"    component={TempScreen} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Ressources" component={TempScreen} options={{ tabBarLabel: 'Ressources' }} />
    <Tab.Screen name="Moderation" component={TempScreen} options={{ tabBarLabel: 'Modération' }} />
    <Tab.Screen name="Notifs"     component={TempScreen} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={TempScreen} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// ── Navigation Étudiant ───────────────────────
const EtudiantTabs = () => (
  <Tab.Navigator screenOptions={{
    headerShown:             false,
    tabBarStyle:             { backgroundColor: tabBar.background, borderTopColor: tabBar.borderTop },
    tabBarActiveTintColor:   tabBar.activeTint,
    tabBarInactiveTintColor: tabBar.inactiveTint,
  }}>
    <Tab.Screen name="Accueil"    component={TempScreen} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Categories" component={TempScreen} options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Creer"      component={TempScreen} options={{ tabBarLabel: 'Créer' }} />
    <Tab.Screen name="Notifs"     component={TempScreen} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={TempScreen} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// ── Navigateur principal ──────────────────────
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
            <Stack.Screen name="Splash"                  component={SplashScreen} />
            <Stack.Screen name="Accueil"                 component={AccueilScreen} />
            <Stack.Screen name="ChoixRole"               component={ChoixRoleScreen} />
            <Stack.Screen name="InscriptionEtudiant"     component={InscriptionEtudiantScreen} />
            <Stack.Screen name="InscriptionEnseignant"   component={InscriptionEnseignantScreen} />
            <Stack.Screen name="VerificationEmail"       component={VerificationEmailScreen} />
            <Stack.Screen name="Connexion"               component={ConnexionScreen} />
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