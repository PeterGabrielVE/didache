import type { DynamicCategory, NewDynamic } from '../types/resources';

export const DYNAMIC_CATEGORIES: Record<DynamicCategory, string> = {
  rompehielos: 'Rompehielos',
  integracion: 'Integración',
  confianza: 'Confianza',
  reflexion: 'Reflexión',
};

// Contenido inicial: se copia a la base al crearla
export const DYNAMICS: NewDynamic[] = [
  {
    title: 'La telaraña',
    category: 'rompehielos',
    summary: 'Presentación con un ovillo de lana que va formando una red entre todos.',
    objective: 'Conocer los nombres y algo de cada uno, y descubrir que formamos una comunidad.',
    duration: '15 a 20 min',
    groupSize: '8 a 25',
    materials: ['Un ovillo de lana'],
    steps: [
      'Ubicar a todos en ronda, de pie o sentados.',
      'El catequista sostiene la punta del ovillo, dice su nombre y algo que le guste, y lo lanza a alguien sin soltar la punta.',
      'Quien recibe el ovillo se presenta igual, se queda con un tramo de hilo y lo lanza a otro compañero.',
      'Seguir hasta que todos tengan hilo: se forma una telaraña.',
      'Para desarmarla, cada uno devuelve el ovillo a quien se lo pasó diciendo el nombre de esa persona.',
    ],
    reflection:
      '¿Qué pasa con la red si alguien suelta su hilo? Como dice San Pablo, somos muchos miembros pero un solo cuerpo (1 Co 12,12): cada uno es necesario en la comunidad.',
  },
  {
    title: 'Dos verdades y una mentira',
    category: 'rompehielos',
    summary: 'Cada uno cuenta tres cosas de sí mismo y el grupo adivina cuál es falsa.',
    objective: 'Romper el hielo y conocerse de forma divertida.',
    duration: '15 min',
    groupSize: '5 a 20',
    materials: [],
    steps: [
      'Dar un minuto para que cada uno piense tres frases sobre sí mismo: dos verdaderas y una falsa.',
      'Por turnos, cada participante dice sus tres frases.',
      'El resto vota cuál cree que es la mentira.',
      'Quien habló revela la respuesta y, si quiere, cuenta un poco más de alguna verdad.',
    ],
    reflection:
      '¿Fue fácil descubrir la mentira? Jesús nos dice: «La verdad los hará libres» (Jn 8,32). ¿Por qué cuesta a veces decir la verdad?',
  },
  {
    title: 'El nudo humano',
    category: 'integracion',
    summary: 'El grupo, tomado de las manos, debe desenredarse sin soltarse.',
    objective: 'Trabajar en equipo, escucharse y tener paciencia para resolver un problema común.',
    duration: '15 a 20 min',
    groupSize: '8 a 12 por grupo',
    materials: [],
    steps: [
      'Formar una ronda bien cerrada, hombro con hombro.',
      'Cada uno extiende la mano derecha y toma la de alguien que no esté a su lado.',
      'Luego hace lo mismo con la mano izquierda, tomando la de otra persona.',
      'Sin soltarse, el grupo tiene que desenredarse hasta volver a formar una ronda (puede quedar más de una).',
      'Si el grupo se traba, el catequista puede permitir soltar un solo par de manos.',
    ],
    reflection:
      '¿Quién guió? ¿Se escucharon? En la Iglesia los problemas se resuelven juntos y con paciencia, como los primeros cristianos que «tenían un solo corazón y una sola alma» (Hch 4,32).',
  },
  {
    title: 'Se hunde la barca',
    category: 'integracion',
    summary: 'Juego de movimiento en el que hay que formar grupos del número que se anuncia.',
    objective: 'Animar al grupo, mezclar a los participantes y armar equipos de forma divertida.',
    duration: '10 min',
    groupSize: '10 a 40',
    materials: ['Espacio libre para moverse'],
    steps: [
      'Todos caminan por el espacio como si estuvieran en una barca en el mar.',
      'El catequista narra: «Viene una tormenta… ¡la barca se hunde! Los botes salvavidas son de…» y dice un número.',
      'Los participantes forman grupos de ese número lo más rápido posible.',
      'Quienes queden sin grupo ayudan al catequista a narrar en la siguiente ronda.',
      'Terminar con el número que se necesite para la actividad siguiente.',
    ],
    reflection:
      'Los discípulos también tuvieron miedo en la tormenta y Jesús calmó el mar (Mc 4,35-41). ¿Qué «tormentas» vivimos? ¿Confiamos en que Jesús va en nuestra barca?',
  },
  {
    title: 'El lazarillo',
    category: 'confianza',
    summary: 'En parejas, uno con los ojos vendados se deja guiar por el otro.',
    objective: 'Experimentar qué es confiar en alguien y qué es ser responsable de otro.',
    duration: '20 a 25 min',
    groupSize: 'Parejas, cualquier cantidad',
    materials: ['Vendas o pañuelos para los ojos', 'Algunos obstáculos seguros (sillas, mochilas)'],
    steps: [
      'Formar parejas. Uno se venda los ojos; el otro será su guía.',
      'El guía conduce a su compañero por el lugar, primero tomándolo del brazo y después solo con la voz.',
      'Pasados unos 5 minutos, intercambiar los roles.',
      'Cuidar en todo momento que nadie se golpee: el catequista supervisa el recorrido.',
      'Volver a la ronda para compartir cómo se sintieron.',
    ],
    reflection:
      '¿Qué fue más difícil: guiar o dejarse guiar? Leer el Salmo 23: «El Señor es mi pastor, nada me falta». ¿En quién confío cuando no veo el camino?',
  },
  {
    title: 'Carta a Jesús',
    category: 'reflexion',
    summary: 'Momento de silencio para escribirle a Jesús una carta personal.',
    objective: 'Favorecer la oración personal y el diálogo íntimo con Jesús.',
    duration: '20 min',
    groupSize: 'Cualquier cantidad',
    materials: ['Hojas y lápices', 'Música tranquila (opcional)', 'Una vela o una imagen de Jesús'],
    steps: [
      'Preparar un ambiente de oración: luz tenue, una vela encendida o una imagen de Jesús en el centro.',
      'Explicar que nadie va a leer la carta: es solo entre cada uno y Jesús.',
      'Proponer algunas ideas: agradecer, pedir perdón, contarle algo que preocupa, pedir por alguien.',
      'Dar unos 10 minutos de silencio para escribir.',
      'Quien quiera puede dejar su carta doblada a los pies de la imagen o guardarla.',
      'Cerrar rezando juntos un Padre Nuestro.',
    ],
    reflection:
      'Jesús nos invita: «Vengan a mí todos los que están cansados y agobiados, y yo los aliviaré» (Mt 11,28). Rezar es hablar con un amigo que nos ama.',
  },
  {
    title: 'El regalo de las cualidades',
    category: 'reflexion',
    summary: 'Cada uno recibe por escrito las cualidades que los demás ven en él.',
    objective: 'Reconocer los dones que Dios dio a cada uno y aprender a valorar a los demás.',
    duration: '20 a 30 min',
    groupSize: '6 a 20',
    materials: ['Una hoja por participante con su nombre', 'Lápices', 'Cinta adhesiva (opcional)'],
    steps: [
      'Cada participante escribe su nombre arriba de una hoja.',
      'Las hojas van pasando (o se pegan en la espalda) y cada uno escribe una cualidad positiva de esa persona.',
      'Insistir en que solo se escriben cosas buenas y sinceras.',
      'Cuando todas las hojas dieron la vuelta, cada uno lee la suya en silencio.',
      'Compartir en ronda: ¿qué me sorprendió? ¿qué cualidad no sabía que tenía?',
    ],
    reflection:
      'Cada cualidad es un regalo de Dios para ponerlo al servicio de los demás, como en la parábola de los talentos (Mt 25,14-30). ¿Cómo puedo usar los míos?',
  },
  {
    title: 'Teléfono descompuesto',
    category: 'rompehielos',
    summary: 'Un mensaje pasa de oído en oído y se compara cómo llega al final.',
    objective: 'Divertirse y reflexionar sobre la importancia de transmitir fielmente un mensaje.',
    duration: '10 min',
    groupSize: '8 a 20',
    materials: [],
    steps: [
      'Ubicar al grupo en fila o en ronda.',
      'El catequista dice al oído del primero una frase (por ejemplo, un versículo corto del Evangelio).',
      'Cada uno la repite en voz baja al siguiente, una sola vez.',
      'El último dice en voz alta lo que entendió y se compara con la frase original.',
    ],
    reflection:
      '¿Por qué cambió el mensaje? Los apóstoles transmitieron fielmente lo que vieron y oyeron de Jesús (1 Jn 1,3). Hoy nos toca a nosotros anunciarlo sin cambiarlo.',
  },
];
