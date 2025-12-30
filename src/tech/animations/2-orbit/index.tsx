import styles from "./styles.module.css";

export const Orbit = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.circle} />
      <div className={styles.orbitingCircle} />
    </div>
  );
};
