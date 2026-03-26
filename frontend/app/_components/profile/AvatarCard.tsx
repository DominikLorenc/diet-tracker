"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { uploadImage } from "@/utils/uploadImage";
import { apiClient, ApiError } from "@/app/lib/apiClient";

type AvatarCardProps = {
  name: string;
  email?: string;
  imageUrl?: string;
};

type ImagePayload = {
  imageUrl: string;
};

type Response = {
  message: string;
  updated: string;
};

export const AvatarCard = ({ name, email, imageUrl }: AvatarCardProps) => {
  const initial = name.charAt(0).toUpperCase();

  const [userImageUrl, setUserImageUrl] = useState<File | null>(null);
  const [userImage, setUserImage] = useState<string | undefined>(imageUrl);
  const [error, setError] = useState("");

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUserImageUrl(file ?? null);
  };

  const updateImage = async () => {
    try {
      const imageUrl = userImageUrl ? await uploadImage(userImageUrl) : null;

      const preparedData = imageUrl;

      if (!preparedData) {
        setError("Nie udało się załadować obrazka");
        return;
      }

      const response = await apiClient.patch<Response, ImagePayload>(
        `/users/image`,
        {
          imageUrl: preparedData,
        },
      );

      setUserImage(response.updated);
    } catch (error) {
      console.log(error);
      setError("Coś poszło nie tak");
    } finally {
    }
  };

  useEffect(() => {
    if (!userImageUrl) {
      return;
    }
    updateImage();
  }, [userImageUrl]);

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div className="w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
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
          <span className="text-white text-3xl font-semibold">{initial}</span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <h2 className="text-lg font-bold text-text-primary">{name}</h2>
        {email && <p className="text-sm text-text-secondary">{email}</p>}
      </div>
      <label className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 text-sm text-text-secondary bg-surface hover:bg-surface-muted transition-colors cursor-pointer">
        <span>🖼</span>
        <span>Change Photo</span>
        <input
          onChange={onFileChange}
          type="file"
          accept="image/*"
          className="hidden"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
