import React from 'react';
import Title3D from '../../components/Title3D';

const StatCard: React.FC<{ title: string; value: string; change: string }> = ({ title, value, change }) => (
  <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800">
    <h3 className="text-sm font-medium text-slate-400">{title}</h3>
    <p className="text-3xl font-bold text-white mt-1">{value}</p>
    <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs last month</p>
  </div>
);

const StatisticsTab = () => (
    <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Site Visits" value="10,482" change="+12.5%" />
          <StatCard title="Total Song Plays" value="25,129" change="+20.1%" />
          <StatCard title="New Messages" value="34" change="-5.2%" />
          <StatCard title="Avg. Listen Time" value="2m 45s" change="+8.0%" />
          <StatCard title="Top Referrer" value="Spotify" change="social" />
          <StatCard title="Conversion Rate" value="3.4%" change="+0.5%" />
        </div>
        <div className="mt-12 bg-slate-900/50 p-6 rounded-lg border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4 title-3d-light">Recent Activity</h2>
            <ul>
                <li className="py-2 border-b border-slate-800">New message from 'contact@majorlabel.com'</li>
                <li className="py-2 border-b border-slate-800">Blog post "The Making of..." reached 1k views.</li>
                <li className="py-2">User from London, UK spent 15 minutes on the site.</li>
            </ul>
        </div>
    </>
);

export default StatisticsTab;
