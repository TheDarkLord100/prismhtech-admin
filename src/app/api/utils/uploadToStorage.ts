import { createAdminSupabaseClient } from "@/utils/supabase/adminClient";

export async function uploadToStorage({ file, bucket, fileName }: { file: File, bucket: string, fileName: string }): Promise<{ url: string }> {

    if (!file) {
        throw new Error("No file provided for upload");
    }
    if (!bucket) {
        throw new Error("No bucket specified for upload");
    }
    if (!fileName) {
        throw new Error("No fileName specified for upload");
    }

    const supabaseServer = createAdminSupabaseClient();
    const { data, error } = await supabaseServer.storage
        .from(bucket)
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
    const publicUrlData  = supabaseServer.storage
        .from(bucket)
        .getPublicUrl(fileName);

    const publicURL = publicUrlData.data.publicUrl;

    return { url: publicURL };
}
