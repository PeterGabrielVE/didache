import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Text } from '../components';
import { COLORS, SHADOWS, SIZES } from '../constants/theme';
import { useDashboardStats } from '../hooks/useDashboardStats';

const background = require('../../assets/argon/images/profile-bg.png');

// Layout de la pantalla "Profile" de Argon: fondo degradado, tarjeta con avatar superpuesto.
export function ProfileScreen() {
  const { stats } = useDashboardStats();

  return (
    <ImageBackground source={background} style={styles.screen} imageStyle={styles.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text variant="h2" color={COLORS.WHITE}>
                C
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button small color="info">
              Editar
            </Button>
            <Button small color="default">
              Ajustes
            </Button>
          </View>

          <View style={styles.stats}>
            <Stat value={stats?.activeParticipants} label="Participantes" />
            <Stat value={stats?.activitiesInRange} label="Actividades" />
            <Stat value={stats?.attendanceMarks} label="Asistencias" />
          </View>

          <View style={styles.nameInfo}>
            <Text variant="h2" center>
              Catequista
            </Text>
            <Text variant="body" color={COLORS.HEADING} center style={styles.subtitle}>
              Grupo de catequesis
            </Text>
          </View>

          <View style={styles.divider} />

          <Text variant="body" center>
            Acá vas a poder ver y editar tus datos, tu grupo y las preferencias de la app.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function Stat({ value, label }: { value: number | undefined; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h4" color={COLORS.HEADER} bold>
        {value ?? '–'}
      </Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}

const AVATAR = 124;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  background: {
    height: 320,
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    paddingTop: 140,
    paddingHorizontal: SIZES.BASE,
    paddingBottom: SIZES.BASE * 2,
  },
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: SIZES.CARD_RADIUS,
    paddingHorizontal: SIZES.BASE * 1.5,
    paddingBottom: SIZES.BASE * 2,
    ...SHADOWS.card,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -AVATAR / 2,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    paddingBottom: 24,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  nameInfo: {
    marginTop: 35,
  },
  subtitle: {
    marginTop: 10,
  },
  divider: {
    alignSelf: 'center',
    width: '90%',
    borderBottomWidth: 1,
    borderColor: COLORS.BLOCK,
    marginTop: 30,
    marginBottom: 16,
  },
});
