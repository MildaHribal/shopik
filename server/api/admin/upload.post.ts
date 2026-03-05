import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Žádný soubor nebyl nahrán',
    });
  }

  const file = formData.find((f) => f.name === 'file');
  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Soubor nebyl nalezen',
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  // Prefer service key, fall back to regular key
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase není nakonfigurován',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Generate unique filename
  const originalName = file.filename || 'image.png';
  const fileExt = originalName.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  // Determine content type
  const contentType = file.type || 'image/png';

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file.data, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);

    // If RLS error, give helpful message
    if (error.message?.includes('row-level security') || error.message?.includes('security policy')) {
      throw createError({
        statusCode: 500,
        statusMessage: 'RLS chyba: Přidejte SUPABASE_SERVICE_KEY (service_role key z Supabase Dashboard > Settings > API) do .env souboru. Publishable key nedokáže obejít RLS.',
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Chyba při nahrávání: ${error.message}`,
    });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
});
