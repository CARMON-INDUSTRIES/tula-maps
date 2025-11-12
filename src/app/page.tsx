import MapaObras from "@/components/MapaObras";

export default function Home() {
  return (
    <main className="p-8 flex flex-col gap-6 ">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Mapa de Obras — Tula de Allende
      </h1>
      <p className="text-center text-gray-500">
        Marcadores de obras públicas recientes
      </p>

      <MapaObras />
    </main>
  );
}
