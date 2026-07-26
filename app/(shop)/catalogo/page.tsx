import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams

  if (categoria) {
    redirect(`/?categoria=${encodeURIComponent(categoria)}#catalogo`)
  }

  redirect("/#catalogo")
}
