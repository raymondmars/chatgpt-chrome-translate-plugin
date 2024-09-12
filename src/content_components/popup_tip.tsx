import React from 'react';

import styles from './popup_tip.scss';

export default function PopupTip({active, text}: {active: boolean, text?: string}) {
  return (
    active && <div className={styles.popup_tip}>
      <div>{text}</div>
    </div>
  )
}
