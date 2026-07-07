export type VariantTipo = "liquid" | "unit"

export const VARIANT_PRESETS: Record<
  VariantTipo,
  { label: string; description: string; names: readonly string[] }
> = {
  liquid: {
    label: "Productos sueltos (litros)",
    description: "x1 litro, x5 litros y x20 litros",
    names: ["x1 litro", "x5 litros", "x20 litros"],
  },
  unit: {
    label: "Por unidades",
    description: "x1 U, x6 U y x12 U",
    names: ["x1 U", "x6 U", "x12 U"],
  },
}

const LEGACY_VARIANT_ALIASES: Record<string, string> = {
  X1litro: "x1 litro",
  X5litros: "x5 litros",
  X20litros: "x20 litros",
  X1L: "x1 litro",
  X1LITRO: "x1 litro",
  X1U: "x1 U",
  X6U: "x6 U",
  X12U: "x12 U",
}

export function getVariantPresetNames(tipo: VariantTipo) {
  return [...VARIANT_PRESETS[tipo].names]
}

export function getVariantPickerLabel(tipo?: VariantTipo | null) {
  if (tipo === "liquid") return "Elegí el volumen"
  if (tipo === "unit") return "Elegí la presentación"
  return "Elegí una variante"
}

export function normalizeVariantDisplayName(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return trimmed
  return LEGACY_VARIANT_ALIASES[trimmed] ?? LEGACY_VARIANT_ALIASES[trimmed.toUpperCase()] ?? trimmed
}

function findVariantMatch(
  nombre: string,
  source: Array<{ nombre: string; precio: number | string }>,
) {
  const normalizedTarget = normalizeVariantDisplayName(nombre)
  return source.find(
    (variant) =>
      variant.nombre === nombre ||
      normalizeVariantDisplayName(variant.nombre) === normalizedTarget,
  )
}

export function hydrateVariantsFromPreset(
  tipo: VariantTipo,
  source: Array<{ nombre: string; precio: number | string }>,
) {
  const names = getVariantPresetNames(tipo)
  return names.map((nombre) => {
    const match = findVariantMatch(nombre, source)
    return {
      nombre,
      precio: match ? String(match.precio) : "",
    }
  })
}

export function isVariantTipo(value: unknown): value is VariantTipo {
  return value === "liquid" || value === "unit"
}
