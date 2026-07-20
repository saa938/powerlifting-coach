// Uploads a local file (file:// URI) to a signed URL. Fetching the URI yields a
// Blob in React Native, which we then PUT/POST directly to storage — keeping big
// videos off the API's request-body path.
export async function uploadToSignedUrl(params: {
  uploadUrl: string;
  method: 'PUT' | 'POST';
  fileUri: string;
  contentType: string;
  headers?: Record<string, string>;
}): Promise<void> {
  const fileResponse = await fetch(params.fileUri);
  const blob = await fileResponse.blob();

  const res = await fetch(params.uploadUrl, {
    method: params.method,
    headers: { 'Content-Type': params.contentType, ...(params.headers ?? {}) },
    body: blob,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Upload failed (${res.status})`);
  }
}
