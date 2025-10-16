import { Tabs } from './tabs';

export const TabComponentV1 = () => {
  return (
    <Tabs.Root>
      <Tabs.List>
        <Tabs.Trigger>
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>Overview</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger>
          <div className="flex items-center gap-2">
            <span>📈</span>
            <span>Analytics</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger>
          <div className="flex items-center gap-2">
            <span>⚙️</span>
            <span>Settings</span>
          </div>
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Panel>
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">2,543</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-3xl font-bold">$45.2K</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Growth</p>
              <p className="text-3xl font-bold">+12%</p>
            </div>
          </div>
          <p className="text-gray-600">
            Welcome to your dashboard. Here's a quick summary of your key metrics.
          </p>
        </div>
      </Tabs.Panel>

      <Tabs.Panel>
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Analytics Report</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Page Views</span>
              <span className="text-green-600">↑ 23%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Bounce Rate</span>
              <span className="text-red-600">↓ 8%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Avg. Session</span>
              <span className="text-blue-600">4m 32s</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Data from the last 30 days. Updated hourly.</p>
        </div>
      </Tabs.Panel>

      <Tabs.Panel>
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Notifications
              </label>
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm text-gray-600">Receive weekly summary emails</span>
            </div>
            <div className="border-b pb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme Preference
              </label>
              <select className="px-3 py-2 border rounded-md">
                <option>Light Mode</option>
                <option>Dark Mode</option>
                <option>System Default</option>
              </select>
            </div>
            <div className="border-b pb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select className="px-3 py-2 border rounded-md">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </Tabs.Panel>
    </Tabs.Root>
  );
};
