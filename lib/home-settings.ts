export type HomeCategoryConfig = {
  nombre: string
  visible: boolean
  orden: number
}

export type HomeSettings = {
  categories: HomeCategoryConfig[]
}

export const HOME_SETTINGS_KEY = "home"

export function buildDefaultHomeCategories(categoryNames: string[]): HomeCategoryConfig[] {
  return categoryNames.map((nombre, index) => ({
    nombre,
    visible: index < 6,
    orden: index + 1,
  }))
}

export function mergeHomeCategories(
  saved: HomeCategoryConfig[] | undefined,
  categoryNames: string[],
): HomeCategoryConfig[] {
  const merged = new Map<string, HomeCategoryConfig>()

  for (const item of saved ?? []) {
    merged.set(item.nombre, item)
  }

  for (const nombre of categoryNames) {
    if (!merged.has(nombre)) {
      merged.set(nombre, {
        nombre,
        visible: false,
        orden: merged.size + 1,
      })
    }
  }

  return Array.from(merged.values())
    .filter((item) => categoryNames.includes(item.nombre))
    .sort((a, b) => a.orden - b.orden)
    .map((item, index) => ({ ...item, orden: index + 1 }))
}

export function getVisibleHomeCategories(settings: HomeCategoryConfig[]) {
  return settings.filter((item) => item.visible).sort((a, b) => a.orden - b.orden)
}

export function parseHomeSettings(value: unknown): HomeSettings {
  if (!value || typeof value !== "object") {
    return { categories: [] }
  }

  const categories = Array.isArray((value as HomeSettings).categories)
    ? (value as HomeSettings).categories.filter(
        (item): item is HomeCategoryConfig =>
          !!item &&
          typeof item === "object" &&
          typeof item.nombre === "string" &&
          typeof item.visible === "boolean" &&
          typeof item.orden === "number",
      )
    : []

  return { categories }
}
