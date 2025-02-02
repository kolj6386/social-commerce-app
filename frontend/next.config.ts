import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'avatar.iran.liara.run',
          port: '',
          pathname: '/public',
          search: '',
        },
        {
          protocol: 'https',
          hostname: 'via.assets.so',
          port: '',
          pathname: '/game.png',
          search: '',
        },
      ],
    },
};

export default nextConfig;
