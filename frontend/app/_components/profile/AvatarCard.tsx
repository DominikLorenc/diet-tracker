"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "@/utils/uploadImage";
import { apiClient } from "@/app/lib/apiClient";
import { ImageUp } from "lucide-react";

type AvatarCardProps = {
  name: string;
  email?: string;
  imageUrl?: string;
};

export const AvatarCard = ({ name, email, imageUrl }: AvatarCardProps) => {
  const initial = name.charAt(0).toUpperCase();

  const [userImage, setUserImage] = useState<string | undefined>(imageUrl);
  const [error, setError] = useState("");

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateImage(file);
    }
  };

  const updateImage = async (file: File) => {
    const uploadedUrl = file ? await uploadImage(file) : null;

    if (!uploadedUrl) {
      setError("Nie udało się załadować obrazka");
      return;
    }

    const { data, error } = await apiClient.PATCH("/users/image", {
      body: { imageUrl: uploadedUrl },
    });

    if (error) {
      setError(error.message ?? "Coś poszło nie tak");
      return;
    }

    if (data?.updated) {
      setUserImage(data.updated);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="w-24 h-24 bg-ink text-paper border-2 border-ink flex items-center justify-center shrink-0 overflow-hidden">
        {userImage ? (
          <Image
            src={userImage}
            alt={name}
            className="w-full h-full object-cover"
            width={96}
            height={96}
            loading="eager"
            loader={({ src }) => `${src}?w=96&h=96&fit=crop`}
          />
        ) : (
          <span className="font-display text-5xl">{initial}</span>
        )}
      </div>

      <div className="flex flex-col border-t-[10px] border-ink pt-2">
        <h2 className="font-display text-[30px] leading-none break-words">
          {name}
        </h2>
        {email && <p className="font-mono text-xs pt-1 break-all">{email}</p>}
      </div>

      <label className="flex items-center justify-center gap-2 min-h-11 px-4 border-2 border-ink text-sm font-extrabold uppercase cursor-pointer hover:bg-ink hover:text-paper transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <ImageUp size={16} strokeWidth={2.5} aria-hidden="true" />
        Zmień zdjęcie
        <input
          onChange={onFileChange}
          type="file"
          accept="image/*"
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="font-mono text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
};
