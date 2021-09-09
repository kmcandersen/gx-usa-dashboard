// only seen if site loads on screen < 470px wide
import React, { useEffect } from 'react';
import { ReactComponent as RotateIcon } from './assets/rotate-device.svg';
import { ReactComponent as Logo } from './assets/gx-sign.svg';

const Alert = () => {
  useEffect(() => {
    let el = document.querySelector('.message-overlay');
    if (el) {
      el.classList.add('fade-in');
    }
  }, []);

  return (
    <div className='rotate-message'>
      <div className='header-title-logo'>
        <Logo
          width={30}
          height={30}
          viewBox={`-4 -4 123 123`}
          style={{ transform: `translateY(5px)` }}
        />
        <p className='header-title'>rrgxdb</p>
      </div>
      <p>Rotate your device</p>
      <div className='rotate-icon'>
        <RotateIcon width={70} height={70} />
      </div>
      <p>please</p>
    </div>
  );
};

export default Alert;
