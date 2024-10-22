'use client';

import { useState, useRef } from 'react';
import { pingWebsite } from '../utils/networkUtils';
import WebsiteLogo from './WebsiteLogo';
import { motion } from 'framer-motion';

const websites = [
  { name: 'Bilibili', url: 'bilibili.com' },
  { name: '腾讯', url: 'qq.com' },
  { name: '腾讯云', url: 'cloud.tencent.com' },
  { name: '阿里云', url: 'aliyun.com' },
  { name: 'Linux.do', url: 'linux.do' },
  { name: 'GitHub', url: 'github.com' },
  { name: 'Cloudflare', url: 'cloudflare.com' },
  { name: 'Google', url: 'google.com' },
  { name: 'YouTube', url: 'youtube.com' },
  { name: 'OpenAI', url: 'openai.com' },
  { name: 'Claude', url: 'anthropic.com' },
  { name: 'Twitter', url: 'twitter.com' },
  { name: 'Facebook', url: 'facebook.com' },
  { name: 'Amazon', url: 'amazon.com' },
  { name: 'Netflix', url: 'netflix.com' },
  { name: 'Microsoft', url: 'microsoft.com' },
  { name: 'Apple', url: 'apple.com' },
  { name: 'Instagram', url: 'instagram.com' },
  { name: 'Reddit', url: 'reddit.com' },
  { name: 'Wikipedia', url: 'wikipedia.org' },
];

export default function WebsiteStatus() {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const abortControllerRef = useRef(null);

  const handlePing = async (url) => {
    setLoading(prev => ({ ...prev, [url]: { local: true, server: true } }));
    setStatuses(prev => ({ ...prev, [url]: {} }));
  
    try {
      const localResult = await pingWebsite(url, 'local');
      setStatuses(prev => ({ ...prev, [url]: { ...prev[url], local: localResult } }));
    } catch (error) {
      console.error('Error pinging website locally:', error);
      setStatuses(prev => ({ ...prev, [url]: { ...prev[url], local: { error: error.message } } }));
    } finally {
      setLoading(prev => ({ ...prev, [url]: { ...prev[url], local: false } }));
    }
  
    try {
      const serverResult = await pingWebsite(url, 'server');
      setStatuses(prev => ({ ...prev, [url]: { ...prev[url], server: serverResult } }));
    } catch (error) {
      console.error('Error pinging website from server:', error);
      setStatuses(prev => ({ ...prev, [url]: { ...prev[url], server: { error: error.message } } }));
    } finally {
      setLoading(prev => ({ ...prev, [url]: { ...prev[url], server: false } }));
    }
  };

  const handlePingAll = async () => {
    setIsTesting(true);
    abortControllerRef.current = new AbortController();
    setLoading(websites.reduce((acc, { url }) => ({ ...acc, [url]: { local: true, server: true } }), {}));
    setStatuses({});

    try {
      await Promise.all(websites.map(async ({ url }) => {
        if (abortControllerRef.current.signal.aborted) return;
        await handlePing(url);
      }));
    } catch (error) {
      console.error('Error during ping all:', error);
    } finally {
      setIsTesting(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopTesting = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTesting(false);
    setLoading({});
  };

  const getButtonText = (url) => {
    if (loading[url]?.local || loading[url]?.server) {
      return '测试中...';
    }
    if (statuses[url]?.local || statuses[url]?.server) {
      return '重试';
    }
    return '测试';
  };

  return (
    <section className="bg-white shadow-lg rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">网站访问状态</h2>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePingAll}
            disabled={isTesting}
            className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            一键全部测试
          </motion.button>
          {isTesting && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStopTesting}
              className="bg-gradient-to-r from-red-400 to-red-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out text-xs sm:text-sm"
            >
              停止测试
            </motion.button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {websites.map(({ name, url }) => (
          <motion.div
            key={url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg shadow-md p-2 transition-all duration-300 hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-1 right-1 w-6 h-6">
              <WebsiteLogo url={url} />
            </div>
            <h3 className="font-semibold text-xs text-blue-600 truncate">{name}</h3>
            <p className="text-xs text-gray-500 truncate">{url}</p>
            <div className="space-y-1 text-xs">
              <PingStatus type="本地" loading={loading[url]?.local} status={statuses[url]?.local} />
              <PingStatus type="服务器" loading={loading[url]?.server} status={statuses[url]?.server} />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePing(url)}
              disabled={loading[url]?.local || loading[url]?.server}
              className="mt-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-1 px-2 rounded-full shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              {getButtonText(url)}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PingStatus({ type, loading, status }) {
  if (loading) {
    return (
      <p className="text-gray-600 text-xs">
        {type}：<span className="text-blue-500 animate-pulse">加载中...</span>
      </p>
    );
  }
  if (!status) {
    return <p className="text-gray-600 text-xs">{type}：<span className="text-gray-400">未测试</span></p>;
  }
  if (status.error) {
    return <p className="text-red-500 text-xs">{type}：错误</p>;
  }
  return (
    <p className="text-xs">
      <span className="font-medium text-gray-700">{type}：</span>
      <span className="text-green-600 font-semibold">{status.status || 'OK'}</span>
      {status.latency !== undefined && (
        <span className="text-blue-600 font-semibold ml-1">{status.latency}ms</span>
      )}
    </p>
  );
}
