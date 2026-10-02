import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

let r2Client = null;

const getEnv = (key, fallbackKey) => {
  return process.env[key] || (fallbackKey ? process.env[fallbackKey] : "") || "";
};

export const getR2Client = () => {
  const accountId = getEnv("R2_ACCOUNT_ID", "CLOUDFLARE_R2_ACCOUNT_ID");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  const customEndpoint = getEnv("R2_ENDPOINT", "CLOUDFLARE_R2_ENDPOINT");

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  if (!r2Client) {
    const endpoint = customEndpoint || `https://${accountId}.r2.cloudflarestorage.com`;
    r2Client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2Client;
};

export const isR2Configured = () => {
  const accountId = getEnv("R2_ACCOUNT_ID", "CLOUDFLARE_R2_ACCOUNT_ID");
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_SECRET_ACCESS_KEY");
  const bucketName = getEnv("R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET_NAME");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return false;
  }

  if (
    accountId.includes("your_") ||
    accessKeyId.includes("your_") ||
    secretAccessKey.includes("your_") ||
    bucketName.includes("your_")
  ) {
    return false;
  }

  return true;
};

export const uploadToR2 = async (buffer, filename, mimeType) => {
  const client = getR2Client();
  if (!client) {
    throw new Error("Cloudflare R2 is not configured in environment variables");
  }

  const bucketName = getEnv("R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET_NAME");

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: buffer,
    ContentType: mimeType || "image/jpeg",
  });

  await client.send(command);

  let publicUrl = getEnv("R2_PUBLIC_URL", "CLOUDFLARE_R2_PUBLIC_URL");
  if (publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }

  if (publicUrl) {
    return `${publicUrl}/${filename}`;
  }

  // If no custom public domain URL is set, return proxy endpoint on our backend server
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  return `${backendUrl}/api/upload/file/${filename}`;
};

export const getFileFromR2 = async (filename) => {
  const client = getR2Client();
  if (!client) return null;

  try {
    const bucketName = getEnv("R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET_NAME");
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    const response = await client.send(command);
    return response;
  } catch (err) {
    console.error("Error fetching file from Cloudflare R2:", err);
    return null;
  }
};

export const deleteFromR2 = async (filename) => {
  const client = getR2Client();
  if (!client) return false;

  try {
    const bucketName = getEnv("R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET_NAME");
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename,
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.error("Error deleting file from Cloudflare R2:", err);
    return false;
  }
};
