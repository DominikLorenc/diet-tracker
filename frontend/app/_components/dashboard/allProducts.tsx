"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Search as SearchIcon } from "lucide-react";

import { ProductCard } from "../search/ProductCard";
import { Modal } from "../shared/Modal";
import { ProductForm } from "../shared/ProductForm";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { apiClient } from "@/app/lib/apiClient";
import { Button } from "../ui/Button";
import { useDebounce } from "@/app/_hooks/useDebounce";
import type { ProductCategory } from "@/app/lib/productCategories";

type Product = {
  name: string;
  id: string;
  createdAt: string;
  calories: number;
  carbs: number;
  protein: number;

  fat: number;
  imageUrl: string;
  category: ProductCategory;
};

const DEBOUNCE_DELAY = 300;
const LIMIT = 10;

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToastStore((state) => state.showToast);
  // UI gate only — the API is what actually enforces this (PATCH/DELETE are admin-only)
  const isAdmin = useUserStore((state) => state.user?.role === "ADMIN");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);
  const titleId = useId();

  const totalPages = Math.ceil(total / LIMIT);

  const handleEdit = (id: string) => {
    const product = products.find((product) => product.id === id);
    if (!product) {
      return;
    }
    setProductToEdit(product);
    setOpenModal(true);
  };

  // wyciągnięte z efektu, żeby onDelete mógł odświeżyć bieżącą stronę
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    // await w try/try-finally: bez tego ESLint (react-hooks/set-state-in-effect)
    // flaguje synchroniczny setIsLoading(true) w efekcie jako kaskadowy render
    try {
      const { data, error } = await apiClient.GET("/products", {
        params: {
          query: { search: debouncedSearch, page, limit: LIMIT },
        },
      });

      if (error) {
        showToast(
          "error",
          "Nie udało się pobrać produktów",
          "Spróbuj ponownie",
        );
      } else if (data) {
        setTotal(data.total);
        setProducts(data.products);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onDelete = async (id: string) => {
    const { error } = await apiClient.DELETE("/products/{id}", {
      params: { path: { id } },
    });
    if (error) {
      showToast("error", "Nie udało się usunąć produktu", "Spróbuj ponownie");
      return;
    }

    showToast("success", "Produkt usunięty");

    // usunięto ostatni element na stronie > 1 → cofnij stronę (zmiana page
    // sama wywoła refetch); inaczej odśwież bieżącą, by uzupełnić ją
    // produktem z następnej strony (nie zostanie 19 kart)
    if (products.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Pole szukania */}
      <label className="flex items-center gap-2 h-[52px] px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
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
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 min-w-0 bg-transparent text-base font-semibold text-ink placeholder:text-ink-muted placeholder:font-normal outline-none"
        />
      </label>

      {/* Zawartość: spinner / empty state / lista */}
      {isLoading ? (
        <p className="py-6 font-mono text-sm">Ładowanie…</p>
      ) : products.length === 0 ? (
        <div className="py-6 px-4 border-2 border-dashed border-ink text-sm font-extrabold uppercase">
          {debouncedSearch ? (
            <p>
              Brak wyników dla „
              <span className="font-mono normal-case">{debouncedSearch}</span>”
            </p>
          ) : (
            <p>Brak produktów</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <div className="flex justify-end font-mono text-[11px] uppercase pb-1 border-b-[5px] border-ink">
              kcal / 100 g
            </div>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canBeDeleted={isAdmin}
                onDelete={onDelete}
                handleEdit={handleEdit}
                canBeEdited={isAdmin}
              />
            ))}
          </div>

          {/* Paginacja — tylko gdy jest więcej niż jedna strona */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="w-full sm:w-auto"
              >
                ← Poprzednia
              </Button>

              <span className="font-mono text-sm order-first sm:order-none">
                Strona {page} z {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="w-full sm:w-auto"
              >
                Następna →
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        labelledBy={titleId}
      >
        <ProductForm
          titleId={titleId}
          closeModal={() => setOpenModal(false)}
          productToEdit={productToEdit}
          onSuccess={(product) => {
            setOpenModal(false);
            setProductToEdit(null);
            setProducts((prevProducts) =>
              prevProducts.map((prevProduct) =>
                prevProduct.id === product.id ? product : prevProduct,
              ),
            );
          }}
        />
      </Modal>
    </div>
  );
};
