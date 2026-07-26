export type VariantTipo = "liquid" | "unit"

export const VARIANT_PRESETS: Record<
  VariantTipo,
  { label: string; description: string; names: readonly string[] }
> = {
  liquid: {
    label: "Por litros (líquidos sueltos)",
    description: "x1litro, x5litros y x20litros",
    names: ["x1litro", "x5litros", "x20litros"],
  },
  unit: {
    label: "Por unidades (accesorios, gatillos, etc.)",
    description: "x 1u, x 6u y x 12u",
    names: ["x 1u", "x 6u", "x 12u"],
  },
}

const LEGACY_VARIANT_ALIASES: Record<string, string> = {
  X1litro: "x1litro",
  X5litros: "x5litros",
  X20litros: "x20litros",
  "x1 litro": "x1litro",
  "x5 litros": "x5litros",
  "x20 litros": "x20litros",
  X1L: "x1litro",
  x1l: "x1litro",
  X1U: "x 1u",
  X6U: "x 6u",
  X12U: "x 12u",
  "x1 U": "x 1u",
  "x6 U": "x 6u",
  "x12 U": "x 12u",
  x1u: "x 1u",
  x6u: "x 6u",
  x12u: "x 12u",
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

  if (LEGACY_VARIANT_ALIASES[trimmed]) {
    return LEGACY_VARIANT_ALIASES[trimmed]
  }

  const lower = trimmed.toLowerCase()
  for (const [legacy, canonical] of Object.entries(LEGACY_VARIANT_ALIASES)) {
    if (legacy.toLowerCase() === lower) return canonical
  }

  return trimmed
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

export function inferVariantTipoFromNames(
  variantes: Array<{ nombre: string }> | null | undefined,
): VariantTipo | null {
  const names = (variantes ?? []).map((v) => normalizeVariantDisplayName(v.nombre))
  if (names.some((n) => ["x 1u", "x 6u", "x 12u"].includes(n))) return "unit"
  if (names.some((n) => ["x1litro", "x5litros", "x20litros"].includes(n))) return "liquid"
  return null
}

export function isVariantTipo(value: unknown): value is VariantTipo {
  return value === "liquid" || value === "unit"
}
