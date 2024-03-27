import React from "react";
import { Outlet } from "react-router-dom";
import './styles.css';
import { useNavigate } from 'react-router-dom';

export const Layout = () => {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="layout">
        <button 
          onClick={() => handleNavigation('/')}
          style={{padding:'10px'}}
          >Home</button>
        <Outlet />
    </div>
  );
};
