"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { searchSchema } from "@/schemas/searchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "@/app/_components/shared/ProductForm";
import { Modal } from "@/app/_components/shared/Modal";
import { useSearchParams } from "next/navigation";

type Product = {
  name: string;
  id: string;
  createdAt: Date;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
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

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setIsSearched] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [openMoadl, setOpenModal] = useState(false);

  const handleAddProductToDiary = (id: string, quantity: number) => {
    const currentDate = new Date();
    const mealType = searchParams.get("mealType");
    const date = searchParams.get("date");

    if (!mealType || !date) {
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/diary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userId: searchParams.get("userId"),
        date: currentDate.toISOString().split("T")[0],
        productId: id,
        quantity,
        mealType,
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

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/search?q=${data.search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (response.ok) {
        const responseJson = (await response.json()) as { products: Product[] };
        setResults(responseJson.products);
        setIsSearched(true);
      } else {
        setError("Coś poszło nie tak");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
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
