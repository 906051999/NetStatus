'use client';

import { useState } from 'react';
import { pingWebsite } from '../utils/networkUtils';

const websites = [
  { name: 'GitHub', url: 'github.com' },
  { name: 'Cloudflare', url: 'cloudflare.com' },
  { name: 'Google', url: 'google.com' },
  { name: 'YouTube', url: 'youtube.com' },
  { name: 'OpenAI', url: 'openai.com' },
  { name: 'Claude', url: 'anthropic.com' },
  { name: 'Bilibili', url: 'bilibili.com' },
  { name: '腾讯', url: 'qq.com' },
  { name: '阿里', url: 'aliyun.com' },
  { name: 'Linux.do', url: 'linux.do' },
];

export default function WebsiteStatus() {
  const [statuses, setStatuses] = useState({});

  const handlePing = async (url) => {
    try {
      const result = await pingWebsite(url);
      setStatuses(prev => ({ ...prev, [url]: result }));
    } catch (error) {
      console.error('Error pinging website:', error);
      setStatuses(prev => ({ ...prev, [url]: { error: error.message } }));
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">网站访问状态</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {websites.map(({ name, url }) => (
          <div key={url} className="border p-4 rounded">
            <button
              onClick={() => handlePing(url)}
              className="w-full text-left"
            >
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm">{url}</p>
            </button>
            {statuses[url] && (
              <div className="mt-2 text-sm">
                {statuses[url].error ? (
                  <p className="text-red-500">{statuses[url].error}</p>
                ) : (
                  <>
                    <p>本地：</p>
                    <p>状态: {statuses[url].local.status}</p>
                    <p>延迟: {statuses[url].local.latency !== undefined ? `${statuses[url].local.latency}ms` : 'N/A'}</p>
                    <p>服务器：</p>
                    <p>状态: {statuses[url].server.status}</p>
                    <p>延迟: {statuses[url].server.latency !== undefined ? `${statuses[url].server.latency}ms` : 'N/A'}</p>
                    {statuses[url].server.error && <p className="text-red-500">服务器错误: {statuses[url].server.error}</p>}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
