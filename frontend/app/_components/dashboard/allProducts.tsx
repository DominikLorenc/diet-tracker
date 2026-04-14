"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "../search/ProductCard";
import { Modal } from "../shared/Modal";
import { ProductForm } from "../shared/ProductForm";
import { useToastStore } from "@/store/useToastStore";
import { apiClient } from "@/app/lib/apiClient";

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
      const { data } = await apiClient.GET("/products");
      if (data) {
        setProducts(data.products as Product[]);
      }
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
      setProducts(products.filter((product) => product.id !== id));
      showToast("error", "Produkt usunięty");
    }
  };

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
        />
      </Modal>
    </div>
  );
};
