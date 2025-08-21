const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // ← aquí estaba el error, tenías una coma delante
        destination: "http://localhost:8000/:path*", // ← pasa también el path
      },
    ];
  },
};

module.exports = nextConfig;
