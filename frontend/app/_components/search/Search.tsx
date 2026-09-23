"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { ScanBarcode, Search as SearchIcon } from "lucide-react";
import { searchSchema } from "@/schemas/searchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "@/app/_components/shared/ProductForm";
import { Modal } from "@/app/_components/shared/Modal";
import { useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { apiClient } from "@/app/lib/apiClient";
import {
  BarcodeScannerModal,
  type ScannedProduct,
} from "@/app/_components/barcode/BarcodeScannerModal";

type Product = {
  name: string;
  id: string;
  createdAt: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
};

type RecentSearch = {
  id: string;
  userId: string;
  createdAt: string;
  productId: string;
  product: Product | null;
};

type Inputs = z.infer<typeof searchSchema>;

// Camera capability never changes at runtime, so there is nothing to subscribe
// to — a stable no-op keeps React from re-subscribing on every render.
const subscribeNoop = () => () => {};

export const Search = ({
  onProductSelect,
}: {
  onProductSelect?: (product: Product) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(searchSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);
  // UI gate only — POST /products is admin-only on the API side
  const isAdmin = useUserStore((state) => state.user?.role === "ADMIN");

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setIsSearched] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
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

  const titleId = useId();

  useEffect(() => {
    const fetchRecentSearches = async () => {
      const { data, error: fetchError } =
        await apiClient.GET("/recent-searches");

      if (data) {
        setRecentSearches(data.recentSearches);
      }

      if (fetchError) {
        showToast(
          "error",
          "Nie udało się pobrać ostatnich wyszukiwań",
          "Spróbuj ponownie",
        );
      }
    };

    fetchRecentSearches();
  }, [showToast]);

  const handleAddProductToRecentSearches = async (id: string) => {
    await apiClient.POST("/recent-searches", {
      body: {
        productId: id,
      },
    });
  };

  const handleAddProductToDiary = async (
    product: Product,
    quantity: number,
  ) => {
    const currentDate = new Date();
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");

    if (!mealType || !date) {
      return;
    }

    const { error: diaryError } = await apiClient.POST("/diary", {
      body: {
        date: currentDate.toISOString().split("T")[0],
        productId: product.id,
        quantity,
        mealType: mealType as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      },
    });

    if (diaryError) {
      showToast("error", "Nie udało się dodać wpisu", "Spróbuj ponownie");
    } else {
      const kcal = ((quantity / 100) * product.calories).toFixed(0);
      showToast("success", "Wpis dodany!", `${product.name} · ${kcal} kcal`);
    }

    await handleAddProductToRecentSearches(product.id);
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setIsLoading(true);
    setError("");

    const { data, error: searchError } = await apiClient.GET(
      "/products/search",
      {
        params: { query: { search: formData.search } },
      },
    );

    if (searchError) {
      setError("Coś poszło nie tak");
    } else if (data) {
      setResults(data.products as Product[]);
      setIsSearched(true);
    }

    setIsLoading(false);
  };

  const handleBarcodeFound = (scannedProduct: ScannedProduct) => {
    if (scannedProduct.source === "database" && scannedProduct.id) {
      setResults([
        {
          id: scannedProduct.id,
          name: scannedProduct.name,
          calories: scannedProduct.calories,
          carbs: scannedProduct.carbs,
          protein: scannedProduct.protein,
          fat: scannedProduct.fat,
          imageUrl: scannedProduct.imageUrl,
          createdAt: new Date().toISOString(),
        },
      ]);
      setIsSearched(true);
    }
  };

  return (
    <div>
      <div className="flex items-stretch">
        <form className="flex flex-1 min-w-0" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex-1 min-w-0 flex items-center gap-2 h-[52px] px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
            <SearchIcon
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
          <button className="shrink-0 px-4 border-2 border-l-0 border-ink bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent hover:border-accent transition-colors cursor-pointer">
            Szukaj
          </button>
        </form>

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
      </div>

      {errors.search && (
        <p role="alert" className="mt-2 font-mono text-xs text-accent">
          {errors.search.message}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 font-mono text-sm text-accent">
          {error}
        </p>
      )}

      {isLoading && <p className="mt-6 font-mono text-sm">Szukam…</p>}

      {recentSearches.length > 0 && (
        <section aria-labelledby="recent-searches" className="mt-7">
          <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
            <h2
              id="recent-searches"
              className="font-display text-[26px] uppercase"
            >
              Ostatnio szukane
            </h2>
            <span className="font-mono text-[11px] uppercase">
              kcal / 100 g
            </span>
          </div>
          {recentSearches.map((result) => (
            <ProductCard
              key={result.id}
              product={result.product}
              // addProductToDiary={handleAddProductToDiary}
              onProductSelect={onProductSelect}
            />
          ))}
        </section>
      )}

      <div className="mt-6">
        {results.map((result) => (
          <ProductCard
            key={result.id}
            product={result}
            addProductToDiary={handleAddProductToDiary}
            onProductSelect={onProductSelect}
          />
        ))}
      </div>

      {hasSearched && results.length === 0 && !isLoading && (
        <div className="mt-6 flex flex-col items-start gap-3 py-6 px-4 border-2 border-dashed border-ink">
          <span className="text-sm font-extrabold uppercase">
            Nie znaleziono produktów
          </span>
          {isAdmin ? (
            <button
              onClick={() => setOpenModal(true)}
              className="min-h-11 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors cursor-pointer"
            >
              + Dodaj produkt
            </button>
          ) : (
            <span className="text-sm">
              Bazę produktów uzupełnia administrator — zgłoś mu brakujący
              produkt.
            </span>
          )}
        </div>
      )}

      {isAdmin && (
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          labelledBy={titleId}
        >
          <ProductForm
            closeModal={() => setOpenModal(false)}
            titleId={titleId}
          />
        </Modal>
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
