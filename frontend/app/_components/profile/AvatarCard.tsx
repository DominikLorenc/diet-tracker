"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadImage } from "@/utils/uploadImage";
import { apiClient } from "@/app/lib/apiClient";

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
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-gradient-green ring-avatar-green flex items-center justify-center shrink-0">
        {userImage ? (
          <Image
            src={userImage}
            alt={name}
            className="w-full h-full rounded-full object-cover"
            width={80}
            height={80}
            loading="eager"
            loader={({ src }) => `${src}?w=80&h=80&fit=crop`}
          />
        ) : (
          <span className="text-white text-3xl font-semibold font-sans">
            {initial}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-lg font-bold text-dash-fg font-sans">{name}</h2>
        {email && (
          <p className="text-sm text-dash-fg-muted font-sans">{email}</p>
        )}
      </div>

      <label className="flex items-center gap-2 px-5 py-2 rounded-xl border border-dash-border bg-dash-surface-alt text-sm text-dash-fg-muted font-sans transition-opacity hover:opacity-80 cursor-pointer">
        <span>🖼</span>
        <span>Change Photo</span>
        <input
          onChange={onFileChange}
          type="file"
          accept="image/*"
          className="hidden"
        />
      </label>

      {error && <p className="text-sm text-red-400 font-sans">{error}</p>}
    </div>
  );
};
