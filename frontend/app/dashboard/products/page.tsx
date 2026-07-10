import { Suspense } from "react";
import { Search } from "@/app/_components/search/Search";

export default function Products() {
  return (
    <div className="max-w-2xl mx-auto w-full py-8 px-4 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-dash-fg mb-6">
        Produkty
      </h2>
      {/* Search uses useSearchParams(), which needs a Suspense boundary to prerender at build time */}
      <Suspense>
        <Search />
      </Suspense>
    </div>
  );
}
