import { AllProducts } from "@/app/_components/dashboard/allProducts";

export default function All() {
  return (
    <div className="max-w-2xl mx-auto w-full py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-2">Baza produktów</h2>
      <p className="text-sm text-dash-fg-muted mb-8">
        Wspólny katalog widoczny dla wszystkich użytkowników. Edycja i usuwanie
        są dostępne tylko dla administratora.
      </p>
      <AllProducts />
    </div>
  );
}
