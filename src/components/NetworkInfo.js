'use client';

import { useState } from 'react';
import { getNetworkInfo } from '../utils/networkUtils';

export default function NetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchNetworkInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    } catch (err) {
      console.error('Failed to fetch network info:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">网络信息</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!networkInfo ? (
        <button
          onClick={handleFetchNetworkInfo}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? '获取中...' : '获取网络信息'}
        </button>
      ) : (
        <>
          <ul className="space-y-2">
            {networkInfo.map((info, index) => (
              <li key={index}>
                IP: {info.ip}
                <br />
                信息: {info.info}
              </li>
            ))}
          </ul>
          {networkInfo.length > 1 && (
            <p className="mt-2 text-yellow-600">注意：检测到多个不同的 IP 地址。</p>
          )}
          <button
            onClick={handleFetchNetworkInfo}
            disabled={isLoading}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? '获取中...' : '重新获取'}
          </button>
        </>
      )}
    </section>
  );
}
