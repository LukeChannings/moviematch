import React from "react";

import "./Avatar.css";

interface AvatarProps {
  userName: string;
  avatarUrl?: string;
}

export const Avatar = ({ userName, avatarUrl }: AvatarProps) => {
  const nameHue = userName
    .toUpperCase()
    .split("")
    .filter((_) => /[\p{Letter}-]/gu.test(_))
    .reduce((sum, _, i) => sum + _.charCodeAt(0) ** (i + 1), 0) % 360;

  const plexHue = 41;

  return (
    <div
      className="Avatar"
      style={{
        "--hue": avatarUrl ? plexHue : nameHue,
        backgroundImage: `url(${avatarUrl})`,
      } as any}
    >
      {!avatarUrl &&
        <span className="Avatar_Letter">{userName.toUpperCase()[0]}</span>}
    </div>
  );
};
