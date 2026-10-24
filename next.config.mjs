/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow images that come from cloudinary
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;