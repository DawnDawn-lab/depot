
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';

const C = {
  bg: '#12101A',
  panel: '#211B30',
  card: '#2B2340',
  purple: '#995CFF',
  light: '#CDB0FF',
  white: '#FFFFFF',
  muted: '#B9B0C9',
  green: '#6FE0AC',
};

const festivals = [
  {
    id: 'beauregard',
    name: 'Festival Beauregard',
    city: 'Hérouville-Saint-Clair',
    region: 'Normandie',
    emoji: '🎪',
    color: '#553A80',
    description: 'Le rendez-vous musical près de Caen.',
  },
  {
    id: 'vieillescharrues',
    name: 'Vieilles Charrues',
    city: 'Carhaix',
    region: 'Bretagne',
    emoji: '🎸',
    color: '#385C4A',
    description: 'Un grand rendez-vous musical breton.',
  },
  {
    id: 'papillons',
    name: 'Papillons de Nuit',
    city: 'Saint-Laurent-de-Cuves',
    region: 'Normandie',
    emoji: '🦋',
    color: '#59416E',
    description: 'Trois jours de musique en Normandie.',
  },
  {
    id: 'artrock',
    name: 'Art Rock',
    city: 'Saint-Brieuc',
    region: 'Bretagne',
    emoji: '🎨',
    color: '#315C75',
    description: 'Musique et découvertes artistiques.',
  },
  {
    id: 'route-du-rock',
    name: 'La Route du Rock',
    city: 'Saint-Malo',
    region: 'Bretagne',
    emoji: '🌊',
    color: '#304B77',
    description: 'Un festival indépendant tourné vers les découvertes.',
  },
];

const demoPlayers = [
  { name: 'Alex', points: 120 },
  { name: 'Camille', points: 95 },
  { name: 'Lucas', points: 80 },
  { name: 'Sarah', points: 65 },
];

