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
          <h3><span style={{color:'orange'}}>\ </span>CHOICE <span style={{color:'orange'}}>RECORDS </span></h3>
        </div>
        <div className="navbar-links">
          <a href="/"><span style={{color:'orange'}}>\ </span>UPLOAD <span style={{color:'orange'}}>RECORDS</span></a>
          <a href="/map"><span style={{color:'orange'}}>\ </span>VIEW <span style={{color:'orange'}}>MAP</span></a>
          <a href="/excelTitles"><span style={{color:'orange'}}>\ </span>EXCEL <span style={{color:'orange'}}>REMOVE</span></a>
        </div>
      </div>
    </div>
  );
};
