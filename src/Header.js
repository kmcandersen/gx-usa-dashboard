import React from 'react';
import './App.css';
import { ReactComponent as Logo } from './assets/gx-sign.svg';
import { ReactComponent as Octocat } from './assets/github-mark.svg';

const Header = () => {
  return (
    <header className='header-wrapper'>
      <div className='header-logo'>
        <div className='header-title-group'>
          <div className='header-title-logo'>
            <Logo
              width={32}
              height={32}
              viewBox={`-4 -4 123 123`}
              style={{ transform: `translateY(5px)` }}
            />
            <p className='header-title'>
              rrgxdb<span className='header-year'>2000-2020</span>
            </p>
          </div>
          <p className='header-subtitle'>railroad grade crossing dashboard</p>
        </div>
        <div className='header-desc subtitle'>
          <p>
            Collisions at highway-rail at-grade crossings in the United States.
          </p>
          <p className='small-text'>
            Source:{' '}
            <a href='https://safetydata.fra.dot.gov/'>
              Federal Railroad Administration
            </a>
          </p>
          <div>
            <a href='https://github.com/kmcandersen/gx-usa-dashboard'>
              <Octocat
                width={24}
                height={24}
                alt='GitHub link'
                title='GitHub link'
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
