"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "../search/ProductCard";
import { Modal } from "../shared/Modal";
import { ProductForm } from "../shared/ProductForm";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";
import { Spinner } from "../ui/Spinner";

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

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showToast = useToastStore((state) => state.showToast);

  const handleEdit = (id: string) => {
    const product = products.find((product) => product.id === id);
    if (!product) {
      return;
    }
    setProductToEdit(product);
    setOpenModal(true);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const { data, error } = await apiClient.GET("/products");
      if (error) {
        showToast(
          "error",
          "Nie udało się pobrać produktów",
          "Spróbuj ponownie",
        );
      } else if (data) {
        setProducts(data.products as Product[]);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const onDelete = async (id: string) => {
    const { error } = await apiClient.DELETE("/products/{id}", {
      params: { path: { id } },
    });
    if (error) {
      showToast("error", "Nie udało się usunąć produktu", "Spróbuj ponownie");
    } else {
      setProducts((prevProducts) =>
        prevProducts.filter((prevProduct) => prevProduct.id !== id),
      );
      showToast("success", "Produkt usunięty");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">Brak produktów</p>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          canBeDeleted
          onDelete={onDelete}
          handleEdit={handleEdit}
          canBeEdited
        />
      ))}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ProductForm
          closeModal={() => setOpenModal(false)}
          productToEdit={productToEdit}
          onSuccess={(product) => {
            setOpenModal(false);
            setProductToEdit(null);
            setProducts((prevProducts) =>
              prevProducts.map((prevProduct) =>
                prevProduct.id === product.id ? product : prevProduct,
              ),
            );
          }}
        />
      </Modal>
    </div>
  );
};
