import { useState } from "react";
import Image from "next/image";

type Product = {
  name: string;
  id: string;
  createdAt: Date;
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
  product: Product;
  canBeDeleted?: boolean;
  canBeEdited?: boolean;
  handleEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  addProductToDiary?: (product: Product, quantity: number) => void;
  onProductSelect?: (product: Product) => void;
}) => {
  const [quantity, setQuantity] = useState(0);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseFloat(e.target.value));
  };

  return (
    <div className="flex gap-4 py-3 border-b border-gray-700 items-center">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt="product"
          className="w-16 h-16 rounded-lg bg-gray-700 shrink-0"
          width={100}
          height={100}
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gray-700 shrink-0" />
      )}
      <div className="flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">{product.name}</span>
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-semibold shrink-0">
              {product.calories} kcal
            </span>
            {canBeDeleted && (
              <button
                onClick={() => onDelete?.(product.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                🗑️
              </button>
            )}
            {canBeEdited && (
              <button
                onClick={() => handleEdit?.(product.id)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                ✏️
              </button>
            )}
            {onProductSelect && (
              <button
                onClick={() => onProductSelect?.(product)}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                🔍
              </button>
            )}
          </div>
        </div>
        {addProductToDiary && (
          <div>
            <input
              onChange={(e) => handleOnChange(e)}
              className="text-gray-500 hover:text-red-400 transition-colors"
            />
            <button onClick={() => addProductToDiary?.(product, quantity)}>
              Dodaj
            </button>
          </div>
        )}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>🌾 Carbs, {product.carbs}g </span>
          <span>💪 Protein {product.protein}g</span>
          <span>🧈 Fat {product.fat}g</span>
        </div>
      </div>
    </div>
  );
};
