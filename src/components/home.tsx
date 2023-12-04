import React from 'react';
import Settings from './settings';

import styles from './home.scss';

const Home = () => {

  return (
    <div className={styles.home}>
      <Settings />
    </div>
  )
}

export default Home;
