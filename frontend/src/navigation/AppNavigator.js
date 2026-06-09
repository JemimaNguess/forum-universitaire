import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { tabBar } from '../components/theme';
import { Ionicons } from '@expo/vector-icons';
// auth
import SplashScreen                from '../screens/auth/SplashScreen';
import AccueilScreen               from '../screens/auth/AccueilScreen';
import ChoixRoleScreen             from '../screens/auth/ChoixRoleScreen';
import InscriptionEtudiantScreen   from '../screens/auth/InscriptionEtudiantScreen';
import InscriptionEnseignantScreen from '../screens/auth/InscriptionEnseignantScreen';
import VerificationEmailScreen     from '../screens/auth/VerificationEmailScreen';
import ConnexionScreen             from '../screens/auth/ConnexionScreen';
// admin
import DashboardScreen    from '../screens/admin/DashboardScreen';
import UtilisateursScreen from '../screens/admin/UtilisateursScreen';
import ValidationsScreen  from '../screens/admin/ValidationsScreen';
import CategoriesScreen   from '../screens/admin/CategoriesScreen';
import ProfilAdminScreen  from '../screens/admin/ProfilAdminScreen';
import ImportScreen       from '../screens/admin/ImportScreen';
// enseignant
import AccueilEnseignantScreen from '../screens/enseignant/AccueilEnseignantScreen';
import RessourcesEnseignantScreen from '../screens/enseignant/RessourcesEnseignantScreen';
import ModerationEnseignantScreen from '../screens/enseignant/ModerationEnseignantScreen';
import AnnoncesEnseignantScreen from '../screens/enseignant/AnnoncesEnseignantScreen';
import ProfilEnseignantScreen from '../screens/enseignant/ProfilEnseignantScreen';

// ── Étudiant ──────────────────────────────────
import AccueilEtudiantScreen  from '../screens/etudiant/AccueilScreen';
import CategoriesEtudiantScreen from '../screens/etudiant/CategoriesScreen';
import SujetsScreen           from '../screens/etudiant/SujetsScreen';
import SujetDetailScreen      from '../screens/etudiant/SujetDetailScreen';
import CreerSujetScreen       from '../screens/etudiant/CreerSujetScreen';
import NotificationsEtudiantScreen from '../screens/etudiant/NotificationsScreen';
import ProfilEtudiantScreen   from '../screens/etudiant/ProfilScreen';

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
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: tabBar.background,
        borderTopColor:  tabBar.borderTop,
        height:          60,
        paddingBottom:   8,
      },
      tabBarActiveTintColor:   tabBar.activeTint,
      tabBarInactiveTintColor: tabBar.inactiveTint,
      tabBarIcon: ({ color, focused }) => {
        const icons = {
          Dashboard:    focused ? 'grid'             : 'grid-outline',
          Utilisateurs: focused ? 'people'           : 'people-outline',
          Validations:  focused ? 'checkmark-circle' : 'checkmark-circle-outline',
          Categories:   focused ? 'book'             : 'book-outline',
          Profil:       focused ? 'person'           : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard"    component={DashboardScreen}    options={{ tabBarLabel: 'Dashboard' }} />
    <Tab.Screen name="Utilisateurs" component={UtilisateursScreen} options={{ tabBarLabel: 'Utilisateurs' }} />
    <Tab.Screen name="Validations"  component={ValidationsScreen}  options={{ tabBarLabel: 'Validations' }} />
    <Tab.Screen name="Categories"   component={CategoriesScreen}   options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Profil"       component={ProfilAdminScreen}  options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// ── Navigation Enseignant ─────────────────────
const EnseignantTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: tabBar.background,
        borderTopColor:  tabBar.borderTop,
        height:          60,
        paddingBottom:   8,
      },
      tabBarActiveTintColor:   tabBar.activeTint,
      tabBarInactiveTintColor: tabBar.inactiveTint,
      tabBarIcon: ({ color, focused }) => {
        const icons = {
          Accueil:    focused ? 'home'          : 'home-outline',
          Ressources: focused ? 'library'       : 'library-outline',
          Moderation: focused ? 'shield'        : 'shield-outline',
          Notifs:     focused ? 'notifications' : 'notifications-outline',
          Profil:     focused ? 'person'        : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil"    component={TempScreen} options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Ressources" component={TempScreen} options={{ tabBarLabel: 'Ressources' }} />
    <Tab.Screen name="Moderation" component={TempScreen} options={{ tabBarLabel: 'Modération' }} />
    <Tab.Screen name="Notifs"     component={TempScreen} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={TempScreen} options={{ tabBarLabel: 'Profil' }} />
  </Tab.Navigator>
);

// ── Navigation Étudiant ───────────────────────
const EtudiantTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: tabBar.background,
        borderTopColor:  tabBar.borderTop,
        height:          60,
        paddingBottom:   8,
      },
      tabBarActiveTintColor:   tabBar.activeTint,
      tabBarInactiveTintColor: tabBar.inactiveTint,
      tabBarIcon: ({ color, focused }) => {
        const icons = {
          Accueil:    focused ? 'home'          : 'home-outline',
          Categories: focused ? 'book'          : 'book-outline',
          Creer:      focused ? 'add-circle'    : 'add-circle-outline',
          Notifs:     focused ? 'notifications' : 'notifications-outline',
          Profil:     focused ? 'person'        : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Accueil"    component={AccueilEtudiantScreen}      options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Categories" component={CategoriesEtudiantScreen}   options={{ tabBarLabel: 'Catégories' }} />
    <Tab.Screen name="Creer"      component={CreerSujetScreen}           options={{ tabBarLabel: 'Créer' }} />
    <Tab.Screen name="Notifs"     component={NotificationsEtudiantScreen} options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={ProfilEtudiantScreen}       options={{ tabBarLabel: 'Profil' }} />
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
            <Stack.Screen name="Splash"                component={SplashScreen} />
            <Stack.Screen name="Accueil"               component={AccueilScreen} />
            <Stack.Screen name="ChoixRole"             component={ChoixRoleScreen} />
            <Stack.Screen name="InscriptionEtudiant"   component={InscriptionEtudiantScreen} />
            <Stack.Screen name="InscriptionEnseignant" component={InscriptionEnseignantScreen} />
            <Stack.Screen name="VerificationEmail"     component={VerificationEmailScreen} />
            <Stack.Screen name="Connexion"             component={ConnexionScreen} />
          </>
        ) : (
          <>
            {user?.role === 'admin' && (
              <>
                <Stack.Screen name="AdminTabs" component={AdminTabs} />
                <Stack.Screen name="Import"    component={ImportScreen} />
              </>
            )}
            {user?.role === 'enseignant' && (
              <Stack.Screen name="EnseignantTabs" component={EnseignantTabs} />
            )}
            {user?.role === 'etudiant' && (
              <>
                <Stack.Screen name="EtudiantTabs"  component={EtudiantTabs} />
                <Stack.Screen name="Sujets"        component={SujetsScreen} />
                <Stack.Screen name="SujetDetail"   component={SujetDetailScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;