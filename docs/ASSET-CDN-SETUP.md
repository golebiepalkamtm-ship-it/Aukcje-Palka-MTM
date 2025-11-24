## Asset CDN Setup

This project now expects heavy public assets (images, videos, models) to be served from an external bucket (Firebase Storage / Google Cloud Storage). This keeps the Firebase App Hosting bundle below 250 MB while preserving all media on production.

### 1. Upload existing assets

1. Create / select a Storage bucket, e.g. `m-t-m-62972.appspot.com`.
2. Mirror the `public/` subdirectories that contain large files:
   - `uploads/**`
   - `champions/**`
   - `press/**`
   - `models/**`
   - `golden-pair/**`
   - `meetings with breeders/**`
3. Keep the same relative paths (e.g. `uploads/image/foo.jpg` → `gs://<bucket>/uploads/image/foo.jpg`).

### 2. Expose the bucket via HTTPS

1. Enable **Uniform bucket-level access**.
2. Add a read-only policy for `allUsers` (or use a signed CDN in front of the bucket).
3. Note the public base URL (for GCS it is `https://storage.googleapis.com/<bucket>`).

### 3. Configure the application

1. Set `NEXT_PUBLIC_ASSET_BASE_URL` in `.env.production` (and optionally `.env.local`) to the bucket URL.
2. Rebuild & redeploy: `npm run build` + `npm run deploy:firebase`.

### 4. (Optional) Remove local copies

Once the bucket is live you can delete the heavy directories from the repository to keep source archives small. Local development will continue to fetch assets from the CDN as long as `NEXT_PUBLIC_ASSET_BASE_URL` is set.

