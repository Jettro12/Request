/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // MANTENER ESTO (Vital para Docker)
  reactStrictMode: true,

  // Agregamos la configuración del Proxy aquí
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "http://auth-service:4004/:path*",
      },
      {
        source: "/users/:path*",
        destination: "http://users-service:4007/:path*",
      },
      {
        source: "/posts/:path*",
        destination: "http://posts-service:4002/:path*",
      },
      {
        source: "/requests/:path*",
        destination: "http://requests-service:4003/:path*",
      },
      {
        source: "/notifications/:path*",
        destination: "http://notification-service:4001/:path*",
      },
      {
        source: "/profile/:path*",
        destination: "http://profile-service:4005/:path*",
      },
      {
        source: "/ratings/:path*",
        destination: "http://ratings-service:4006/:path*",
      },
      {
        source: "/messages/:path*",
        destination: "http://messages-service:4008/:path*",
      },
      {
        source: "/conversations/:path*",
        destination: "http://conversations-service:4009/:path*",
      },
      {
        source: "/chat/:path*",
        destination: "http://chat-service:4010/:path*",
      },
    ];
  },
};

export default nextConfig;
