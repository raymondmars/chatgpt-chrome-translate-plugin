import React from 'react';
import styles from './actions_bar.scss';

const ActionsBar = (props: { translateContent: string }) => {

  const handleTranslateClick = () => {
    console.log(props.translateContent);
  }
  return (
    <div className={styles.actions_bar}>
      <a onClick={handleTranslateClick}>Translate</a>
    </div>
  )
}

export default ActionsBar;