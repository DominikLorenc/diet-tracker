import { AllProducts } from "@/app/_components/dashboard/allProducts";

export default function All() {
  return (
    <div className="max-w-2xl mx-auto w-full py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-8">Wszystkie produkty</h2>
      <AllProducts />
    </div>
  );
}
