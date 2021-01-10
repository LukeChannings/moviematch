import React from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./Avatar.css";

interface AvatarProps {
  userName: string;
  avatarUrl?: string;
}

const defaultImage = (userName: string) =>
  `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
  <rect x="0" y="0" width="24" height="24" fill="#EEC3C3" />
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="HelveticaNeue-Bold, Helvetica Neue, Helvetica, sans-serif" font-size="12" font-weight="bold">
    ${userName[0].toUpperCase()}
  </text>
</svg>`;

export const Avatar = ({ userName, avatarUrl }: AvatarProps) => {
  return (
    <img
      className="Avatar"
      src={avatarUrl ||
        `data:image/svg+xml;utf8,${encodeURIComponent(defaultImage(userName))}`}
      alt={`${userName}'s avatar`}
    >
    </img>
  );
};
