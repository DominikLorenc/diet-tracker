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
    <div className="flex gap-3 p-3 mb-2 rounded-xl bg-dash-surface-card border border-dash-border hover:border-dash-svg-inactive transition-colors">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt="product"
          className="w-14 h-14 rounded-lg bg-dash-surface-darker object-cover shrink-0"
          width={100}
          height={100}
        />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-dash-surface-darker shrink-0" />
      )}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="text-dash-fg font-semibold leading-snug min-w-0">
            {product.name}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-dash-green font-bold text-sm bg-dash-badge-bg border border-(--color-green-mid-border) rounded-full px-2.5 py-0.5 whitespace-nowrap">
              {product.calories} kcal
            </span>
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
                🔍
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="flex items-center gap-1 bg-dash-surface-darker text-dash-fg-muted rounded-md px-2 py-1">
            🌾 Węgle {product.carbs}g
          </span>
          <span className="flex items-center gap-1 bg-dash-surface-darker text-dash-fg-muted rounded-md px-2 py-1">
            💪 Białko {product.protein}g
          </span>
          <span className="flex items-center gap-1 bg-dash-surface-darker text-dash-fg-muted rounded-md px-2 py-1">
            🧈 Tłuszcz {product.fat}g
          </span>
        </div>

        {addProductToDiary && (
          <div className="flex items-center gap-2 mt-1">
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
    </div>
  );
};
