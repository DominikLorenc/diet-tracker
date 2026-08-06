import { Fragment, useState } from "react";
import Image from "next/image";

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

export const ProductCard = ({
  product,
  canBeDeleted,
  onDelete,
  handleEdit,
  canBeEdited,
  addProductToDiary,
  onProductSelect,
}: {
  product: Product | null;
  canBeDeleted?: boolean;
  canBeEdited?: boolean;
  handleEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  addProductToDiary?: (product: Product, quantity: number) => void;
  onProductSelect?: (product: Product) => void;
}) => {
  const [quantity, setQuantity] = useState(0);

  if (!product) return <Fragment />;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseFloat(e.target.value));
  };

  return (
    <div className="rounded-xl bg-dash-surface-card border border-dash-border hover:border-dash-svg-inactive transition-colors mb-2 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-3">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={36}
            height={36}
            className="rounded-lg shrink-0 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-dash-surface-darker shrink-0" />
        )}

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-dash-fg font-semibold text-sm truncate">
            {product.name}
          </p>
          <p className="text-dash-fg-muted text-xs truncate">
            {product.calories} kcal · B: {product.protein}g · T: {product.fat}g
            · W: {product.carbs}g
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canBeDeleted && (
            <button
              onClick={() => onDelete?.(product.id)}
              className="text-dash-fg-muted hover:text-red-400 transition-colors"
              aria-label="Usuń produkt"
            >
              🗑️
            </button>
          )}
          {canBeEdited && (
            <button
              onClick={() => handleEdit?.(product.id)}
              className="text-dash-fg-muted hover:text-dash-green transition-colors"
              aria-label="Edytuj produkt"
            >
              ✏️
            </button>
          )}
          {onProductSelect && (
            <button
              onClick={() => onProductSelect?.(product)}
              className="text-dash-fg-muted hover:text-dash-green transition-colors"
              aria-label="Wybierz produkt"
            >
              ➕
            </button>
          )}
        </div>
      </div>

      {addProductToDiary && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <input
            type="number"
            placeholder="Ilość (g)"
            onChange={(e) => handleOnChange(e)}
            className="flex-1 min-w-0 bg-dash-surface-darker border border-dash-border rounded-lg px-3 py-2 text-sm text-dash-fg placeholder:text-dash-fg-muted focus:outline-none focus:border-dash-green-mid transition-colors"
          />
          <button
            onClick={() => addProductToDiary?.(product, quantity)}
            className="shrink-0 bg-green-600 hover:bg-green-700 transition-colors rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            Dodaj
          </button>
        </div>
      )}
    </div>
  );
};
