export type VariantTipo = "liquid" | "unit"

export const VARIANT_PRESETS: Record<
  VariantTipo,
  { label: string; description: string; names: readonly string[] }
> = {
  liquid: {
    label: "Productos sueltos (litros)",
    description: "X1litro, X5litros y X20litros",
    names: ["X1litro", "X5litros", "X20litros"],
  },
  unit: {
    label: "Por unidades",
    description: "X1U, X6U y X12U",
    names: ["X1U", "X6U", "X12U"],
  },
}

export function getVariantPresetNames(tipo: VariantTipo) {
  return [...VARIANT_PRESETS[tipo].names]
}

export function getVariantPickerLabel(tipo?: VariantTipo | null) {
  if (tipo === "liquid") return "Elegí el volumen"
  if (tipo === "unit") return "Elegí la presentación"
  return "Elegí una variante"
}

export function hydrateVariantsFromPreset(
  tipo: VariantTipo,
  source: Array<{ nombre: string; precio: number | string }>,
) {
  const names = getVariantPresetNames(tipo)
  return names.map((nombre) => {
    const match = source.find((variant) => variant.nombre === nombre)
    return {
      nombre,
      precio: match ? String(match.precio) : "",
    }
  })
}

export function isVariantTipo(value: unknown): value is VariantTipo {
  return value === "liquid" || value === "unit"
}
