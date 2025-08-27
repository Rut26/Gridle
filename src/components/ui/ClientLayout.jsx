"use client";

import { signOut } from "next-auth/react";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HiHome, HiClipboardList, HiDocumentText, HiUserGroup, HiCog, HiShieldCheck, HiChevronLeft, HiChevronRight, HiPlus, HiUserCircle } from "react-icons/hi";

// --- Icons ---
export const UserProfileIcon = () => <HiUserCircle className="w-9 h-9" aria-hidden="true" />;
export const PlusIcon = () => <HiPlus className="w-9 h-9" aria-hidden="true" />;
const AdminIcon = (props) => <HiShieldCheck className="w-9 h-9" {...props} aria-hidden="true" />;
const ArrowIcon = ({ direction = 'left' }) =>
  direction === 'left'
    ? <HiChevronLeft className="w-7 h-7 transition-transform duration-300" aria-hidden="true" />
    : <HiChevronRight className="w-7 h-7 transition-transform duration-300" aria-hidden="true" />;
// --- End Icons ---

const sidebarNavItems = [
  { name: 'Dashboard', icon: (props) => <HiHome className="w-9 h-9" {...props} aria-hidden="true" />, path: '/dashboard' },
  { name: 'Tasks', icon: (props) => <HiClipboardList className="w-9 h-9" {...props} aria-hidden="true" />, path: '/tasks' },
  { name: 'Notes', icon: (props) => <HiDocumentText className="w-9 h-9" {...props} aria-hidden="true" />, path: '/notes' },
  { name: 'Groups', icon: (props) => <HiUserGroup className="w-9 h-9" {...props} aria-hidden="true" />, path: '/groups' },
  { name: 'Settings', icon: (props) => <HiCog className="w-9 h-9" {...props} aria-hidden="true" />, path: '/settings' },
];

const ClientLayout = ({ children, isAdmin = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarExpanded(prev => !prev);
  }, []);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/signin'
      });
      router.push('/signin');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowProfileDropdown(false);
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentPageTitle = useCallback(() => {
    const activeItem = sidebarNavItems.find(item => pathname.startsWith(item.path));
    if (activeItem) return activeItem.name;
    
    if (pathname.startsWith('/tasks/')) return 'Task Details';
    if (pathname === '/signin') return 'Sign In';
    if (pathname === '/signup') return 'Sign Up';
    if (pathname === '/forgot-password') return 'Forgot Password';
    if (pathname === '/reset-password') return 'Reset Password';
    if (pathname === '/admin') return 'Admin Panel';
    
    return 'Gridle';
  }, [pathname]);

  const pageTitle = getCurrentPageTitle();
  const authPaths = ['/', '/signin', '/signup', '/forgot-password', '/reset-password']; 
  const showSidebarAndHeader = !authPaths.includes(pathname);

  return (
    <div className="flex h-screen font-albert-sans bg-background text-foreground">
      {showSidebarAndHeader && (
        <aside 
          className={`
            ${isSidebarExpanded ? 'w-64 px-4' : 'w-20 px-2'} 
            bg-primary text-primary-foreground flex flex-col shadow-lg 
            transition-all duration-300 ease-in-out overflow-hidden
          `}
          aria-label="Sidebar"
        >
          <div className={`py-4 text-center border-b border-primary-foreground/20 ${isSidebarExpanded ? 'mb-6' : 'mb-2'}`}>
            <Link 
              href="/dashboard" 
              className="block text-primary-foreground hover:text-accent transition-colors duration-200"
              aria-label="Dashboard"
            >
              <span className={`${isSidebarExpanded ? 'text-3xl font-extrabold' : 'hidden'}`}>Gridle</span>
              <span className={`${isSidebarExpanded ? 'hidden' : 'text-xl font-extrabold'}`} aria-hidden="true">G</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-2" aria-label="Main navigation">
            {sidebarNavItems.map((item) => (
              <li key={item.name} className="list-none">
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ease-in-out
                    ${pathname.startsWith(item.path) 
                      ? 'bg-accent text-accent-foreground shadow-md font-semibold' 
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                    }`}
                  aria-current={pathname.startsWith(item.path) ? 'page' : undefined}
                >
                  <item.icon className={`${isSidebarExpanded ? 'mr-3' : ''}`} />
                  <span className={`${isSidebarExpanded ? 'text-lg' : 'hidden'}`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li className={`list-none pt-4 border-t border-primary-foreground/10 ${isSidebarExpanded ? 'mt-4' : 'mt-2'}`}>
                <Link
                  href="/admin"
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 ease-in-out
                    ${pathname.startsWith('/admin')
                      ? 'bg-accent text-accent-foreground shadow-md font-semibold'
                      : 'text-primary-foreground hover:bg-primary-foreground/10'
                    }
                    ${isSidebarExpanded ? '' : 'justify-center'}`}
                  aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
                >
                  <AdminIcon className={`${isSidebarExpanded ? 'mr-3' : ''}`} />
                  <span className={`${isSidebarExpanded ? 'text-lg' : 'hidden'}`}>
                    Admin Panel
                  </span>
                </Link>
              </li>
            )}
          </nav>
        </aside>
      )}
      <main className="flex-1 flex flex-col bg-background">
        {showSidebarAndHeader && (
          <header className="flex justify-between items-center p-6 border-b border-border shadow-sm bg-card sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-muted transition-colors duration-200"
                aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                <ArrowIcon direction={isSidebarExpanded ? 'left' : 'right'} />
              </button>
              <h1 className="text-3xl font-semibold text-foreground">{pageTitle}</h1>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-accent transition-colors duration-200 shadow-md"
                aria-label="User menu"
                aria-expanded={showProfileDropdown}
              >
                <UserProfileIcon />
              </button>
              {showProfileDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden"
                  role="menu"
                >
                  <Link 
                    href="/settings" 
                    className="block px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    onClick={() => setShowProfileDropdown(false)}
                    role="menuitem"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-destructive hover:bg-muted transition-colors"
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </header>
        )}
        <section className="flex-1 overflow-y-auto p-6">
          {children}
        </section>
      </main>
    </div>
  );
};

export default ClientLayout;