import MapaObras from "@/components/MapaObras";

export default function Home() {
  return (
    <main className="p-8 flex flex-col gap-6 ">
      <h1 className="text-3xl font-bold text-center text-[#BC995B]">
        Mapa de Obras — Tula de Allende
      </h1>
      <p className="text-center text-[#BC995B]">
        Marcadores de obras públicas de la administración actual
      </p>

      <MapaObras />
    </main>
  );
}
