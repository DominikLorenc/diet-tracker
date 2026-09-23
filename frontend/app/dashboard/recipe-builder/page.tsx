"use client";

import { useEffect, useState, Suspense } from "react";
import { ProductThumb } from "@/app/_components/ui/ProductThumb";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";
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
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-1 py-2 border-b border-ink bg-paper"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Przeciągnij, aby zmienić kolejność"
        className="w-9 h-11 shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} strokeWidth={2} />
      </button>
      <span className="w-7 pt-3 shrink-0 font-mono text-xs font-semibold">
        {String(index + 1).padStart(2, "0")}
      </span>
      <label className="flex-1 min-w-0">
        <span className="sr-only">Krok {index + 1}</span>
        <textarea
          rows={2}
          placeholder="Opisz ten krok…"
          className="w-full bg-card border-2 border-ink px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-2 focus:outline-offset-2 focus:outline-accent resize-none"
          {...register(`steps.${index}.value`)}
        />
      </label>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Usuń krok ${index + 1}`}
        className="w-11 h-11 shrink-0 flex items-center justify-center text-ink-muted hover:text-accent transition-colors cursor-pointer"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </li>
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
    <div className={pageClass("narrow")}>
      <PageHeader title={pageTitle} eyebrow="Kreator przepisów" />

      {/* Nazwa przepisu */}
      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-extrabold uppercase">
          Nazwa przepisu
        </span>
        <input
          type="text"
          placeholder="np. Owsianka z owocami"
          aria-invalid={Boolean(errors.name)}
          className="h-[52px] px-3 border-2 border-ink bg-card text-lg font-bold text-ink placeholder:text-ink-muted placeholder:font-normal focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          {...register("name")}
        />
        {errors.name && (
          <span role="alert" className="font-mono text-xs text-accent">
            {errors.name.message}
          </span>
        )}
      </label>

      {/* Wyszukiwarka składników */}
      <section aria-labelledby="add-ingredients-heading">
        <h2
          id="add-ingredients-heading"
          className="font-display text-[26px] uppercase border-b-[5px] border-ink pb-0.5 mb-3"
        >
          Dodaj składniki
        </h2>
        <Search onProductSelect={handleAddIngredient} />
      </section>

      {/* Lista składników — jako etykieta */}
      <section
        aria-labelledby="ingredients-heading"
        className="border-2 border-ink bg-card px-3 pt-1.5 pb-3"
      >
        <h2
          id="ingredients-heading"
          className="font-display text-[30px] leading-none"
        >
          Składniki
          <span className="font-mono text-base font-semibold ml-2">
            {productFields.length}
          </span>
        </h2>
        <div className="rule-thick mt-2" />
        {productFields.length === 0 ? (
          <p className="py-3 text-sm">
            Brak składników — wyszukaj i dodaj produkty powyżej.
          </p>
        ) : (
          <ul>
            {productFields.map((field, index) => (
              <li
                key={field.id}
                className="flex items-center gap-3 min-h-14 border-b border-ink last:border-b-0"
              >
                <ProductThumb src={field.imageUrl} />
                <span className="flex-1 min-w-0 text-[15px] font-bold truncate">
                  {field.name}
                </span>
                <label className="flex items-center gap-1.5 h-10 px-2 border-2 border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                  <span className="sr-only">Ilość: {field.name}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    onFocus={(e) => e.target.select()}
                    className="w-14 bg-transparent text-right font-mono text-[15px] outline-none"
                    {...register(`products.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="font-mono text-sm">g</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  aria-label={`Usuń składnik: ${field.name}`}
                  className="w-11 h-11 shrink-0 flex items-center justify-center text-ink-muted hover:text-accent transition-colors cursor-pointer"
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.products?.root && (
          <p role="alert" className="pt-2 font-mono text-xs text-accent">
            {errors.products.root.message}
          </p>
        )}
      </section>

      {/* Kroki przygotowania */}
      <section aria-labelledby="steps-heading">
        <h2
          id="steps-heading"
          className="flex items-baseline justify-between font-display text-[26px] uppercase border-b-[5px] border-ink pb-0.5"
        >
          Jak to zrobić
          <span className="font-mono text-[11px] font-medium normal-case">
            opcjonalne
          </span>
        </h2>
        {stepFields.length === 0 ? (
          <p className="py-3 text-sm border-b border-ink">
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
              <ol>
                {stepFields.map((field, index) => (
                  <SortableStepRow
                    key={field.id}
                    id={field.id}
                    index={index}
                    register={register}
                    onRemove={() => removeStep(index)}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
        <button
          type="button"
          onClick={() => appendStep({ value: "" })}
          className="inline-flex items-center gap-1.5 min-h-11 text-sm font-extrabold uppercase text-accent hover:text-accent-hover cursor-pointer"
        >
          <Plus size={16} strokeWidth={3} strokeLinecap="square" />
          Dodaj krok
        </button>
      </section>

      <div className="rule-medium" />
      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="min-h-14 px-6 bg-ink text-paper text-base font-extrabold uppercase tracking-wide hover:bg-accent transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting
          ? "Zapisuję…"
          : editId
            ? "Zapisz zmiany"
            : "Zapisz przepis"}
      </button>
      {error && (
        <p role="alert" className="font-mono text-sm text-accent">
          {error}
        </p>
      )}
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
