type Product = {
  name: string;
  id: string;
  createdAt: Date;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export const ProductCard = ({
  product,
  canBeDeleted,
  onDelete,
  handleEdit,
  canBeEdited,
}: {
  product: Product;
  canBeDeleted?: boolean;
  canBeEdited?: boolean;
  handleEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) => {
  return (
    <div className="flex gap-4 py-3 border-b border-gray-700 items-center">
      <div className="w-16 h-16 rounded-lg bg-gray-700 shrink-0" />
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
          </div>
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>🌾 Carbs, {product.carbs}g </span>
          <span>💪 Protein {product.protein}g</span>
          <span>🧈 Fat {product.fat}g</span>
        </div>
      </div>
    </div>
  );
};
