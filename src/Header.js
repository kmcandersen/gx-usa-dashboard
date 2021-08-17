import React from 'react';
import './App.css';
import logo from './gx-sign-blue.svg';

const Header = () => {
  return (
    <header className='header-wrapper'>
      <div className='header-logo'>
        <img src={logo} alt='logo' />
        <p>rrgxdb</p>
      </div>
      <div className='header-name'>
        <p>railroad grade crossing dashboard</p>
      </div>
    </header>
  );
};

export default Header;
