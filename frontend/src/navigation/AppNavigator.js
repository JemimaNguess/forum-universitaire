import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
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
import MotDePasseOublieScreen from '../screens/auth/MotDePasseOublieScreen';

// admin
import DashboardScreen    from '../screens/admin/DashboardScreen';
import UtilisateursScreen from '../screens/admin/UtilisateursScreen';
import ValidationsScreen  from '../screens/admin/ValidationsScreen';
import CategoriesScreen   from '../screens/admin/CategoriesScreen';
import ProfilAdminScreen  from '../screens/admin/ProfilAdminScreen';
import ImportScreen       from '../screens/admin/ImportScreen';
import HistoriqueScreen        from '../screens/admin/HistoriqueScreen';
import NotificationsScreen     from '../screens/admin/NotificationsScreen';
import ParametresScreen        from '../screens/admin/ParametresScreen';
import SecuriteScreen          from '../screens/admin/SecuriteScreen';
import MessagerieScreen        from '../screens/admin/MessagerieScreen';
import ConversationScreen      from '../screens/admin/ConversationScreen';
import InfoConversationScreen  from '../screens/admin/InfoConversationScreen';
import IAScreenAdmin           from '../screens/admin/IAScreen';

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
import NotificationsEtudiantScreen from '../screens/admin/NotificationsScreen';
import ProfilEtudiantScreen   from '../screens/etudiant/ProfilScreen';
import ConversationEtudiantScreen from '../screens/etudiant/ConversationEtudiantScreen';
import InfoConversationEtudiantScreen from '../screens/etudiant/InfoConversationEtudiantScreen';
import MessagerieEtudiantScreen from '../screens/etudiant/MessagerieEtudiantScreen';


// ── Écrans temporaires ────────────────────────
const TempScreen = () => (
  <View style={{ flex:1, backgroundColor:'#0F0A1E', justifyContent:'center', alignItems:'center' }}>
    <ActivityIndicator color="#A78BFA" />
  </View>
);

const UnknownRoleScreen = () => (
  <View style={{ flex:1, backgroundColor:'#0F0A1E', justifyContent:'center', alignItems:'center' }}>
    <Text style={{ color:'#fff', fontSize:16, textAlign:'center', paddingHorizontal:24 }}>
      Rôle utilisateur inconnu. Veuillez vous reconnecter ou contacter l'administration.
    </Text>
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
    <Tab.Screen name="Accueil"    component={AccueilEnseignantScreen}      options={{ tabBarLabel: 'Accueil' }} />
    <Tab.Screen name="Ressources" component={RessourcesEnseignantScreen} options={{ tabBarLabel: 'Ressources' }} />
    <Tab.Screen name="Moderation" component={ModerationEnseignantScreen} options={{ tabBarLabel: 'Modération' }} />
    <Tab.Screen name="Notifs"     component={AnnoncesEnseignantScreen}     options={{ tabBarLabel: 'Notifs' }} />
    <Tab.Screen name="Profil"     component={ProfilEnseignantScreen}      options={{ tabBarLabel: 'Profil' }} />
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
      <Stack.Navigator
        key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash"                component={SplashScreen} />
            <Stack.Screen name="Accueil"               component={AccueilScreen} />
            <Stack.Screen name="ChoixRole"             component={ChoixRoleScreen} />
            <Stack.Screen name="InscriptionEtudiant"   component={InscriptionEtudiantScreen} />
            <Stack.Screen name="InscriptionEnseignant" component={InscriptionEnseignantScreen} />
            <Stack.Screen name="VerificationEmail"     component={VerificationEmailScreen} />
            <Stack.Screen name="Connexion"             component={ConnexionScreen} />
            <Stack.Screen name="MotDePasseOublie" component={MotDePasseOublieScreen} />
            
          </>
        ) : (
          <>
            {user?.role === 'admin' && (
              <>
                <Stack.Screen name="AdminTabs"         component={AdminTabs} />
                <Stack.Screen name="Import"            component={ImportScreen} />
                <Stack.Screen name="Historique"        component={HistoriqueScreen} />
                <Stack.Screen name="Notifications"     component={NotificationsScreen} />
                <Stack.Screen name="Parametres"        component={ParametresScreen} />
                <Stack.Screen name="Securite"          component={SecuriteScreen} />
                <Stack.Screen name="Messagerie"        component={MessagerieScreen} />
                <Stack.Screen name="Conversation"      component={ConversationScreen} />
                <Stack.Screen name="InfoConversation"  component={InfoConversationScreen} />
                <Stack.Screen name="IA"                component={IAScreenAdmin} />
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
                <Stack.Screen name="Messagerie"        component={MessagerieEtudiantScreen} />
                <Stack.Screen name="Conversation"      component={ConversationEtudiantScreen} />
                <Stack.Screen name="InfoConversation"  component={InfoConversationEtudiantScreen} />
                <Stack.Screen name="Notifications"     component={NotificationsEtudiantScreen} />
                <Stack.Screen name="Securite"          component={SecuriteEtudiantScreen} />
              </>
            )}
            {!['admin','enseignant','etudiant'].includes(user?.role) && (
              <Stack.Screen name="UnknownRole" component={UnknownRoleScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;