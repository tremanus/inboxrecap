'use client';
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MenuIcon from '@mui/icons-material/Menu'; // Burger menu icon
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import Drawer from '@mui/material/Drawer'; // Import the Drawer component from Material-UI
import DashboardNav from './dashboardnav'; // Import your DashboardNav
import './mobiledashboardnav.css';

export default function TopDashNav() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer state

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  const toggleDrawer = (open) => (event) => {
    // Close drawer when clicking outside of it or pressing the Escape key
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  return (
    <>
      {/* Top Navigation */}
      <div className="cust-top-nav">
        {/* Burger Menu Icon */}
        <div className="burger-menu" onClick={toggleDrawer(true)}>
          <MenuIcon style={{ color: 'black', fontSize: '40px' }} />
        </div>

        <div className="custom-profile-section" onClick={toggleDropdown}>
          <img
            src={session?.user?.image || "/default-profile.png"}
            alt="Profile"
            className="custom-profile-image"
          />
          <span className="custom-profile-name">{session?.user?.name || "User Name"}</span>
          <ArrowDropDownIcon style={{ color: 'black' }} />
        </div>

        {isDropdownOpen && (
          <div className="custom-dropdown-menu">
            <div className="custom-dropdown-item">{session?.user?.email}</div>
            <div className="custom-dropdown-item" onClick={() => alert('Navigate to Settings')}>
              <SettingsIcon style={{ color: 'black', marginRight: '8px' }} />
              Settings
            </div>
            <div className="custom-dropdown-item" onClick={handleSignOut}>
              <LogoutIcon style={{ color: 'black', marginRight: '8px' }} />
              Sign out
            </div>
          </div>
        )}
      </div>

      {/* Drawer (Dashboard Navigation) */}
      <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <div
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <DashboardNav /> {/* Render the dashboard navigation inside the drawer */}
        </div>
      </Drawer>
    </>
  );
}
