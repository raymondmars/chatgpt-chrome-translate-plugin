import React, { useEffect } from 'react';
import styles from './custom_menu.scss';


export interface MenuItem {
  icon?: string;
  label: string;
  onClick: (e: MouseEvent | React.MouseEvent<HTMLLIElement>) => void;
}

interface CustomMenuProps {
  active: boolean;
  identityClassName: string;
  x?: number;
  y?: number;
  menuItems?: Array<MenuItem>
}

const CustomMenu = ({active, x, y, menuItems, identityClassName }:CustomMenuProps) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.style.left = (x &&`${x - menuRef.current.clientWidth - 10}px`) || '';
      menuRef.current.style.top = (y && `${y - menuRef.current.clientHeight - 10}px`) || '';
    }
  }, [x, y])

  return (
    <>
      { active && <div className={styles.custom_menu} ref={menuRef}>
        <ul>
        { menuItems?.map(item => (
          <li key={item.label} onClick={item.onClick} className={identityClassName}>
            {item.label}
          </li>
        ))}
        </ul>
      </div> }
    </>
  )
}

export default CustomMenu
