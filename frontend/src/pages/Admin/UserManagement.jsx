import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = ['USER', 'ADMIN', 'TECHNICIAN'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    if (user) {
      setCurrentUser({ ...user, password: '' }); // Don't populate password for edit
    } else {
      setCurrentUser({ name: '', email: '', password: '', role: 'USER' });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser({ name: '', email: '', password: '', role: 'USER' });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setError(null);
      
      if (modalMode === 'create') {
        await userService.createUser(currentUser);
      } else {
        await userService.updateUser(currentUser.id, {
          name: currentUser.name,
          role: currentUser.role
        });
      }
      
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      const data = err.response?.data;
      const errorMessage = typeof data === 'string' ? data : (data?.message || data?.error || 'An error occurred while saving the user.');
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        await fetchUsers();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#CCD0CF' }}>User Management</h1>
          <p className="mt-1 font-medium text-sm" style={{ color: '#9BA8AB' }}>
            Manage system access, assign roles, and administer user accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border px-4 py-2" style={{ backgroundColor: '#1A3A42', borderColor: '#2D5A66', color: '#4ECDC4' }}>
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Admin Only</span>
          </div>
          <button 
            onClick={() => handleOpenModal('create')}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            style={{ backgroundColor: '#2563EB' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1D4ED8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2563EB'}
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid #253745' }}>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#4A5C6A' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm"
              style={{ 
                backgroundColor: '#0F1A22',
                border: '1px solid #253745',
                color: '#CCD0CF'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#4A5C6A'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74,92,106,0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#253745'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12" style={{ color: '#4A5C6A' }}>
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading users...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#0F1A22', borderBottom: '1px solid #253745' }}>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#4A5C6A' }}>Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: '#4A5C6A' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#253745' }}>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderColor: '#253745' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1A2E3A'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: '#2563EB' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#CCD0CF' }}>{user.name}</p>
                            <p className="text-xs" style={{ color: '#9BA8AB' }}>{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#1A3A42', borderColor: '#2D5A66', border: '1px solid #2D5A66', color: '#4ECDC4' }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal('edit', user)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#4A5C6A' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.backgroundColor = '#1A3A42'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#4A5C6A'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title="Edit User"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#4A5C6A' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#4A5C6A'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center" style={{ color: '#4A5C6A' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="rounded-2xl shadow-xl w-full max-w-md overflow-hidden" style={{ backgroundColor: '#11212D', border: '1px solid #253745' }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #253745' }}>
              <h2 className="text-lg font-bold" style={{ color: '#CCD0CF' }}>
                {modalMode === 'create' ? 'Add New User' : 'Edit User Role'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#4A5C6A' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#CCD0CF'; e.currentTarget.style.backgroundColor = '#253745'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#4A5C6A'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#EF4444', border: '1px solid #EF4444', color: '#FF6B6B' }}>
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: '#CCD0CF' }}>Full Name</label>
                <input 
                  type="text" 
                  required
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: '#0F1A22',
                    border: '1px solid #253745',
                    color: '#CCD0CF'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4A5C6A'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#253745'; }}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: '#CCD0CF' }}>Email Address</label>
                <input 
                  type="email" 
                  required
                  disabled={modalMode === 'edit'}
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                  style={{ 
                    backgroundColor: '#0F1A22',
                    border: '1px solid #253745',
                    color: '#CCD0CF',
                    opacity: modalMode === 'edit' ? 0.6 : 1,
                    cursor: modalMode === 'edit' ? 'not-allowed' : 'auto'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4A5C6A'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#253745'; }}
                  placeholder="john@example.com"
                />
              </div>

              {modalMode === 'create' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: '#CCD0CF' }}>Password</label>
                  <input 
                    type="password" 
                    required={modalMode === 'create'}
                    value={currentUser.password}
                    onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: '#0F1A22',
                      border: '1px solid #253745',
                      color: '#CCD0CF'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4A5C6A'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#253745'; }}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: '#CCD0CF' }}>System Role</label>
                <select 
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none"
                  style={{ 
                    backgroundColor: '#0F1A22',
                    border: '1px solid #253745',
                    color: '#CCD0CF'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#4A5C6A'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#253745'; }}
                >
                  {roles.map(role => (
                    <option key={role} value={role} style={{ backgroundColor: '#11212D', color: '#CCD0CF' }}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: '1px solid #253745',
                    color: '#CCD0CF'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1A2E3A'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: '#2563EB',
                    color: 'white',
                    opacity: submitLoading ? 0.7 : 1,
                    cursor: submitLoading ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={e => { if (!submitLoading) e.currentTarget.style.backgroundColor = '#1D4ED8'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
                >
                  {submitLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
