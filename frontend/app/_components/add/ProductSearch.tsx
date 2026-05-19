"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { AddProductCard } from "./ProductCard";
import {
  BarcodeScannerModal,
  type ScannedProduct,
} from "@/app/_components/barcode/BarcodeScannerModal";

const searchSchema = z.object({
  search: z.string().min(1, "Wpisz nazwę produktu"),
});
type SearchInputs = z.infer<typeof searchSchema>;

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
  createdAt: string;
};

type ProductFavorite = {
  id: string;
  productId: string;
  product: Product;
};

type RecentSearch = {
  id: string;
  productId: string;
  product: Product | null;
};

type Props = {
  onGoToNewProduct: () => void;
  newlyCreatedProduct?: Product | null;
};

export const ProductSearch = ({
  onGoToNewProduct,
  newlyCreatedProduct,
}: Props) => {
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<ProductFavorite[]>(
    [],
  );
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [hasSearchedState, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedProductIdState, setExpandedProductId] = useState<
    string | null
  >(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraSupported] = useState(
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchInputs>({
    resolver: zodResolver(searchSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Ładujemy ostatnie wyszukiwania i ulubione przy pierwszym renderze
  useEffect(() => {
    // TODO(human): pobierz dane z API:
    //   1. GET /recent-searches  → setRecentSearches(data.recentSearches)
    //   2. GET /favorites/products → setFavoriteProducts(data.favorites)
    // Użyj Promise.all żeby oba requesty leciały równolegle

    const load = async () => {
      const [recentRes, favRes] = await Promise.all([
        apiClient.GET("/recent-searches"),
        apiClient.GET("/favorites/products"),
      ]);
      if (recentRes.data)
        setRecentSearches(
          recentRes.data.recentSearches as unknown as RecentSearch[],
        );
      if (favRes.data)
        setFavoriteProducts(
          favRes.data.favorites as unknown as ProductFavorite[],
        );
    };
    load();
  }, []);

  const displayedProducts = newlyCreatedProduct
    ? [newlyCreatedProduct]
    : searchResults;
  const hasSearched = hasSearchedState || !!newlyCreatedProduct;
  const expandedProductId = newlyCreatedProduct?.id ?? expandedProductIdState;

  const favoriteIds = new Set(favoriteProducts.map((f) => f.productId));

  const addToDiary = async (product: Product, quantity: number) => {
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");

    if (!mealType || !date) {
      showToast(
        "error",
        "Brak parametrów",
        "Wróć do dziennika i spróbuj ponownie",
      );
      return;
    }

    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        productId: product.id,
        quantity,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });

    if (error) {
      showToast("error", "Błąd", "Nie udało się dodać wpisu");
    } else {
      const kcal = ((quantity / 100) * product.calories).toFixed(0);
      showToast("success", "Dodano!", `${product.name} · ${kcal} kcal`);
      await apiClient.POST("/recent-searches", {
        body: { productId: product.id },
      });
    }
  };

  const onSubmit: SubmitHandler<SearchInputs> = async ({ search }) => {
    setIsSearching(true);

    const { data, error } = await apiClient.GET("/products/search", {
      params: { query: { search } },
    });
    setIsSearching(false);
    if (error) {
      showToast("error", "Błąd wyszukiwania", "Spróbuj ponownie");
    } else if (data) {
      setSearchResults(data.products as Product[]);
      setHasSearched(true);
    }
  };

  const handleBarcodeFound = (scannedProduct: ScannedProduct) => {
    if (scannedProduct.source === "database" && scannedProduct.id) {
      const product: Product = {
        id: scannedProduct.id,
        name: scannedProduct.name,
        calories: scannedProduct.calories,
        carbs: scannedProduct.carbs,
        protein: scannedProduct.protein,
        fat: scannedProduct.fat,
        imageUrl: scannedProduct.imageUrl,
        createdAt: new Date().toISOString(),
      };
      setSearchResults([product]);
      setHasSearched(true);
      setExpandedProductId(product.id);
    }
  };

  const recentProducts = recentSearches
    .filter((r) => r.product !== null)
    .map((r) => r.product as Product)
    .slice(0, 5);

  const showInitialState = !hasSearched;

  return (
    <div>
      {/* ── Pasek wyszukiwania + przycisk "Nowy produkt" ── */}
      <div className="flex items-center gap-2 mb-5">
        <form
          className="flex items-center gap-2 flex-1"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Pole wyszukiwania */}
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="#8FA0B8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Szukaj produktu..."
              className="w-full bg-[#1A2420] text-white placeholder-[#4A5A4A] pl-10 pr-4 py-2.5 rounded-xl border border-[#1E3322] focus:outline-none focus:border-[#22C55E] text-sm transition-colors"
              {...register("search")}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 transition-colors px-4 py-2.5 rounded-xl text-white font-semibold text-sm"
          >
            Szukaj
          </button>
        </form>

        {/* Przycisk skanera kodu kreskowego */}
        {isCameraSupported && (
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            title="Skanuj kod kreskowy"
            className="shrink-0 flex items-center gap-1.5 bg-[#1A2E1A] border border-[#22C55E40] hover:border-[#22C55E] transition-colors px-3 py-2.5 rounded-xl text-[#4ADE80]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="#4ADE80"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <line x1="14" y1="14" x2="14" y2="21" />
              <line x1="14" y1="14" x2="21" y2="14" />
              <line x1="21" y1="17" x2="21" y2="21" />
              <line x1="17" y1="21" x2="21" y2="21" />
            </svg>
          </button>
        )}

        {/* Przycisk nowego produktu — zawsze widoczny */}
        <button
          onClick={onGoToNewProduct}
          className="shrink-0 flex items-center gap-1.5 bg-[#1A2E1A] border border-[#22C55E40] hover:border-[#22C55E] transition-colors px-3 py-2.5 rounded-xl text-[#4ADE80] text-sm font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nowy
        </button>
      </div>

      {errors.search && (
        <p className="text-red-400 text-xs mb-3">{errors.search.message}</p>
      )}

      {/* ── Wyniki wyszukiwania ── */}
      {hasSearched && (
        <div>
          {isSearching && (
            <p className="text-[#8FA0B8] text-sm text-center py-6">Szukam...</p>
          )}
          {!isSearching && displayedProducts.length === 0 && (
            <div className="text-center py-8 bg-[#111C14] rounded-xl border border-[#1E3322]">
              <p className="text-[#8FA0B8] mb-3 text-sm">
                Nie znaleziono produktu
              </p>
              <button
                onClick={onGoToNewProduct}
                className="text-[#4ADE80] text-sm font-semibold underline underline-offset-2"
              >
                Nie znaleziono? → Dodaj nowy produkt
              </button>
            </div>
          )}
          {displayedProducts.map((product) => (
            <AddProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.has(product.id)}
              onAddToDiary={addToDiary}
              defaultExpanded={expandedProductId === product.id}
              onFavoriteToggle={(id, now) => {
                // TODO(human): zaktualizuj lokalny stan favoriteProducts
                // - jeśli now === true → dodaj tymczasowy obiekt do listy
                // - jeśli now === false → usuń z listy

                if (now) {
                  setFavoriteProducts((prev) => [
                    ...prev,
                    { id: `temp-${id}`, productId: id, product },
                  ]);
                } else {
                  setFavoriteProducts((prev) =>
                    prev.filter((f) => f.productId !== id),
                  );
                }
              }}
            />
          ))}
        </div>
      )}

      {/* ── Stan początkowy: Ostatnio jedzone + Ulubione ── */}
      {showInitialState && (
        <div className="flex flex-col gap-5">
          {/* Ostatnio jedzone */}
          {recentProducts.length > 0 && (
            <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
                  Ostatnio jedzone
                </h2>
                <span className="text-[#4A5A4A] text-xs">
                  {recentProducts.length} produktów
                </span>
              </div>
              {recentProducts.map((product) => (
                <AddProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteIds.has(product.id)}
                  onAddToDiary={addToDiary}
                  onFavoriteToggle={(id, now) => {
                    if (now) {
                      setFavoriteProducts((prev) => [
                        ...prev,
                        { id: `temp-${id}`, productId: id, product },
                      ]);
                    } else {
                      setFavoriteProducts((prev) =>
                        prev.filter((f) => f.productId !== id),
                      );
                    }
                  }}
                />
              ))}
            </section>
          )}

          {/* Ulubione produkty */}
          {favoriteProducts.length > 0 && (
            <section className="bg-[#111C14] rounded-xl border border-[#1E3322] p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[#4ADE80] font-mono text-xs font-bold tracking-widest uppercase">
                  Ulubione produkty
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width={13}
                  height={13}
                  fill="#4ADE80"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              {favoriteProducts.map((fav) => (
                <AddProductCard
                  key={fav.id}
                  product={fav.product}
                  isFavorite
                  onAddToDiary={addToDiary}
                  onFavoriteToggle={(id, now) => {
                    if (!now) {
                      setFavoriteProducts((prev) =>
                        prev.filter((f) => f.productId !== id),
                      );
                    }
                  }}
                />
              ))}
            </section>
          )}

          {/* Stan pusty — brak historii i ulubionych */}
          {recentProducts.length === 0 && favoriteProducts.length === 0 && (
            <div className="text-center py-12 bg-[#111C14] rounded-xl border border-[#1E3322]">
              <p className="text-[#4A5A4A] text-sm">
                Wyszukaj produkt lub dodaj nowy
              </p>
            </div>
          )}
        </div>
      )}

      <BarcodeScannerModal
        key={isScannerOpen ? "open" : "closed"}
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={handleBarcodeFound}
      />
    </div>
  );
};
