import type { NewPrayer, PrayerCategory } from '../types/resources';

export const PRAYER_CATEGORIES: Record<PrayerCategory, string> = {
  basicas: 'Básicas',
  marianas: 'A la Virgen María',
  espiritu: 'Al Espíritu Santo',
  cotidianas: 'De cada día',
};

// Contenido inicial: se copia a la base al crearla
export const PRAYERS: NewPrayer[] = [
  {
    title: 'La señal de la cruz',
    category: 'basicas',
    text: `Por la señal de la santa cruz,
de nuestros enemigos líbranos, Señor, Dios nuestro.

En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.`,
  },
  {
    title: 'Gloria',
    category: 'basicas',
    text: `Gloria al Padre, y al Hijo, y al Espíritu Santo.
Como era en el principio, ahora y siempre,
por los siglos de los siglos. Amén.`,
  },
  {
    title: 'Padre Nuestro',
    category: 'basicas',
    text: `Padre nuestro, que estás en el cielo,
santificado sea tu Nombre;
venga a nosotros tu reino;
hágase tu voluntad en la tierra como en el cielo.

Danos hoy nuestro pan de cada día;
perdona nuestras ofensas,
como también nosotros perdonamos a los que nos ofenden;
no nos dejes caer en la tentación,
y líbranos del mal. Amén.`,
  },
  {
    title: 'Ave María',
    category: 'marianas',
    text: `Dios te salve, María, llena eres de gracia, el Señor es contigo.
Bendita tú eres entre todas las mujeres,
y bendito es el fruto de tu vientre, Jesús.

Santa María, Madre de Dios,
ruega por nosotros, pecadores,
ahora y en la hora de nuestra muerte. Amén.`,
  },
  {
    title: 'Ángel de la Guarda',
    category: 'cotidianas',
    text: `Ángel de mi guarda, dulce compañía,
no me desampares ni de noche ni de día.
No me dejes solo, que me perdería. Amén.`,
  },
  {
    title: 'Bendición de los alimentos',
    category: 'cotidianas',
    text: `Bendícenos, Señor, y bendice estos alimentos
que por tu bondad vamos a recibir.
Por Cristo nuestro Señor. Amén.`,
  },
  {
    title: 'Ven, Espíritu Santo',
    category: 'espiritu',
    text: `Ven, Espíritu Santo,
llena los corazones de tus fieles
y enciende en ellos el fuego de tu amor.

V. Envía tu Espíritu y serán creados.
R. Y renovarás la faz de la tierra.`,
  },
  {
    title: 'Oración antes del encuentro',
    category: 'espiritu',
    text: `Señor Jesús, gracias por reunirnos hoy como amigos tuyos.
Abre nuestros oídos para escuchar tu Palabra
y nuestro corazón para vivirla.

Que tu Espíritu Santo nos guíe en este encuentro,
y que la Virgen María nos acompañe como Madre. Amén.`,
  },
];
