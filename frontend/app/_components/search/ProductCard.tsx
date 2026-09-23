import { Fragment, useState } from "react";
import { formatAmount } from "@/utils/format";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
    <div className="border-b border-ink">
      <div className="flex items-center gap-3 min-h-14 py-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            width={36}
            height={36}
            className="w-9 h-9 shrink-0 object-cover border border-ink"
          />
        ) : (
          <span
            aria-hidden="true"
            className="w-9 h-9 shrink-0 border border-ink bg-paper"
          />
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-[15px] font-bold truncate">{product.name}</p>
          <p className="font-mono text-[11px] truncate">
            B {formatAmount(product.protein)} · W {formatAmount(product.carbs)}{" "}
            · T {formatAmount(product.fat)}
          </p>
        </div>

        <span className="font-mono text-base font-semibold">
          {formatAmount(product.calories, 0)}
        </span>

        <div className="flex items-center shrink-0">
          {canBeEdited && (
            <button
              onClick={() => handleEdit?.(product.id)}
              className="w-11 h-11 flex items-center justify-center hover:text-accent transition-colors cursor-pointer"
              aria-label={`Edytuj: ${product.name}`}
            >
              <Pencil size={16} strokeWidth={2.5} />
            </button>
          )}
          {canBeDeleted && (
            <button
              onClick={() => onDelete?.(product.id)}
              className="w-11 h-11 flex items-center justify-center text-ink-muted hover:text-accent transition-colors cursor-pointer"
              aria-label={`Usuń: ${product.name}`}
            >
              <Trash2 size={16} strokeWidth={2.5} />
            </button>
          )}
          {onProductSelect && (
            <button
              onClick={() => onProductSelect?.(product)}
              className="w-11 h-11 flex items-center justify-center hover:text-accent transition-colors cursor-pointer"
              aria-label={`Wybierz: ${product.name}`}
            >
              <Plus size={18} strokeWidth={3} strokeLinecap="square" />
            </button>
          )}
        </div>
      </div>

      {addProductToDiary && (
        <div className="flex items-stretch pb-3">
          <label className="flex-1 min-w-0 flex items-center gap-2 h-11 px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
            <span className="sr-only">Ilość w gramach</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="Ilość"
              onChange={(e) => handleOnChange(e)}
              className="flex-1 min-w-0 bg-transparent font-mono text-[15px] outline-none placeholder:text-ink-muted"
            />
            <span className="font-mono text-sm">g</span>
          </label>
          <button
            onClick={() => addProductToDiary?.(product, quantity)}
            className="shrink-0 px-4 border-2 border-l-0 border-ink bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent hover:border-accent transition-colors cursor-pointer"
          >
            Dodaj
          </button>
        </div>
      )}
    </div>
  );
};
