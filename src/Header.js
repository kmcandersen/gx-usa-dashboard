import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './assets/gx-sign-blue.svg';

const Header = () => {
  return (
    <header className='header-wrapper'>
      {/* <div style={{ display: 'flex' }}> */}
      <div className='header-logo'>
        <div className='header-title-group'>
          <div className='header-title-logo'>
            <Logo
              width={45}
              height={40}
              viewBox={`0 -5 118 118`}
              style={{ transform: `translateY(5px)` }}
            />
            <p className='header-title'>
              rrgxdb<span className='header-year'> 2000-2020</span>
            </p>
          </div>
          <p className='header-subtitle'>railroad grade crossing dashboard</p>
        </div>

        <p className='header-desc subtitle'>
          Collisions at highway-rail at-grade crossings in the United States.
          <br />
          Source:{' '}
          <a href='https://safetydata.fra.dot.gov/'>
            Federal Railroad Administration
          </a>
        </p>
      </div>
    </header>
  );
};

export default Header;
