import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null if not logged in
  const [portal, setPortal] = useState(null); // 'admin' | 'student' | null

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setPortal(null);
  };

  const switchPortal = (selectedPortal) => {
    setPortal(selectedPortal);
  };

  return (
    <AuthContext.Provider value={{ user, portal, login, logout, switchPortal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
