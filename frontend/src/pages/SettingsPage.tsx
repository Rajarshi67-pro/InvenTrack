import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Bell, Database } from 'lucide-react';
import { toast } from 'sonner';

interface AppSettings {
  companyName: string;
  timezone: string;
  currency: string;
  lowStockThreshold: number;
  emailNotifications: boolean;
  autoForecast: boolean;
  forecastPeriod: number;
  allowManagerCreatePO: boolean;
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ enabled, onToggle }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-blue-600' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    companyName: 'SupplySync AI Enterprise',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    lowStockThreshold: 20,
    emailNotifications: true,
    autoForecast: true,
    forecastPeriod: 6,
    allowManagerCreatePO: false,
  });

  const handleSave = () => toast.success('Settings saved successfully!');

  const toggle = (key: keyof AppSettings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const toggleKeys: Array<{ key: keyof AppSettings; label: string; desc: string }> = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      desc: 'Receive alerts via email',
    },
    {
      key: 'autoForecast',
      label: 'Auto Forecasting',
      desc: 'Run AI forecasts daily at 2 AM',
    },
    {
      key: 'allowManagerCreatePO',
      label: 'Allow Manager to Create POs',
      desc: 'Managers can create purchase orders without admin approval',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="section-title">System Settings</h1>
          <p className="section-subtitle">Configure your SupplySync AI platform</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Company Settings */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white">Company Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company Name</label>
              <input
                className="input-field"
                value={settings.companyName}
                onChange={(e) => setSettings((s) => ({ ...s, companyName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Timezone</label>
              <input
                className="input-field"
                value={settings.timezone}
                onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Currency</label>
              <input
                className="input-field"
                value={settings.currency}
                onChange={(e) => setSettings((s) => ({ ...s, currency: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Low Stock Threshold (%)
              </label>
              <input
                type="number"
                className="input-field"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, lowStockThreshold: Number(e.target.value) }))
                }
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            {toggleKeys.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ToggleSwitch
                  enabled={settings[key] as boolean}
                  onToggle={() => toggle(key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Forecasting */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-semibold text-white">AI Forecasting</h3>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Forecast Horizon (months)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              className="input-field w-40"
              value={settings.forecastPeriod}
              onChange={(e) =>
                setSettings((s) => ({ ...s, forecastPeriod: Number(e.target.value) }))
              }
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
