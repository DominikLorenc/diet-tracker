import { AllProducts } from "@/app/_components/dashboard/allProducts";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";

export default function All() {
  return (
    <div className={pageClass("narrow")}>
      <PageHeader title="Baza produktów" eyebrow="Tylko administrator" />
      <p className="text-sm -mt-2">
        Wspólny katalog widoczny dla wszystkich użytkowników. Edycja i usuwanie
        są dostępne tylko dla administratora.
      </p>
      <AllProducts />
    </div>
  );
}
