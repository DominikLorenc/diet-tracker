"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { searchSchema } from "@/schemas/searchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "@/app/_components/shared/ProductForm";
import { Modal } from "@/app/_components/shared/Modal";
import { useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";

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
  createdAt: Date;
  productId: string;
  product: Product;
};

type Inputs = z.infer<typeof searchSchema>;

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

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setIsSearched] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [openMoadl, setOpenModal] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recent-searches`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        const data = await response.json();
        throw new Error(data.message);
      })
      .then((data) => {
        setRecentSearches(data.recentSearches);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleAddProductToRecentSearches = (id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recent-searches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        productId: id,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        const data = await response.json();
        throw new Error(data.message);
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
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

    handleAddProductToRecentSearches(product.id);
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

  return (
    <div>
      <form
        className="flex items-center gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          type="text"
          placeholder="Szukaj produktu..."
          className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-indigo-500"
          {...register("search")}
        />
        <button className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-5 py-2 rounded-lg text-white font-medium">
          Szukaj
        </button>
      </form>

      {errors.search && (
        <div className="mt-2 text-sm text-red-400">{errors.search.message}</div>
      )}

      {error && <div className="mt-2 text-sm text-red-400">{error}</div>}

      {isLoading && (
        <div className="flex justify-center mt-8">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500"
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
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4">
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
          <span className="text-gray-400">Nie znaleziono produktów</span>
          <button
            onClick={() => setOpenModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors px-5 py-2 rounded-lg text-white font-medium"
          >
            + Dodaj produkt
          </button>
        </div>
      )}

      <Modal open={openMoadl} onClose={() => setOpenModal(false)}>
        <ProductForm closeModal={() => setOpenModal(false)} />
      </Modal>
    </div>
  );
};
