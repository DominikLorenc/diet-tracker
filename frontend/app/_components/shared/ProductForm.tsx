"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { ScanBarcode } from "lucide-react";
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
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/app/lib/productCategories";

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
  category: ProductCategory;
  gramsPerUnit?: number;
};

export const ProductForm = ({
  closeModal = () => {},
  onSuccess,
  productToEdit,
  titleId,
}: {
  closeModal?: () => void;
  onSuccess?: (product: Product) => void;
  productToEdit?: Product | null;
  // Set by a parent that needs to point aria-labelledby at this heading.
  titleId?: string;
}) => {
  const initialValues = {
    name: productToEdit?.name ?? "",
    calories: productToEdit?.calories ?? 0,
    carbs: productToEdit?.carbs ?? 0,
    protein: productToEdit?.protein ?? 0,
    fat: productToEdit?.fat ?? 0,
    barcode: productToEdit?.barcode ?? "",
    // Left undefined on create so the admin has to pick a category explicitly
    // rather than silently accepting whichever option renders first.
    category: productToEdit?.category,
    gramsPerUnit: productToEdit?.gramsPerUnit,
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
      const { barcode, ...dataWithoutBarcode } = data;
      const dataWithBarcode = barcode ? data : dataWithoutBarcode;
      const preparedData = imageUrl
        ? { ...dataWithBarcode, imageUrl }
        : dataWithBarcode;

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
    "block w-full h-12 bg-card border-2 border-ink px-3 font-mono text-[15px] text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-2 focus:outline-accent file:mr-3 file:h-full file:border-0 file:bg-ink file:px-3 file:text-paper file:font-sans file:text-xs file:font-extrabold file:uppercase";
  const labelClass = "block text-[13px] font-extrabold uppercase";

  return (
    <>
      {isCameraSupported && !productToEdit && (
        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center justify-center gap-2 w-full min-h-12 border-2 border-ink text-sm font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer mb-4"
        >
          <ScanBarcode size={18} strokeWidth={2} strokeLinecap="square" />
          Wypełnij ze skanu kodu kreskowego
        </button>
      )}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1 id={titleId} className="font-display text-[34px] leading-none">
            {productToEdit ? "Edytuj produkt" : "Nowy produkt"}
          </h1>
          <div className="rule-thick mt-2" />
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
            <p role="alert" className="font-mono text-xs text-accent">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className={labelClass}>
            Kategoria
          </label>
          {/* defaultValue="" keeps the placeholder selected on create; "" is not
              a valid enum value, so submitting it fails validation by design. */}
          <select
            id="category"
            className={inputClass}
            defaultValue=""
            {...register("category")}
          >
            <option value="" disabled>
              Wybierz kategorię…
            </option>
            {CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          {errors.category && (
            <p role="alert" className="font-mono text-xs text-accent">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="calories" className={labelClass}>
            Kalorie{" "}
            <span className="font-mono font-normal normal-case text-ink-muted">
              (kcal / 100g)
            </span>
          </label>
          <input
            type="number"
            id="calories"
            className={inputClass}
            placeholder="0"
            step="any"
            onFocus={(e) => e.target.select()}
            {...register("calories", { valueAsNumber: true })}
          />
          {errors.calories && (
            <p role="alert" className="font-mono text-xs text-accent">
              {errors.calories.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="gramsPerUnit" className={labelClass}>
            Waga sztuki{" "}
            <span className="font-mono font-normal normal-case text-ink-muted">
              (g, opcjonalne)
            </span>
          </label>
          <input
            type="number"
            id="gramsPerUnit"
            className={inputClass}
            placeholder="np. 80 dla jajka"
            step="any"
            onFocus={(e) => e.target.select()}
            {...register("gramsPerUnit", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.gramsPerUnit && (
            <p role="alert" className="font-mono text-xs text-accent">
              {errors.gramsPerUnit.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="carbs" className={labelClass}>
              Węglowodany{" "}
              <span className="font-mono font-normal normal-case text-ink-muted">
                (g)
              </span>
            </label>
            <input
              type="number"
              id="carbs"
              className={inputClass}
              placeholder="0"
              step="any"
              onFocus={(e) => e.target.select()}
              {...register("carbs", { valueAsNumber: true })}
            />
            {errors.carbs && (
              <p role="alert" className="font-mono text-xs text-accent">
                {errors.carbs.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="protein" className={labelClass}>
              Białko{" "}
              <span className="font-mono font-normal normal-case text-ink-muted">
                (g)
              </span>
            </label>
            <input
              type="number"
              id="protein"
              className={inputClass}
              placeholder="0"
              step="any"
              onFocus={(e) => e.target.select()}
              {...register("protein", { valueAsNumber: true })}
            />
            {errors.protein && (
              <p role="alert" className="font-mono text-xs text-accent">
                {errors.protein.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fat" className={labelClass}>
              Tłuszcze{" "}
              <span className="font-mono font-normal normal-case text-ink-muted">
                (g)
              </span>
            </label>
            <input
              type="number"
              id="fat"
              className={inputClass}
              placeholder="0"
              step="any"
              onFocus={(e) => e.target.select()}
              {...register("fat", { valueAsNumber: true })}
            />
            {errors.fat && (
              <p role="alert" className="font-mono text-xs text-accent">
                {errors.fat.message}
              </p>
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
                className="object-contain border border-ink"
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
            Kod kreskowy{" "}
            <span className="font-mono font-normal normal-case text-ink-muted">
              (opcjonalne)
            </span>
          </label>
          <input
            type="text"
            id="barcode"
            className={inputClass}
            placeholder="np. 5901234123457"
            {...register("barcode")}
          />
          {errors.barcode && (
            <p role="alert" className="font-mono text-xs text-accent">
              {errors.barcode.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full min-h-14 bg-ink hover:bg-accent text-base font-extrabold uppercase tracking-wide text-paper disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-current"
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
        {error && (
          <p role="alert" className="font-mono text-xs text-accent">
            {error}
          </p>
        )}
      </form>
      {/* Mount only while open so the scanner unmounts on close and its
          internal state resets — otherwise it stays stuck on "loading". */}
      {isScannerOpen && (
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onProductFound={handleBarcodeFound}
          onNotFound={(code) => setValue("barcode", code)}
          intent="add"
        />
      )}
    </>
  );
};
