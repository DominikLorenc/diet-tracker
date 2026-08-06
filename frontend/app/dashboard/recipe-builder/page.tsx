"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiClient } from "@/app/lib/apiClient";
import { recipeFormSchema } from "@/schemas/recipeSchema";
import { Search } from "@/app/_components/search/Search";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";

type Product = {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  imageUrl: string;
};

type Inputs = z.infer<typeof recipeFormSchema>;

// Pojedynczy krok na liście — osobny komponent, bo useSortable musi być
// wywołany raz na przeciągalny element, nie w pętli w rodzicu.
const SortableStepRow = ({
  id,
  index,
  register,
  onRemove,
}: {
  id: string;
  index: number;
  register: ReturnType<typeof useForm<Inputs>>["register"];
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 px-4 py-3"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Przeciągnij, aby zmienić kolejność"
        className="mt-2 shrink-0 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors touch-none"
      >
        ⠿
      </button>
      <span className="mt-2 shrink-0 w-5 text-sm font-semibold text-white/30">
        {index + 1}.
      </span>
      <textarea
        rows={2}
        placeholder="Opisz ten krok..."
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none"
        {...register(`steps.${index}.value`)}
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 shrink-0 text-white/20 hover:text-red-400 transition-colors text-sm"
      >
        🗑️
      </button>
    </div>
  );
};

function RecipeBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const isUserRecipe = searchParams.get("userRecipe") === "true";
  const returnMealType = searchParams.get("mealType");
  const returnDate = searchParams.get("date");

  const [error, setError] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | null>(null);
  const user = useUserStore((state) => state.user);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(recipeFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { name: "", products: [], steps: [] },
  });

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({ control, name: "products" });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
    move: moveStep,
  } = useFieldArray({ control, name: "steps" });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const userRole = user.role as "USER" | "ADMIN";
      setRole(userRole);

      if (!editId) return;

      if (!isUserRecipe && userRole === "ADMIN") {
        const res = await apiClient.GET("/recipes/{id}", {
          params: { path: { id: editId } },
        });
        if (res.data?.recipe) {
          const r = res.data.recipe;
          reset({
            name: r.name,
            products: r.products.map((ing) => ({
              productId: ing.productId,
              name: ing.product.name,
              imageUrl: ing.product.imageUrl,
              quantity: parseFloat(ing.quantity),
            })),
            steps: r.steps.map((step) => ({ value: step })),
          });
        }
      } else {
        const res = await apiClient.GET("/user-recipes");
        if (res.data?.userRecipes) {
          const found = res.data.userRecipes.find((r) => r.id === editId);
          if (found) {
            reset({
              name: found.name,
              products: found.userRecipeIngredients.map((ing) => ({
                productId: ing.product.id,
                name: ing.product.name,
                imageUrl: ing.product.imageUrl,
                quantity: parseFloat(ing.quantity),
              })),
              steps: found.steps.map((step) => ({ value: step })),
            });
          }
        }
      }
    };
    init();
  }, [editId, isUserRecipe, user, reset]);

  const handleAddIngredient = (product: Product) => {
    if (productFields.some((p) => p.productId === product.id)) return;
    appendProduct({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl ?? "",
      quantity: 100,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stepFields.findIndex((s) => s.id === active.id);
    const newIndex = stepFields.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      moveStep(oldIndex, newIndex);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setError("");

    const products = data.products.map((p) => ({
      productId: p.productId,
      quantity: p.quantity,
    }));
    // Puste kroki (np. dodany, ale nieuzupełniony wiersz) po prostu pomijamy —
    // walidacja po stronie backendu i tak by je odrzuciła.
    const steps = data.steps.map((s) => s.value.trim()).filter(Boolean);

    let saveError: unknown = null;

    if (!isUserRecipe && role === "ADMIN") {
      if (editId) {
        const { error } = await apiClient.PATCH("/recipes/{id}", {
          params: { path: { id: editId } },
          body: { name: data.name, products, steps },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/recipes", {
          body: { name: data.name, products, steps },
        });
        saveError = error;
      }
    } else {
      if (editId) {
        const { error } = await apiClient.PATCH("/user-recipes/{id}", {
          params: { path: { id: editId } },
          body: { name: data.name, products, steps },
        });
        saveError = error;
      } else {
        const { error } = await apiClient.POST("/user-recipes", {
          body: { name: data.name, products, steps },
        });
        saveError = error;
      }
    }

    if (saveError) {
      setError("Nie udało się zapisać przepisu");
    } else {
      const params = new URLSearchParams({ tab: "recipes" });
      if (returnMealType) params.set("mealType", returnMealType);
      if (returnDate) params.set("date", returnDate);
      router.push(`/dashboard/add?${params.toString()}`);
    }
  };

  const pageTitle = editId
    ? "Edytuj przepis"
    : role === "ADMIN"
      ? "Nowy przepis globalny"
      : "Nowy przepis";

  return (
    // Zwykły <div>, nie <form> — Search poniżej renderuje własny <form> do
    // wyszukiwania, a HTML nie pozwala zagnieżdżać formularzy. handleSubmit
    // odpalamy ręcznie z przycisku zapisu.
    <div className="flex flex-col gap-4 p-6 w-full">
      <h2 className="text-2xl font-bold text-white">{pageTitle}</h2>

      {/* Nazwa przepisu */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Nazwa przepisu
          </h3>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            placeholder="np. Owsianka z owocami..."
            className="w-full bg-transparent text-white placeholder-white/20 focus:outline-none"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-red-400 text-sm">{errors.name.message}</span>
          )}
        </div>
      </div>

      {/* Wyszukiwarka składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Dodaj składniki
          </h3>
        </div>
        <div className="px-4 py-3">
          <Search onProductSelect={handleAddIngredient} />
        </div>
      </div>

      {/* Lista składników */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Składniki ({productFields.length})
          </h3>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {productFields.length === 0 ? (
            <p className="px-4 py-3 text-sm text-white/20">
              Brak składników — wyszukaj i dodaj produkty powyżej.
            </p>
          ) : (
            productFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-4 px-4 py-3">
                {field.imageUrl ? (
                  <Image
                    src={field.imageUrl}
                    alt={field.name}
                    width={32}
                    height={32}
                    className="rounded-lg shrink-0 w-10 h-10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                )}
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {field.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-white/20 hover:text-red-400 transition-colors text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <input
                      type="number"
                      onFocus={(e) => e.target.select()}
                      className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-white focus:outline-none focus:border-indigo-500"
                      {...register(`products.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                    <span>g</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {errors.products?.root && (
          <p className="px-4 pb-3 text-red-400 text-sm">
            {errors.products.root.message}
          </p>
        )}
      </div>

      {/* Kroki przygotowania */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Jak to zrobić?{" "}
            <span className="normal-case text-white/30">(opcjonalne)</span>
          </h3>
        </div>
        {stepFields.length === 0 ? (
          <p className="px-4 py-3 text-sm text-white/20">
            Brak kroków — dodaj instrukcję przygotowania krok po kroku.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stepFields.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col divide-y divide-white/5">
                {stepFields.map((field, index) => (
                  <SortableStepRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    register={register}
                    onRemove={() => removeStep(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <div className="px-4 py-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => appendStep({ value: "" })}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            + Dodaj krok
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors px-5 py-2 rounded-lg text-white font-medium w-fit"
      >
        {isSubmitting
          ? "Zapisuję..."
          : editId
            ? "Zapisz zmiany"
            : "Zapisz przepis"}
      </button>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </div>
  );
}

export default function RecipeBuilder() {
  return (
    <Suspense>
      <RecipeBuilderContent />
    </Suspense>
  );
}
