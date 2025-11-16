/// <reference types="react" />
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/db';
import GradientText from '../ui/GradientText';
import { Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

const NewSettings = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">
        <GradientText>Settings</GradientText>
      </h1>
      <p className="text-white/70 mb-8">Manage your account settings</p>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg mb-6">
          <Check className="w-5 h-5 text-neon-green" />
          <p className="text-neon-green">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="flex border-b border-white/10 mb-8">
        <button
          onClick={() => {
            setActiveTab('profile');
            clearMessages();
          }}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'profile'
              ? 'text-white border-b-2 border-electric-blue'
              : 'text-white/60'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => {
            setActiveTab('security');
            clearMessages();
          }}
          className={`px-6 py-3 font-semibold ${
            activeTab === 'security'
              ? 'text-white border-b-2 border-electric-blue'
              : 'text-white/60'
          }`}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <ProfileSettings user={user} setSuccess={setSuccess} setError={setError} />
      )}
      {activeTab === 'security' && (
        <SecuritySettings setSuccess={setSuccess} setError={setError} />
      )}
    </div>
  );
};

const ProfileSettings = ({ user, setSuccess, setError }: { user: any, setSuccess: (msg: string) => void, setError: (msg: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    street: '',
    postal_code: '',
    city: '',
    country: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser && authUser.user_metadata) {
      setProfile({
        first_name: authUser.user_metadata.first_name || '',
        last_name: authUser.user_metadata.last_name || '',
        phone: authUser.user_metadata.phone || '',
        street: authUser.user_metadata.street || '',
        postal_code: authUser.user_metadata.postal_code || '',
        city: authUser.user_metadata.city || '',
        country: authUser.user_metadata.country || '',
      });
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  async function handleSaveProfile() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { ...profile }
      });

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">First Name</label>
          <input
            type="text"
            name="first_name"
            value={profile.first_name}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={profile.last_name}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your last name"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Your email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg opacity-60"
            placeholder="Enter your email"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Phone number</label>
          <input
            type="text"
            name="phone"
            value={profile.phone}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your phone number"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-6">Update Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Street</label>
          <input
            type="text"
            name="street"
            value={profile.street}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your street"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Postal code</label>
          <input
            type="text"
            name="postal_code"
            value={profile.postal_code}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your postal code"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">City</label>
          <input
            type="text"
            name="city"
            value={profile.city}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your city"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Country</label>
          <input
            type="text"
            name="country"
            value={profile.country}
            onChange={handleProfileChange}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
            placeholder="Enter your country"
          />
        </div>
      </div>
      <button 
        onClick={handleSaveProfile}
        disabled={loading}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );
};

const SecuritySettings = ({ setSuccess, setError }: { setSuccess: (msg: string) => void, setError: (msg: string) => void }) => {
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  async function handleChangePassword() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Password changed successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>
      <div className="space-y-6 max-w-md">
        <div>
          <label className="block text-sm font-semibold mb-2">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
              placeholder="Enter your new password"
            />
            <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-white/60">
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
              placeholder="Confirm your new password"
            />
            <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 px-4 flex items-center text-white/60">
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>
      <button 
        onClick={handleChangePassword}
        disabled={passwordLoading}
        className="mt-8 px-6 py-3 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
      >
        {passwordLoading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  );
};

export default NewSettings;
