"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import './topdashnav.css';

export default function TopDashNav() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSignOut = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  return (
    <div className="custom-top-nav">
      <div className="custom-profile-section" onClick={toggleDropdown}>
        <img
          src={session?.user?.image || "/default-profile.png"}
          alt="Profile"
          className="custom-profile-image"
        />
        <span className="custom-profile-name">{session?.user?.name || "User Name"}</span>
        <ArrowDropDownIcon style={{ color: 'black' }} /> {/* Material-UI chevron */}
      </div>
      {isDropdownOpen && (
        <div className="custom-dropdown-menu">
          <div className="custom-dropdown-item">{session?.user?.email}</div>
          <div className="custom-dropdown-item" onClick={() => alert('Navigate to Settings')}>
            <SettingsIcon style={{ color: 'black', marginRight: '8px' }} /> {/* Settings icon */}
            Settings
          </div>
          <div className="custom-dropdown-item" onClick={handleSignOut}>
            <LogoutIcon style={{ color: 'black', marginRight: '8px' }} /> {/* Logout icon */}
            Sign out
          </div>
        </div>
      )}
    </div>
  );
}
