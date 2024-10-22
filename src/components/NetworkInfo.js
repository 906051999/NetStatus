'use client';

import { useState, useEffect } from 'react';
import { getNetworkInfo } from '../utils/networkUtils';
import { motion } from 'framer-motion';

export default function NetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    handleFetchNetworkInfo();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white shadow-lg rounded-lg p-3 sm:p-4 mb-4"
    >
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">网络信息</h2>
      {error && (
        <motion.p variants={itemVariants} className="text-red-500 mb-2 p-2 bg-red-100 rounded-lg text-xs sm:text-sm">
          错误：{error}
        </motion.p>
      )}
      {isLoading ? (
        <motion.p variants={itemVariants} className="text-blue-500 mb-2 text-xs sm:text-sm">
          正在获取网络信息...
        </motion.p>
      ) : networkInfo ? (
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {networkInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-50 rounded-lg p-2 shadow-md transition-all duration-300 hover:shadow-lg text-xs sm:text-sm"
              >
                <p className="font-semibold text-blue-600 mb-1">IP: {info.ip}</p>
                <p className="text-gray-700">{info.info}</p>
              </motion.div>
            ))}
          </div>
          {networkInfo.length > 1 && (
            <motion.p variants={itemVariants} className="mt-2 p-2 bg-yellow-100 rounded-lg text-yellow-700 text-xs sm:text-sm">
              注意：检测到多个不同的 IP 地址。
            </motion.p>
          )}
          <motion.button
            variants={itemVariants}
            onClick={handleFetchNetworkInfo}
            disabled={isLoading}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out disabled:opacity-50 text-xs sm:text-sm"
          >
            {isLoading ? '获取中...' : '重新获取'}
          </motion.button>
        </motion.div>
      ) : null}
    </motion.section>
  );
}
