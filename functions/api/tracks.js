export async function onRequestGet(context) {
  const defaultTracks = [
    { id: 'procedural', title: 'Sintetizador Procedural', artist: 'Cabine', len: 'Loop', url: null, bpm: 124 }
  ];

  try {
    const bucket = context.env.AUDIO_BUCKET;
    if (!bucket) {
      return Response.json(defaultTracks);
    }

    // List objects in R2 bucket
    const list = await bucket.list();
    const uploadedTracks = list.objects.map(obj => {
      const filename = obj.key;
      
      // Format clean title
      const cleanName = filename
        .replace(/^\d+_/, '') // remove timestamp prefix
        .replace(/_/g, ' ')
        .replace(/\.[^/.]+$/, ''); // remove extension
        
      return {
        id: filename,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        artist: 'Upload',
        len: 'Vários',
        url: `/api/tracks/${filename}`,
        bpm: 124
      };
    });

    return Response.json([...defaultTracks, ...uploadedTracks]);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
