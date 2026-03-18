import supabase from "./supabase";

export const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    if (!fileExt) {
        throw new Error("File extension is required");
    }


    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from("diet tracker")
        .upload(fileName, file);
    if (error) {
        throw error;
    }
    return supabase.storage.from("diet tracker").getPublicUrl(data.path).data.publicUrl;
};