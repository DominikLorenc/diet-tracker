"use client";

import { pluralPl } from "@/utils/format";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
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
import { Plus, ScanBarcode, Search } from "lucide-react";

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
  gramsPerUnit?: number | null;
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
  /** Omitted when the viewer may not create products — hides every entry point to the form */
  onGoToNewProduct?: () => void;
  newlyCreatedProduct?: Product | null;
  setNewlyCreatedProduct?: Dispatch<SetStateAction<Product | null>>;
};

// Camera capability never changes at runtime, so there is nothing to subscribe
// to — a stable no-op keeps React from re-subscribing on every render.
const subscribeNoop = () => () => {};

export const ProductSearch = ({
  onGoToNewProduct,
  newlyCreatedProduct,
  setNewlyCreatedProduct,
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
  // Read the camera capability in an SSR-safe way: useSyncExternalStore returns
  // the server snapshot (false) during SSR and the first hydration render — so the
  // client's first render matches the server HTML — then swaps to the real client
  // value. No setState-in-effect, no double render, no hydration mismatch.
  const isCameraSupported = useSyncExternalStore(
    subscribeNoop,
    () => !!navigator.mediaDevices?.getUserMedia, // client snapshot
    () => false, // server snapshot (also used for the first client render)
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

  useEffect(() => {
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

    const today = new Date().toISOString().split("T")[0];
    const isToday = date === today;

    const { error } = await apiClient.POST("/diary", {
      body: {
        date,
        productId: product.id,
        quantity,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
        isEaten: isToday,
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
      setNewlyCreatedProduct?.(null);
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
        gramsPerUnit: scannedProduct.gramsPerUnit,
      };
      setNewlyCreatedProduct?.(null);
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
      {/* ── Pasek wyszukiwania + skaner + "Nowy produkt" ── */}
      <div className="flex items-stretch mb-2">
        <form className="flex flex-1 min-w-0" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex-1 min-w-0 flex items-center gap-2 h-[52px] px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
            <Search
              size={18}
              strokeWidth={2.5}
              strokeLinecap="square"
              aria-hidden="true"
            />
            <span className="sr-only">Szukaj produktu</span>
            <input
              type="text"
              placeholder="Szukaj produktu…"
              className="flex-1 min-w-0 bg-transparent text-base font-semibold text-ink placeholder:text-ink-muted placeholder:font-normal outline-none"
              {...register("search")}
            />
          </label>
          <button
            type="submit"
            disabled={isSearching}
            className="shrink-0 px-4 border-2 border-l-0 border-ink bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent hover:border-accent disabled:opacity-60 transition-colors cursor-pointer"
          >
            Szukaj
          </button>
        </form>

        {/* Przycisk skanera kodu kreskowego */}
        {isCameraSupported && (
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            aria-label="Skanuj kod kreskowy"
            title="Skanuj kod kreskowy"
            className="shrink-0 w-14 border-2 border-l-0 border-ink flex items-center justify-center hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            <ScanBarcode size={24} strokeWidth={2} strokeLinecap="square" />
          </button>
        )}

        {/* Przycisk nowego produktu — tylko dla admina */}
        {onGoToNewProduct && (
          <button
            onClick={onGoToNewProduct}
            className="shrink-0 flex items-center gap-1 px-3 border-2 border-l-0 border-ink text-sm font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} strokeLinecap="square" />
            <span className="hidden sm:inline">Nowy</span>
            <span className="sr-only sm:hidden">Nowy produkt</span>
          </button>
        )}
      </div>

      {errors.search && (
        <p role="alert" className="font-mono text-accent text-xs mb-3">
          {errors.search.message}
        </p>
      )}

      {/* ── Wyniki wyszukiwania ── */}
      {hasSearched && (
        <div>
          <div className="flex justify-between font-mono text-[11px] uppercase mt-3 pb-1 border-b-[5px] border-ink">
            <span>
              {isSearching
                ? "Szukam…"
                : pluralPl(displayedProducts.length, {
                    one: "wynik",
                    few: "wyniki",
                    many: "wyników",
                  })}
            </span>
            <span>kcal / 100 g</span>
          </div>
          {!isSearching && displayedProducts.length === 0 && (
            <div className="mt-3 py-6 px-4 border-2 border-dashed border-ink">
              <p className="mb-2 text-sm font-extrabold uppercase">
                Nie znaleziono produktu
              </p>
              {onGoToNewProduct ? (
                <button
                  onClick={onGoToNewProduct}
                  className="text-accent text-sm font-extrabold uppercase min-h-11 cursor-pointer"
                >
                  Nie znaleziono? → Dodaj nowy produkt
                </button>
              ) : (
                <p className="text-sm">
                  Bazę produktów uzupełnia administrator — zgłoś mu brakujący
                  produkt.
                </p>
              )}
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
        <div className="flex flex-col gap-7 mt-4">
          {/* Ostatnio jedzone */}
          {recentProducts.length > 0 && (
            <section aria-labelledby="recent-heading">
              <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
                <h2
                  id="recent-heading"
                  className="font-display text-[26px] uppercase"
                >
                  Ostatnio jedzone
                </h2>
                <span className="font-mono text-[11px] uppercase">
                  kcal / 100 g
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
            <section aria-labelledby="favorites-heading">
              <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
                <h2
                  id="favorites-heading"
                  className="font-display text-[26px] uppercase"
                >
                  Ulubione
                </h2>
                <span className="font-mono text-[11px] uppercase">
                  kcal / 100 g
                </span>
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
            <div className="py-10 px-4 border-2 border-dashed border-ink">
              <p className="text-sm font-extrabold uppercase">
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
