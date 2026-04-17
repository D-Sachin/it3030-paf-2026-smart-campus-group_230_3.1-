import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Predefined users based on the DataInitializer seeding
  const availableUsers = [
    { id: 1, name: 'John Admin', email: 'admin@smartcampus.com', role: 'ADMIN', initials: 'JA' },
    { id: 2, name: 'Mike Technician', email: 'tech@smartcampus.com', role: 'TECHNICIAN', initials: 'MT' },
    { id: 3, name: 'Sarah Student', email: 'student@smartcampus.com', role: 'USER', initials: 'SS' }
  ];

  // Try to load user from localStorage, or default to Admin
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : availableUsers[0];
  });

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, [user]);

  const switchUser = (id) => {
    const selected = availableUsers.find(u => u.id === id);
    if (selected) setUser(selected);
  };

  return (
    <UserContext.Provider value={{ user, availableUsers, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