export default function App() {
  const [tab, setTab] = useState('Festivals');
  const [selected, setSelected] = useState(festivals[0]);
  const [leagueName, setLeagueName] = useState('Les potes du festival');
  const [nickname, setNickname] = useState('Moi');
  const [league, setLeague] = useState(null);
  const [players, setPlayers] = useState(demoPlayers);
  const [filter, setFilter] = useState('Tous');
 const [artistNames, setArtistNames ] = useState(
    Array(10).fill('')
  );
  const [saveStatus, setSaveStatus] = useState('');
  function createLeague() {
    if (!leagueName.trim() || !nickname.trim()) {
      Alert.alert('Informations manquantes', 'Entre un nom de ligue et un pseudo.');
      return;
    }
async function saveTop10(artistNames) {
  setSaveStatus('Enregistrement en cours...');

  try {
    const cleaned = artistNames.map(name => name.trim());

    if (cleaned.length !== 10 || cleaned.some(name => !name)) {
      setSaveStatus('Erreur : remplis les 10 champs.');
      return;
    }

    const normalized = cleaned.map(name =>
      name.toLocaleLowerCase('fr')
    );

    if (new Set(normalized).size !== 10) {
      setSaveStatus('Erreur : un artiste est présent plusieurs fois.');
      return;
    }

    // Vérifier la session de l'utilisateur
    let { data: { session }, error } =
      await supabase.auth.getSession();

    if (error) throw error;

    if (!session) {
      const result = await supabase.auth.signInAnonymously();

      if (result.error) throw result.error;

      session = result.data.session;
    }

    if (!session?.user) {
      throw new Error(
        'Aucune session utilisateur. Vérifie Supabase Auth.'
      );
    }

    const rows = cleaned.map((artist_name, index) => ({
      festival_id: selected.id,
      user_id: session.user.id,
      player_nickname: nickname.trim() || 'Festivalier',
      position: index + 1,
      artist_name,
    }));

    const { data, error: saveError } = await supabase
      .from('artist_predictions')
      .upsert(rows, {
        onConflict: 'festival_id,user_id,position',
      })
      .select();

    if (saveError) throw saveError;

    if (!data || data.length !== 10) {
      throw new Error(
        'Enregistrement incomplet : vérifie les données retournées.'
      );
    }

    setSaveStatus('✅ Les 10 artistes ont été enregistrés !');
  } catch (error) {
    console.error('Erreur saveTop10 :', error);

    setSaveStatus(
      '❌ Échec de l’enregistrement : ' +
      (error.message || 'Erreur inconnue')
    );
  }
}
    const code = 'FESTI' + Math.random().toString(36).slice(2, 6).toUpperCase();
    setLeague({ name: leagueName.trim(), code, festivalId: selected.id });
    setPlayers([{ name: nickname.trim(), points: 0 }]);
    Alert.alert('Ligue créée !', 'Ton code de démonstration : ' + code);
  }

  function addDemoPlayer() {
    const names = ['Emma', 'Hugo', 'Léa', 'Tom', 'Jade'];
    const next = names.find(name => !players.some(p => p.name === name));

    if (!next) {
      Alert.alert('Démo', 'Tous les joueurs de test sont déjà ajoutés.');
      return;
    }

    setPlayers([...players, { name: next, points: 0 }]);
  }

  const visibleFestivals = filter === 'Tous'
    ? festivals
    : festivals.filter(f => f.region === filter);

  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" />

      <View style={s.header}>
        <Text style={s.logo}>🎸 FESTIPRONO</Text>
        <Text style={s.subtitle}>TES FESTIVALS, TES PRONOS, TES POTES</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {tab === 'Festivals' && (
          <>
            <Text style={s.eyebrow}>SAISON 2027</Text>
            <Text style={s.title}>Choisis ton festival 🎪</Text>
            <Text style={s.muted}>
              Sélectionne un événement pour découvrir son espace de jeu.
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={s.filters}>
              {['Tous', 'Normandie', 'Bretagne',].map(region => (
                <TouchableOpacity
                  key={region}
                  style={[s.chip, filter === region && s.chipActive]}
                  onPress={() => setFilter(region)}
                ><Text style={s.muted}>
  {saveStatus || 'Tes pronostics ne sont pas encore enregistrés.'}
</Text>
                  <Text style={[s.chipText, filter === region && s.chipTextActive]}>
                    {region}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {visibleFestivals.map(festival => (
              <TouchableOpacity
                key={festival.id}
                style={s.festivalCard}
                onPress={() => {
  setSelected(festival);
  setArtistNames(Array(10).fill(''));
  setTab('Festival');
  async function loadTop10(festivalId) {
  setSaveStatus('Chargement des pronostics...');

  try {
    let { data: { session }, error } =
      await supabase.auth.getSession();

    if (error) throw error;

    if (!session) {
      const result = await supabase.auth.signInAnonymously();

      if (result.error) throw result.error;

      session = result.data.session;
    }

    if (!session?.user) {
      throw new Error('Session utilisateur introuvable.');
    }

    const { data, error: loadError } = await supabase
      .from('artist_predictions')
      .select('position, artist_name')
      .eq('festival_id', festivalId)
      .eq('user_id', session.user.id)
      .order('position');

    if (loadError) throw loadError;

    const names = Array(10).fill('');

    (data || []).forEach(row => {
      names[row.position - 1] = row.artist_name;
    });

    setArtistNames(names);

    setSaveStatus(
      data?.length
        ? `✅ ${data.length} artiste(s) chargé(s).`
        : 'Aucun pronostic enregistré pour ce festival.'
    );
  } catch (error) {
    console.error('Erreur loadTop10 :', error);

    setSaveStatus(
      '❌ Chargement impossible : ' +
      (error.message || 'Erreur inconnue')
    );
  }
}
}}
              >
                <View style={[s.festivalIcon, { backgroundColor: festival.color }]}>
                  <Text style={s.festivalEmoji}>{festival.emoji}</Text>
                </View>
                <View style={s.festivalInfo}>
                  <Text style={s.festivalName}>{festival.name}</Text>
                  <Text style={s.muted}>{festival.city}</Text>
                  <Text style={s.region}>{festival.region}</Text>
                  <Text style={s.festivalDescription}>{festival.description}</Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {tab === 'Festival' && (
          <>
            <TouchableOpacity onPress={() => setTab('Festivals')}>
              <Text style={s.back}>‹ Tous les festivals</Text>
            </TouchableOpacity>
            <View style={[s.festivalHero, { backgroundColor: selected.color }]}>
              <Text style={s.heroEmoji}>{selected.emoji}</Text>
              <Text style={s.heroTitle}>{selected.name}</Text>
              <Text style={s.muted}>{selected.city} · {selected.region}</Text>
              <Text style={s.heroDescription}>{selected.description}</Text>
            </View>
            <Text style={s.sectionTitle}>Prêt à défier tes amis ?</Text>
            <TouchableOpacity style={s.button} onPress={() => setTab('Ligue')}>
              <Text style={s.buttonText}>Ma ligue privée →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.secondary} onPress={() => setTab('Classement')}>
              <Text style={s.secondaryText}>Voir le classement</Text>
            </TouchableOpacity>
            <View style={s.card}>
  <Text style={s.sectionTitle}>
    Mon Top 10 des artistes 🎤
  </Text>

  <Text style={s.muted}>
    Quels seront les 10 artistes programmés ?
  </Text>

  {artistNames.map((artist, index) => (
    <TextInput
      key={index}
      style={s.input}
      value={artist}
      onChangeText={value =>
        setArtistNames(old =>
          old.map((name, i) =>
            i === index ? value : name
          )
        )
      }
      placeholder={`Artiste ${index + 1}`}
      placeholderTextColor="#8E849F"
      autoCapitalize="words"
    />
  ))}

  <TouchableOpacity
    style={s.button}
    onPress={() => saveTop10(artistNames)}
  >
    <Text style={s.buttonText}>
      Enregistrer mes pronostics
    </Text>
  </TouchableOpacity>
</View>
          </>
        )}

        {tab === 'Ligue' && (
          <>
            <Text style={s.eyebrow}>JOUER ENSEMBLE</Text>
            <Text style={s.title}>Ta ligue 🏆</Text>
            <View style={s.card}>
              <Text style={s.label}>FESTIVAL SÉLECTIONNÉ</Text>
              <TouchableOpacity onPress={() => setTab('Festivals')}>
                <Text style={s.festivalName}>{selected.name} ›</Text>
                <Text style={s.muted}>Changer de festival</Text>
              </TouchableOpacity>

              <Text style={s.label}>NOM DE LA LIGUE</Text>
              <TextInput
                style={s.input}
                value={leagueName}
                onChangeText={setLeagueName}
                placeholder="Les amis du festival"
                placeholderTextColor="#8E849F"
              />
              <Text style={s.label}>TON PSEUDO</Text>
              <TextInput
                style={s.input}
                value={nickname}
                onChangeText={setNickname}
                placeholder="Ton pseudo"
                placeholderTextColor="#8E849F"
              />
              <TouchableOpacity style={s.button} onPress={createLeague}>
                <Text style={s.buttonText}>＋ Créer ma ligue</Text>
              </TouchableOpacity>
            </View>

            {league && (
              <View style={s.invite}>
                <Text style={s.eyebrow}>LIGUE DE DÉMONSTRATION</Text>
                <Text style={s.sectionTitle}>{league.name}</Text>
                <Text style={s.muted}>Code de test</Text>
                <Text style={s.code}>{league.code}</Text>
                <Text style={s.small}>
                  Ce code n'est pas encore partagé entre plusieurs appareils.
                </Text>
              </View>
            )}
            <TouchableOpacity style={s.secondary} onPress={() => setTab('Classement')}>
              <Text style={s.secondaryText}>Voir le classement →</Text>
            </TouchableOpacity>
          </>
        )}

        {tab === 'Classement' && (
          <>
            <Text style={s.eyebrow}>LA COMPÉTITION</Text>
            <Text style={s.title}>Classement 🏆</Text>
            <View style={s.card}>
              <Text style={s.label}>FESTIVAL</Text>
              <TouchableOpacity onPress={() => setTab('Festivals')}>
                <Text style={s.festivalName}>{selected.name} ›</Text>
              </TouchableOpacity>
              <Text style={s.muted}>
                {league ? league.name : 'Classement de démonstration'}
              </Text>
            </View>
            {sortedPlayers.map((player, index) => (
              <View style={s.playerRow} key={player.name}>
                <Text style={s.rank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </Text>
                <View style={s.playerInfo}>
                  <Text style={s.playerName}>{player.name}</Text>
                  <Text style={s.small}>{index === 0 ? 'En tête' : 'Festivalier'}</Text>
                </View>
                <Text style={s.points}>{player.points} pts</Text>
              </View>
            ))}
            <TouchableOpacity style={s.button} onPress={addDemoPlayer}>
              <Text style={s.buttonText}>＋ Ajouter un joueur de test</Text>
            </TouchableOpacity>
            <Text style={s.small}>
              Scores fictifs : ils ne sont pas encore reliés aux pronostics.
            </Text>
          </>
        )}

        {tab === 'Accueil' && (
          <>
            <Text style={s.eyebrow}>BIENVENUE</Text>
            <Text style={s.title}>La musique se joue aussi entre potes.</Text>
            <View style={s.card}>
              <Text style={s.heroEmoji}>🎸 🎤 🎪</Text>
              <Text style={s.sectionTitle}>6 festivals, une saison de défis.</Text>
              <Text style={s.muted}>
                Choisis un festival, crée une ligue et pronostique avec tes amis.
              </Text>
              <TouchableOpacity style={s.button} onPress={() => setTab('Festivals')}>
                <Text style={s.buttonText}>Explorer les festivals →</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {tab === 'Profil' && (
          <>
            <Text style={s.title}>Mon profil 🎵</Text>
            <View style={s.card}>
              <Text style={s.heroEmoji}>😎</Text>
              <Text style={s.sectionTitle}>{nickname || 'Festivalier'}</Text>
              <Text style={s.muted}>Ton espace personnel Festiprono.</Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={s.nav}>
        {[
          ['Festivals', '🎪'],
          ['Ligue', '👯'],
          ['Classement', '🏆'],
          ['Profil', '👤'],
        ].map(([name, emoji]) => (
          <TouchableOpacity
            key={name}
            style={s.navItem}
            onPress={() => setTab(name)}
          >
            <Text style={s.navEmoji}>{emoji}</Text>
            <Text style={[s.navText, tab === name && s.activeTab]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { backgroundColor: '#211832', padding: 18 },
  logo: { color: C.light, fontSize: 22, fontWeight: '900' },
  subtitle: { color: C.muted, fontSize: 9, marginTop: 5, letterSpacing: 1.4 },
  content: { padding: 17, paddingBottom: 35 },
  eyebrow: { color: C.light, fontSize: 10, fontWeight: '900', letterSpacing: 1.6, marginBottom: 8 },
  title: { color: C.white, fontSize: 27, fontWeight: '900', marginBottom: 10 },
  muted: { color: C.muted, fontSize: 12, lineHeight: 19 },
  filters: { marginVertical: 16, flexGrow: 0 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, backgroundColor: C.panel, borderRadius: 22, marginRight: 7 },
  chipActive: { backgroundColor: C.purple },
  chipText: { color: C.muted, fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: C.white },
  festivalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.panel, borderRadius: 17, padding: 12, marginBottom: 11 },
  festivalIcon: { width: 65, height: 78, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  festivalEmoji: { fontSize: 30 },
  festivalInfo: { flex: 1 },
  festivalName: { color: C.white, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  region: { color: C.light, fontSize: 10, marginTop: 3 },
  festivalDescription: { color: C.muted, fontSize: 10, marginTop: 5, lineHeight: 15 },
  arrow: { color: C.light, fontSize: 28, marginLeft: 5 },
  festivalHero: { borderRadius: 20, padding: 22, marginTop: 15 },
  heroEmoji: { fontSize: 38, marginBottom: 12 },
  heroTitle: { color: C.white, fontSize: 24, fontWeight: '900', marginBottom: 8 },
  heroDescription: { color: C.white, fontSize: 13, marginTop: 15, lineHeight: 20 },
  back: { color: C.light, fontWeight: '700', paddingVertical: 8 },
  sectionTitle: { color: C.white, fontSize: 17, fontWeight: '800', marginBottom: 10 },
  card: { backgroundColor: C.panel, borderRadius: 17, padding: 17, marginTop: 15 },
  label: { color: C.light, fontSize: 10, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  input: { color: C.white, backgroundColor: C.card, borderRadius: 10, padding: 13, marginBottom: 8, fontSize: 14 },
  button: { backgroundColor: C.purple, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 14 },
  buttonText: { color: C.white, fontSize: 13, fontWeight: '900' },
  secondary: { borderWidth: 1, borderColor: C.purple, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  secondaryText: { color: C.light, fontWeight: '800' },
  invite: { backgroundColor: '#332347', borderRadius: 17, padding: 17, marginTop: 16 },
  code: { color: C.light, fontSize: 27, fontWeight: '900', letterSpacing: 3, marginVertical: 10 },
  small: { color: C.muted, fontSize: 10, lineHeight: 16, marginTop: 8 },
  playerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.panel, padding: 14, borderRadius: 13, marginTop: 9 },
  rank: { color: C.white, width: 35, fontSize: 17 },
  playerInfo: { flex: 1 },
  playerName: { color: C.white, fontSize: 14, fontWeight: '800' },
  points: { color: C.green, fontSize: 13, fontWeight: '900' },
  nav: { flexDirection: 'row', backgroundColor: '#211832', paddingTop: 9, paddingBottom: 8, borderTopWidth: 1, borderTopColor: '#382A4C' },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navEmoji: { fontSize: 19 },
  navText: { color: C.muted, fontSize: 9, fontWeight: '700' },
  activeTab: { color: C.light },
});