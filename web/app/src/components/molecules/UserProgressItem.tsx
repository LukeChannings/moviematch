import React from "react";
import type { UserProgress } from "../../../../../types/moviematch";
import { Avatar } from "../atoms/Avatar";

import styles from "./UserProgressItem.module.css";

export const UserProgressItem = ({ user }: UserProgress) => {
  return (
    <div className={styles.userProgress}>
      <Avatar userName={user.userName} avatarUrl={user.avatarImage} />
      <p className={styles.userName}>{user.userName}</p>
    </div>
  );
};
