"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { productSchema } from "@/schemas/productSchem";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/utils/uploadImage";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";
import {
  BarcodeScannerModal,
  type ScannedProduct,
} from "@/app/_components/barcode/BarcodeScannerModal";

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
  barcode?: string;
};

export const ProductForm = ({
  closeModal = () => {},
  onSuccess,
  productToEdit,
}: {
  closeModal?: () => void;
  onSuccess?: (product: Product) => void;
  productToEdit?: Product | null;
}) => {
  const initialValues = {
    name: productToEdit?.name ?? "",
    calories: productToEdit?.calories ?? 0,
    carbs: productToEdit?.carbs ?? 0,
    protein: productToEdit?.protein ?? 0,
    fat: productToEdit?.fat ?? 0,
    barcode: productToEdit?.barcode ?? "",
  };

  const {
    register,
    handleSubmit,
    setValue,
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
  const [offImageUrl, setOffImageUrl] = useState<string>("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(false);

  useEffect(() => {
    setIsCameraSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);
  const showToast = useToastStore((state) => state.showToast);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageFile(file ?? null);
  };

  const addProduct = async (data: Inputs) => {
    setIsLoading(true);
    setError("");

    try {
      const imageUrl = imageFile
        ? await uploadImage(imageFile)
        : offImageUrl || null;
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
        onSuccess?.(product as Product);
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

      const { barcode, ...dataWithoutBarcode } = preparedData;
      const body = barcode ? preparedData : dataWithoutBarcode;

      const { data: responseData, error: patchError } = await apiClient.PATCH(
        "/products/{id}",
        {
          params: { path: { id: productToEdit!.id } },
          body,
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
        if (onSuccess) {
          onSuccess(product as Product);
        }

        closeModal();
      }
    } catch {
      setError("Coś poszło nie tak");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeFound = (scannedProduct: ScannedProduct) => {
    setValue("name", scannedProduct.name);
    setValue("calories", scannedProduct.calories);
    setValue("protein", scannedProduct.protein);
    setValue("carbs", scannedProduct.carbs);
    setValue("fat", scannedProduct.fat);
    setValue("barcode", scannedProduct.barcode);
    if (scannedProduct.imageUrl) setOffImageUrl(scannedProduct.imageUrl);
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (productToEdit) {
      return await editProduct(data);
    }
    return await addProduct(data);
  };

  const submitButtonText = productToEdit ? "Zaktualizuj" : "Dodaj produkt";

  const inputClass =
    "block w-full rounded-xl bg-[var(--background)] border border-dash-border px-3 py-2.5 text-sm text-white placeholder:text-dash-svg-inactive focus:outline-none focus:border-dash-green-mid transition-colors";
  const labelClass =
    "block text-xs font-bold text-dash-fg-muted uppercase tracking-wider font-mono";

  return (
    <>
      {isCameraSupported && !productToEdit && (
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-dash-badge-bg border border-[var(--color-green-mid-alpha-md)] hover:border-dash-green-mid transition-colors px-3 py-2.5 text-dash-green text-sm font-semibold mb-2"
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
            step="any"
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
              step="any"
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
              step="any"
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
              step="any"
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
            {offImageUrl && !imageFile && (
              <Image
                src={offImageUrl}
                alt="Podgląd z Open Food Facts"
                width={80}
                height={80}
                className="object-contain rounded-lg border border-dash-border"
              />
            )}
            <input
              type="file"
              id="imageUrl"
              className={inputClass}
              onChange={(e) => {
                onFileChange(e);
                setOffImageUrl("");
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="barcode" className={labelClass}>
            Kod kreskowy <span className="text-gray-500">(opcjonalne)</span>
          </label>
          <input
            type="text"
            id="barcode"
            className={inputClass}
            placeholder="np. 5901234123457"
            {...register("barcode")}
          />
          {errors.barcode && (
            <p className="text-sm text-red-400">{errors.barcode.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-green-600 hover:bg-green-700 px-3 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
      {/* Mount only while open so the scanner unmounts on close and its
          internal state resets — otherwise it stays stuck on "loading". */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onProductFound={handleBarcodeFound}
        />
      )}
    </>
  );
};
