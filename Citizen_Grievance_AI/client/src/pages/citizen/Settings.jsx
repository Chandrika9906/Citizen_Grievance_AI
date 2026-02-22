import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Bell, Moon, Globe, Shield, Download, Trash2, Check } from 'lucide-react';

export default function Settings() {
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    complaintUpdates: true,
    systemUpdates: false,
    language: 'en',
    autoSave: true,
    twoFactor: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      if (response.data) {
        setSettings({
          darkMode: response.data.darkMode || false,
          emailNotifications: response.data.notifications?.email || true,
          pushNotifications: response.data.notifications?.push || true,
          smsNotifications: response.data.notifications?.sms || false,
          complaintUpdates: response.data.notifications?.complaintUpdates || true,
          systemUpdates: response.data.notifications?.systemUpdates || false,
          language: response.data.language || 'en',
          autoSave: response.data.autoSave || true,
          twoFactor: response.data.twoFactor || false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      await settingsAPI.update({
        darkMode: newSettings.darkMode,
        notifications: {
          email: newSettings.emailNotifications,
          push: newSettings.pushNotifications,
          sms: newSettings.smsNotifications,
          complaintUpdates: newSettings.complaintUpdates,
          systemUpdates: newSettings.systemUpdates
        },
        language: newSettings.language,
        autoSave: newSettings.autoSave,
        twoFactor: newSettings.twoFactor
      });
      setSaveMessage('Settings updated successfully!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setSaveMessage('Failed to update settings');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  const handleLanguageChange = async (e) => {
    const newSettings = { ...settings, language: e.target.value };
    setSettings(newSettings);
    
    try {
      await settingsAPI.update({
        language: e.target.value,
        notifications: {
          email: newSettings.emailNotifications,
          push: newSettings.pushNotifications,
          sms: newSettings.smsNotifications,
          complaintUpdates: newSettings.complaintUpdates,
          systemUpdates: newSettings.systemUpdates
        }
      });
      setSaveMessage('Language updated successfully!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await settingsAPI.get();
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-data.json';
      link.click();
      setSaveMessage('Data export started!');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion request submitted. You will receive a confirmation email.');
    }
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading settings...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your preferences and account settings</p>
      </div>

      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">{saveMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates via email</p>
              </div>
              <ToggleSwitch 
                enabled={settings.emailNotifications} 
                onChange={() => toggleSetting('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Get browser push notifications</p>
              </div>
              <ToggleSwitch 
                enabled={settings.pushNotifications} 
                onChange={() => toggleSetting('pushNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">SMS Notifications</p>
                <p className="text-xs text-gray-500">Receive text message alerts</p>
              </div>
              <ToggleSwitch 
                enabled={settings.smsNotifications} 
                onChange={() => toggleSetting('smsNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Complaint Updates</p>
                <p className="text-xs text-gray-500">Notify when complaint status changes</p>
              </div>
              <ToggleSwitch 
                enabled={settings.complaintUpdates} 
                onChange={() => toggleSetting('complaintUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">System Updates</p>
                <p className="text-xs text-gray-500">Get notified about system maintenance</p>
              </div>
              <ToggleSwitch 
                enabled={settings.systemUpdates} 
                onChange={() => toggleSetting('systemUpdates')}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Dark Mode</p>
                <p className="text-xs text-gray-500">Toggle dark theme (Coming soon)</p>
              </div>
              <ToggleSwitch 
                enabled={settings.darkMode} 
                onChange={() => toggleSetting('darkMode')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Auto Save</p>
                <p className="text-xs text-gray-500">Automatically save form drafts</p>
              </div>
              <ToggleSwitch 
                enabled={settings.autoSave} 
                onChange={() => toggleSetting('autoSave')}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Language & Region</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={handleLanguageChange}
              className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add extra security to your account</p>
              </div>
              <ToggleSwitch 
                enabled={settings.twoFactor} 
                onChange={() => toggleSetting('twoFactor')}
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-700 mb-2">Download a copy of your data</p>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
            <Button variant="danger" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
