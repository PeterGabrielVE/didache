// Recursos digitales, guardados en SQLite. Oraciones y dinámicas se precargan
// desde src/data al crear la base; el catequista puede agregar, editar o borrar.

export type PrayerCategory = 'basicas' | 'marianas' | 'espiritu' | 'cotidianas';

export type Prayer = {
  id: number;
  title: string;
  category: PrayerCategory;
  // Párrafos separados por una línea en blanco
  text: string;
};

export type NewPrayer = Omit<Prayer, 'id'>;

export type DynamicCategory = 'rompehielos' | 'integracion' | 'confianza' | 'reflexion';

export type GroupDynamic = {
  id: number;
  title: string;
  category: DynamicCategory;
  summary: string;
  objective: string;
  duration: string;
  groupSize: string;
  materials: string[];
  steps: string[];
  // Preguntas o cierre desde la fe
  reflection: string;
};

export type NewDynamic = Omit<GroupDynamic, 'id'>;

export type Song = {
  id: number;
  title: string;
  author: string | null;
  // Tono original, p. ej. 'G' o 'Am'
  songKey: string | null;
  // Letra con acordes entre corchetes: '[G]Ale[D]luya'
  lyrics: string;
  createdAt: string;
};

export type NewSong = Pick<Song, 'title' | 'lyrics'> & Partial<Pick<Song, 'author' | 'songKey'>>;
