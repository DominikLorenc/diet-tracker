import { Suspense } from "react";
import { Search } from "@/app/_components/search/Search";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";

export default function Products() {
  return (
    <div className={pageClass("narrow")}>
      <PageHeader title="Produkty" eyebrow="Baza produktów" />
      {/* Search uses useSearchParams(), which needs a Suspense boundary to prerender at build time */}
      <Suspense>
        <Search />
      </Suspense>
    </div>
  );
}
