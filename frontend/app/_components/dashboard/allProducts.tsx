"use client";

import { useCallback, useEffect, useState } from "react";

import { ProductCard } from "../search/ProductCard";
import { Modal } from "../shared/Modal";
import { ProductForm } from "../shared/ProductForm";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";
import { Spinner } from "../ui/Spinner";
import { Button } from "../ui/Button";
import { useDebounce } from "@/app/_hooks/useDebounce";

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

const DEBOUNCE_DELAY = 300;
const LIMIT = 10;

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToastStore((state) => state.showToast);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, DEBOUNCE_DELAY);

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
    <div className="mt-8 flex flex-col gap-6">
      {/* Pole szukania */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          placeholder="Szukaj produktu..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-gray-800 text-white placeholder-gray-500 pl-11 pr-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Zawartość: spinner / empty state / lista */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {debouncedSearch ? (
            <p className="text-gray-400">
              Brak wyników dla „
              <span className="text-white">{debouncedSearch}</span>”
            </p>
          ) : (
            <p className="text-gray-500">Brak produktów</p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                canBeDeleted
                onDelete={onDelete}
                handleEdit={handleEdit}
                canBeEdited
              />
            ))}
          </div>

          {/* Paginacja — tylko gdy jest więcej niż jedna strona */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                ← Poprzednia
              </Button>

              <span className="text-sm text-dash-fg-muted">
                Strona {page} z {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Następna →
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ProductForm
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
