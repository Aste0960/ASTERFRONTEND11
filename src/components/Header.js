import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.css';
import logo from '../components/logo.jpeg'; // Import the logo image correctly

const Header = () => {
  return (
    <header className="header">
      {/* Add logo to the left side */}
      <img src={logo} alt="Logo" className="logo" /> {/* Use the imported logo */}
      <h1 style={{ color: 'white', margin: 0 }}>Ethiopian Earthquake Monitoring Center</h1>
      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
