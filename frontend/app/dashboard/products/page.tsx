import { Search } from "@/app/_components/search/Search";

export default function Products() {
  return (
    <div className="max-w-2xl mx-auto w-full py-10 px-6">
      <h2 className="text-3xl font-bold text-white mb-8">Produkty</h2>
      <Search />
    </div>
  );
}
