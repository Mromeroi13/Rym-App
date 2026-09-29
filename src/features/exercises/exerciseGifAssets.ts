// Generado a partir del contenido real de public/exercise-gifs (ver docs/DATABASE.md).
// No añadas aquí rutas que no existan físicamente en esa carpeta: regenera este archivo si cambian los ficheros.
export interface ExerciseGifAsset {
  /** Carpeta de origen dentro de public/exercise-gifs (agrupación por zona). */
  folder: string
  /** Ruta pública lista para usar como gif_url / src de <img>. */
  path: string
  /** Nombre de archivo sin extensión, normalizado (sin tildes/guiones) para comparar con el nombre del ejercicio. */
  slug: string
  /** Etiqueta legible para mostrar en el selector del admin. */
  label: string
}

export const EXERCISE_GIF_ASSETS: ExerciseGifAsset[] = [
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/crunch-abdominal-lateral.gif', slug: 'crunch-abdominal-lateral', label: 'Crunch abdominal lateral' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/crunch-abdominal.gif', slug: 'crunch-abdominal', label: 'Crunch abdominal' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/crunch-maquina.gif', slug: 'crunch-maquina', label: 'Crunch maquina' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/crunch-oblicuo-sentado.gif', slug: 'crunch-oblicuo-sentado', label: 'Crunch oblicuo sentado' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/crunch-polea.gif', slug: 'crunch-polea', label: 'Crunch polea' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/elevaciones-piernas-maquina.gif', slug: 'elevaciones-piernas-maquina', label: 'Elevaciones piernas maquina' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/elevaciones-piernas.gif', slug: 'elevaciones-piernas', label: 'Elevaciones piernas' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/mountain-climbers.gif', slug: 'mountain-climbers', label: 'Mountain climbers' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/plancha-lateral.jpg', slug: 'plancha-lateral', label: 'Plancha lateral' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/plancha.jpg', slug: 'plancha', label: 'Plancha' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/rueda-abdominal.gif', slug: 'rueda-abdominal', label: 'Rueda abdominal' },
  { folder: 'abdominales', path: '/exercise-gifs/abdominales/russian-twist.gif', slug: 'russian-twist', label: 'Russian twist' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-banco-inclinado.gif', slug: 'curl-banco-inclinado', label: 'Curl banco inclinado' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-barra-EZ.gif', slug: 'curl-barra-ez', label: 'Curl barra EZ' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-barra.gif', slug: 'curl-barra', label: 'Curl barra' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-mancuernas.gif', slug: 'curl-mancuernas', label: 'Curl mancuernas' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-martillo.gif', slug: 'curl-martillo', label: 'Curl martillo' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-polea-baja.gif', slug: 'curl-polea-baja', label: 'Curl polea baja' },
  { folder: 'biceps', path: '/exercise-gifs/biceps/curl-unilateral-polea.gif', slug: 'curl-unilateral-polea', label: 'Curl unilateral polea' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/dominadas-asistidas.gif', slug: 'dominadas-asistidas', label: 'Dominadas asistidas' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/dominadas.gif', slug: 'dominadas', label: 'Dominadas' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/face-pull.gif', slug: 'face-pull', label: 'Face pull' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/jalon-pecho-abierto.gif', slug: 'jalon-pecho-abierto', label: 'Jalon pecho abierto' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/jalon-pecho-cerrado.gif', slug: 'jalon-pecho-cerrado', label: 'Jalon pecho cerrado' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/pull-over-polea.gif', slug: 'pull-over-polea', label: 'Pull over polea' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/pull-over.gif', slug: 'pull-over', label: 'Pull over' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/remo-mancuerna.gif', slug: 'remo-mancuerna', label: 'Remo mancuerna' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/remo-maquina.gif', slug: 'remo-maquina', label: 'Remo maquina' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/remo-sentado-poela.gif', slug: 'remo-sentado-poela', label: 'Remo sentado poela' },
  { folder: 'espalda', path: '/exercise-gifs/espalda/remo-unilateral-polea.gif', slug: 'remo-unilateral-polea', label: 'Remo unilateral polea' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/abduccion-cadera-maquina.gif', slug: 'abduccion-cadera-maquina', label: 'Abduccion cadera maquina' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/aduccion-cadera-maquina.gif', slug: 'aduccion-cadera-maquina', label: 'Aduccion cadera maquina' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/bulgarian-split-squat.gif', slug: 'bulgarian-split-squat', label: 'Bulgarian split squat' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/curl-femoral-horizontal.gif', slug: 'curl-femoral-horizontal', label: 'Curl femoral horizontal' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/extension-cuadriceps.gif', slug: 'extension-cuadriceps', label: 'Extension cuadriceps' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/gemelos-de-pie.gif', slug: 'gemelos-de-pie', label: 'Gemelos de pie' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/hip-thrust.gif', slug: 'hip-thrust', label: 'Hip thrust' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/patada-gluteo-polea.gif', slug: 'patada-gluteo-polea', label: 'Patada gluteo polea' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/peso-muerto.gif', slug: 'peso-muerto', label: 'Peso muerto' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/prensa.gif', slug: 'prensa', label: 'Prensa' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/puente-gluteo.gif', slug: 'puente-gluteo', label: 'Puente gluteo' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/sentadilla-sumo.gif', slug: 'sentadilla-sumo', label: 'Sentadilla sumo' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/sentadilla.gif', slug: 'sentadilla', label: 'Sentadilla' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/sentadillas-maquina.gif', slug: 'sentadillas-maquina', label: 'Sentadillas maquina' },
  { folder: 'gluteos_piernas', path: '/exercise-gifs/gluteos_piernas/zancadas.gif', slug: 'zancadas', label: 'Zancadas' },
  { folder: 'hombros', path: '/exercise-gifs/hombros/elevaciones-frontales.gif', slug: 'elevaciones-frontales', label: 'Elevaciones frontales' },
  { folder: 'hombros', path: '/exercise-gifs/hombros/elevaciones-laterales.gif', slug: 'elevaciones-laterales', label: 'Elevaciones laterales' },
  { folder: 'hombros', path: '/exercise-gifs/hombros/press-arnold.gif', slug: 'press-arnold', label: 'Press arnold' },
  { folder: 'hombros', path: '/exercise-gifs/hombros/press-hombros-maquina.gif', slug: 'press-hombros-maquina', label: 'Press hombros maquina' },
  { folder: 'hombros', path: '/exercise-gifs/hombros/press-militar.gif', slug: 'press-militar', label: 'Press militar' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/aperturas-mancuernas.gif', slug: 'aperturas-mancuernas', label: 'Aperturas mancuernas' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/cruces-poleas.gif', slug: 'cruces-poleas', label: 'Cruces poleas' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/flexiones.gif', slug: 'flexiones', label: 'Flexiones' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/press-banca-barra.gif', slug: 'press-banca-barra', label: 'Press banca barra' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/press-banca-mancuernas.gif', slug: 'press-banca-mancuernas', label: 'Press banca mancuernas' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/press-inclinado-barra.gif', slug: 'press-inclinado-barra', label: 'Press inclinado barra' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/press-inclinado-mancuernas.gif', slug: 'press-inclinado-mancuernas', label: 'Press inclinado mancuernas' },
  { folder: 'pecho', path: '/exercise-gifs/pecho/press-pecho-maquina.gif', slug: 'press-pecho-maquina', label: 'Press pecho maquina' },
  { folder: 'triceps', path: '/exercise-gifs/triceps/extension-encima-cabeza-cuerda.gif', slug: 'extension-encima-cabeza-cuerda', label: 'Extension encima cabeza cuerda' },
  { folder: 'triceps', path: '/exercise-gifs/triceps/extension-triceps-polea.gif', slug: 'extension-triceps-polea', label: 'Extension triceps polea' },
  { folder: 'triceps', path: '/exercise-gifs/triceps/extension-unilateral-polea.gif', slug: 'extension-unilateral-polea', label: 'Extension unilateral polea' },
  { folder: 'triceps', path: '/exercise-gifs/triceps/fondo-triceps.gif', slug: 'fondo-triceps', label: 'Fondo triceps' },
  { folder: 'triceps', path: '/exercise-gifs/triceps/press-frances-barra-EZ.gif', slug: 'press-frances-barra-ez', label: 'Press frances barra EZ' },
]

/** Agrupa los assets por carpeta de origen, en el mismo orden que aparecen en el array. */
export function groupedExerciseGifAssets(): { folder: string; assets: ExerciseGifAsset[] }[] {
  const order: string[] = []
  const byFolder = new Map<string, ExerciseGifAsset[]>()
  for (const asset of EXERCISE_GIF_ASSETS) {
    if (!byFolder.has(asset.folder)) {
      byFolder.set(asset.folder, [])
      order.push(asset.folder)
    }
    byFolder.get(asset.folder)!.push(asset)
  }
  return order.map((folder) => ({ folder, assets: byFolder.get(folder)! }))
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Sugiere un GIF solo cuando el nombre del ejercicio coincide EXACTAMENTE (una vez
 * normalizado) con el nombre de archivo. Nunca inventa ni aproxima una coincidencia:
 * si no hay match exacto, el admin elige manualmente en el selector.
 */
export function suggestGifForExerciseName(name: string): ExerciseGifAsset | null {
  const target = slugify(name)
  if (!target) return null
  return EXERCISE_GIF_ASSETS.find((asset) => asset.slug === target) ?? null
}

