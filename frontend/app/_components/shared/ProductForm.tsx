"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { productSchema } from "@/schemas/productSchem";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { uploadImage } from "@/utils/uploadImage";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";

type Inputs = z.infer<typeof productSchema>;

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

export const ProductForm = ({
  closeModal,
  productToEdit,
}: {
  closeModal: () => void;
  productToEdit?: Product | null;
}) => {
  const initialValues = {
    name: productToEdit?.name ?? "",
    calories: productToEdit?.calories ?? 0,
    carbs: productToEdit?.carbs ?? 0,
    protein: productToEdit?.protein ?? 0,
    fat: productToEdit?.fat ?? 0,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(productSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialValues,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageFile(file ?? null);
  };

  const addProduct = async (data: Inputs) => {
    setIsLoading(true);
    setError("");

    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : null;
      const preparedData = imageUrl ? { ...data, imageUrl } : data;

      const { data: responseData, error: postError } = await apiClient.POST(
        "/products",
        {
          body: preparedData,
        },
      );

      if (postError) {
        if (postError.message === "Product already exists") {
          setError("Produkt już istnieje");
        } else {
          setError("Coś poszło nie tak");
        }
      } else if (responseData) {
        const { product } = responseData;
        showToast(
          "success",
          "Produkt dodany!",
          `${product.calories} kcal | B: ${product.protein}g W: ${product.carbs}g T: ${product.fat}g`,
        );
        closeModal();
      }
    } catch {
      setError("Coś poszło nie tak");
    } finally {
      setIsLoading(false);
    }
  };

  const editProduct = async (data: Inputs) => {
    setIsLoading(true);
    setError("");

    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : null;
      const preparedData = imageUrl ? { ...data, imageUrl } : data;

      const { data: responseData, error: patchError } = await apiClient.PATCH(
        "/products/{id}",
        {
          params: { path: { id: productToEdit!.id } },
          body: preparedData,
        },
      );

      if (patchError) {
        if (patchError.message === "Product already exists") {
          setError("Produkt już istnieje");
        } else {
          setError("Coś poszło nie tak");
        }
      } else if (responseData) {
        const { product } = responseData;
        showToast(
          "success",
          "Produkt zaktualizowany!",
          `${product.calories} kcal | B: ${product.protein}g W: ${product.carbs}g T: ${product.fat}g`,
        );
        closeModal();
      }
    } catch {
      setError("Coś poszło nie tak");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (productToEdit) {
      return await editProduct(data);
    }
    return await addProduct(data);
  };

  const submitButtonText = productToEdit ? "Zaktualizuj" : "Dodaj produkt";

  const inputClass =
    "block w-full rounded-md bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-300";

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1.5 items-center">
        <h1 className="text-center text-3xl font-bold tracking-tight text-white">
          {submitButtonText}
        </h1>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Nazwa produktu
        </label>
        <input
          type="text"
          id="name"
          className={inputClass}
          placeholder="np. Pierś z kurczaka"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="calories" className={labelClass}>
          Kalorie <span className="text-gray-500">(kcal / 100g)</span>
        </label>
        <input
          type="number"
          id="calories"
          className={inputClass}
          placeholder="0"
          {...register("calories", { valueAsNumber: true })}
        />
        {errors.calories && (
          <p className="text-sm text-red-400">{errors.calories.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="carbs" className={labelClass}>
            Węglowodany <span className="text-gray-500">(g)</span>
          </label>
          <input
            type="number"
            id="carbs"
            className={inputClass}
            placeholder="0"
            {...register("carbs", { valueAsNumber: true })}
          />
          {errors.carbs && (
            <p className="text-sm text-red-400">{errors.carbs.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="protein" className={labelClass}>
            Białko <span className="text-gray-500">(g)</span>
          </label>
          <input
            type="number"
            id="protein"
            className={inputClass}
            placeholder="0"
            {...register("protein", { valueAsNumber: true })}
          />
          {errors.protein && (
            <p className="text-sm text-red-400">{errors.protein.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fat" className={labelClass}>
            Tłuszcze <span className="text-gray-500">(g)</span>
          </label>
          <input
            type="number"
            id="fat"
            className={inputClass}
            placeholder="0"
            {...register("fat", { valueAsNumber: true })}
          />
          {errors.fat && (
            <p className="text-sm text-red-400">{errors.fat.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="imageUrl" className={labelClass}>
            Dodaj obrazek
          </label>
          <input
            type="file"
            id="imageUrl"
            className={inputClass}
            onChange={onFileChange}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 text-white"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {submitButtonText}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
};
