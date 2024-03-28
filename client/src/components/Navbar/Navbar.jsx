import React from "react";
import { Outlet } from "react-router-dom";
import './styles.css';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="navbar">
      <div className="navbar-content">
        <div className="navbar-title">
          CHOICE RECORDS
        </div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/map">View Map</a>
        </div>
      </div>
    </div>
  );
};
