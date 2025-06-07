import React from 'react';
import { FaEnvelope, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import profileImg from '../Profile Card/profile.png';
import styles from './ProfileCard.module.css';

export function ProfileCard() {
  return (
    <div className={styles.profilecardCard}>
      <button className={styles.profilecardMail}>
        <FaEnvelope size={22} color="#2fbfec" />
      </button>
      <div className={styles.profilecardProfilePic}>
        <img src={profileImg} alt="profile" width={50} height={50} />
      </div>
      <div className={styles.profilecardBottom}>
        <div className={styles.profilecardContent}>
          <span className={styles.profilecardName}>Chính Lập trình</span>
          <span className={styles.profilecardAboutMe}>
            Fullstack developer, Web dev, app builder, script maker, open-source contributor.
          </span>
        </div>
        <div className={styles.profilecardBottomBottom}>
          <div className={styles.profilecardSocialLinksContainer}>
            <FaFacebook />
            <FaInstagram />
            <FaTwitter />
          </div>
          <button className={styles.profilecardButton}>Contact Me</button>
        </div>
      </div>
    </div>
  );
}

// CSS module hoặc style nội bộ sẽ được thêm sau để tránh xung đột với global CSS 