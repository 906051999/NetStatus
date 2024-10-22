'use client';

import { useState, useEffect } from 'react';
import { getNetworkInfo } from '../utils/networkUtils';
import { motion } from 'framer-motion';

export default function NetworkInfo({ openModal }) {
  const [localNetworkInfo, setLocalNetworkInfo] = useState(null);
  const [serverNetworkInfo, setServerNetworkInfo] = useState(null);
  const [allResults, setAllResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  const handleFetchNetworkInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { localResults, serverResults } = await getNetworkInfo();
      setLocalNetworkInfo(localResults.finalResults);
      setServerNetworkInfo(serverResults.finalResults);
      setAllResults([...localResults.allResults, ...serverResults.allResults]);
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

  const renderNetworkInfo = (title, networkInfo) => {
    return (
      <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
        <h3 className="font-semibold text-sm sm:text-base mb-2">{title}</h3>
        <div className="space-y-2">
          {networkInfo && networkInfo.map((info, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-50 rounded-lg p-2 shadow-sm transition-all duration-300 hover:shadow-md text-xs"
            >
              <p className="font-semibold text-blue-600">IP: {info.ip}</p>
              <p className="text-gray-700">{info.info}</p>
              <p className="text-gray-500 mt-1">来源: {info.source}</p>
            </motion.div>
          ))}
        </div>
        {networkInfo && networkInfo.length > 1 && (
          <motion.p variants={itemVariants} className="mt-2 p-2 bg-yellow-100 rounded-lg text-yellow-700 text-xs">
            注意：检测到多个不同的 IP 地址。这可能是由于使用了代理、VPN 或多网络接口。
          </motion.p>
        )}
      </div>
    );
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white shadow-md rounded-lg p-3 mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">网络信息</h2>
        {allResults && (
          <button
            onClick={() => openModal(allResults)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            查看原始数据
          </button>
        )}
      </div>
      {error && (
        <motion.p variants={itemVariants} className="text-red-500 mb-2 p-2 bg-red-100 rounded-lg text-xs">
          错误：{error}
        </motion.p>
      )}
      {isLoading ? (
        <motion.p variants={itemVariants} className="text-blue-500 mb-2 text-xs">
          正在获取网络信息...
        </motion.p>
      ) : (
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            {renderNetworkInfo("本地请求结果", localNetworkInfo)}
            {renderNetworkInfo("服务器请求结果", serverNetworkInfo)}
          </div>
          <motion.button
            variants={itemVariants}
            onClick={handleFetchNetworkInfo}
            disabled={isLoading}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full shadow-sm transition duration-300 ease-in-out disabled:opacity-50 text-xs"
          >
            {isLoading ? '获取中...' : '重新获取'}
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  );
}
