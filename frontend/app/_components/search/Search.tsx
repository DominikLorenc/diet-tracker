"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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
      <div className="flex flex-col gap-2">
        <form
          className="flex items-center gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            type="text"
            placeholder="Szukaj produktu..."
            className="flex-1 min-w-0 bg-dash-surface-card text-dash-fg placeholder:text-dash-fg-muted px-4 py-3 rounded-xl border border-dash-border focus:outline-none focus:border-dash-green-mid transition-colors"
            {...register("search")}
          />
          <button className="shrink-0 bg-green-600 hover:bg-green-700 transition-colors px-5 py-3 rounded-xl text-white font-semibold">
            Szukaj
          </button>
        </form>

        {isCameraSupported && (
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-dash-badge-bg border border-[var(--color-green-mid-alpha-md)] hover:border-dash-green-mid transition-colors px-3 py-2.5 rounded-xl text-dash-green text-sm font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="var(--color-dash-green)"
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
            Skanuj kod kreskowy
          </button>
        )}
      </div>

      {errors.search && (
        <div className="mt-2 text-sm text-red-400">{errors.search.message}</div>
      )}

      {error && <div className="mt-2 text-sm text-red-400">{error}</div>}

      {isLoading && (
        <div className="flex justify-center mt-8">
          <svg
            className="animate-spin h-8 w-8 text-dash-green"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold text-dash-fg-muted uppercase tracking-wider font-mono mb-3">
            Ostatnie wyszukiwania
          </h2>
          {recentSearches.map((result) => (
            <ProductCard
              key={result.id}
              product={result.product}
              // addProductToDiary={handleAddProductToDiary}
              onProductSelect={onProductSelect}
            />
          ))}
        </div>
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
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <span className="text-dash-fg-muted">Nie znaleziono produktów</span>
          {isAdmin ? (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-green-600 hover:bg-green-700 transition-colors px-5 py-2.5 rounded-xl text-white font-semibold"
            >
              + Dodaj produkt
            </button>
          ) : (
            <span className="text-dash-fg-dim text-sm">
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
