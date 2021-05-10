import React, { CSSProperties } from "react";

import styles from "./Avatar.module.css";

interface AvatarProps {
  userName: string;
  avatarUrl?: string;
  progress?: number;
}

export const Avatar = ({ userName, avatarUrl, progress = 0 }: AvatarProps) => {
  const nameHue = userName
    .toUpperCase()
    .split("")
    .filter((_) => /[\p{Letter}-]/gu.test(_))
    .reduce((sum, _, i) => sum + _.charCodeAt(0) ** (i + 1), 0) % 360;
  const letter = userName.toUpperCase()[0];

  const random = Date.now();
  const avatarImageId = `${userName}AvatarImage` + random;
  const avatarMask = `${userName}Mask` + random;

  return (
    <svg
      width="32"
      height="32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ "--hue": nameHue, "--progress": progress } as CSSProperties}
      className={styles.avatar}
    >
      <circle cx="16" cy="16" r="13" className={styles.avatarCircle} />
      <mask
        id={avatarMask}
        maskUnits="userSpaceOnUse"
        x="2"
        y="2"
        width="28"
        height="28"
      >
        <circle cx="16" cy="16" r="13" fill="#fff" />
      </mask>
      {avatarUrl && (
        <g mask={`url(#${avatarMask})`}>
          <image
            id={avatarImageId}
            width="100%"
            height="100%"
            xlinkHref={avatarUrl}
          />
        </g>
      )}
      <g>
        <circle cx="16" cy="16" r="15" className={styles.progress} />
        {!avatarUrl &&
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dy=".3em"
            className={styles.letter}
          >
            {letter}
          </text>}
      </g>
    </svg>
  );
};
