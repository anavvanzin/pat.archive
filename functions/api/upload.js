export async function onRequestPost(context) {
  const bucket = context.env.AUDIO_BUCKET;
  if (!bucket) {
    return Response.json({ error: "R2 Bucket not configured" }, { status: 500 });
  }

  try {
    const formData = await context.request.formData();
    const file = formData.get('track');
    if (!file) {
      return Response.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // Validate size (40MB limit)
    if (file.size > 40 * 1024 * 1024) {
      return Response.json({ error: 'Arquivo muito grande. Limite de 40MB.' }, { status: 400 });
    }

    // Validate extension
    const name = file.name;
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (!['.mp3', '.wav', '.ogg', '.m4a', '.flac'].includes(ext)) {
      return Response.json({ error: 'Formato de áudio inválido.' }, { status: 400 });
    }

    // Generate clean filename
    const cleanName = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const filename = `${Date.now()}_${cleanName}`;

    // Upload to R2
    await bucket.put(filename, file.stream(), {
      httpMetadata: { contentType: file.type },
    });

    const displayTitle = name
      .replace(/_/g, ' ')
      .replace(/\.[^/.]+$/, '');

    return Response.json({
      ok: true,
      track: {
        id: filename,
        title: displayTitle.charAt(0).toUpperCase() + displayTitle.slice(1),
        artist: 'Upload',
        len: 'Vários',
        url: `/api/tracks/${filename}`,
        bpm: 124
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
