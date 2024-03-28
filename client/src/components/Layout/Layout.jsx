import React from "react";
import { Outlet } from "react-router-dom";
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';

export const Layout = () => {
  return (
    <div className="layout">
        <Navbar />
        <Outlet />
    </div>
  );
};
