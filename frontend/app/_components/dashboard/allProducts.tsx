"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "../search/ProductCard";
import { Modal } from "../shared/Modal";
import { ProductForm } from "../shared/ProductForm";

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

export const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const handleEdit = (id: string) => {
    const product = products.find((product) => product.id === id);
    if (!product) {
      return;
    }
    setProductToEdit(product);
    setOpenModal(true);
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products);
      });
  }, []);

  const onDelete = (id: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        }
        const data = await response.json();
        throw new Error(data.message);
      })
      .then((data) => {
        setProducts(products.filter((product) => product.id !== id));
      })
      .catch((error) => {
        console.log(error);
      });
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
