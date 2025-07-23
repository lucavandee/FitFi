import React, { useState } from 'react';
import { User, Mail, Lock, Shield, Trash2, Save } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';

const AccountSettings: React.FC = () => {
  const { user, updateProfile } = useUser();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Wachtwoorden komen niet overeen');
      return;
    }
    
    // TODO: Implement password change
    console.log('Changing password...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      // TODO: Implement account deletion
      console.log('Deleting account...');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center">
          <User className="mr-3" size={24} />
          Profielinformatie
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Naam
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-mailadres
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            disabled={isSaving}
            icon={<Save size={16} />}
            iconPosition="left"
          >
            {isSaving ? 'Opslaan...' : 'Profiel opslaan'}
          </Button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lock className="mr-2" size={20} />
          Wachtwoord wijzigen
        </h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
              Huidig wachtwoord
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              Nieuw wachtwoord
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Bevestig nieuw wachtwoord
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <Button
            variant="secondary"
            onClick={handleChangePassword}
            icon={<Lock size={16} />}
            iconPosition="left"
          >
            Wachtwoord wijzigen
          </Button>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="mr-2" size={20} />
          Privacy & Beveiliging
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Gegevens downloaden</h4>
              <p className="text-sm text-gray-600">Download al je gegevens in JSON-formaat</p>
            </div>
            <Button variant="ghost" size="sm">
              Download
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Account verwijderen</h4>
              <p className="text-sm text-gray-600">Permanent verwijderen van je account en alle gegevens</p>
            </div>
            <Button 
              variant="danger" 
              size="sm"
              onClick={handleDeleteAccount}
              icon={<Trash2 size={16} />}
              iconPosition="left"
            >
              Verwijderen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;