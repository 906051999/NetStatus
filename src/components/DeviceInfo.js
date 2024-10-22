'use client';

import { useState, useEffect } from 'react';
import { getDeviceInfo } from '../utils/deviceUtils';
import ComponentInfo from './ComponentInfo';
import { motion } from 'framer-motion';

export default function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const handleFetchDeviceInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await getDeviceInfo();
      setDeviceInfo(info);
    } catch (err) {
      console.error('Failed to fetch device info:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      handleFetchDeviceInfo();
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white shadow-lg rounded-lg p-3 sm:p-4 mb-6"
    >
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">设备信息</h2>
      {error && (
        <motion.p variants={itemVariants} className="text-red-500 mb-3 text-xs sm:text-sm">
          {error}
        </motion.p>
      )}
      {!deviceInfo && isClient && (
        <motion.button
          variants={itemVariants}
          onClick={handleFetchDeviceInfo}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out disabled:opacity-50 text-xs sm:text-sm"
        >
          {isLoading ? '获取中...' : '获取设备信息'}
        </motion.button>
      )}
      {deviceInfo && (
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            <InfoItem label="设备指纹" value={deviceInfo.fingerprint} />
            <InfoItem label="设备类型" value={deviceInfo.type} />
            <InfoItem label="操作系统" value={deviceInfo.os} />
            <InfoItem label="浏览器" value={deviceInfo.browser} />
            <InfoItem label="设备型号" value={deviceInfo.model} />
            <InfoItem label="设备制造商" value={deviceInfo.vendor} />
            <InfoItem label="逻辑分辨率" value={deviceInfo.logicalResolution} />
            <InfoItem label="物理分辨率" value={deviceInfo.physicalResolution} />
            <InfoItem label="设备像素比" value={deviceInfo.devicePixelRatio} />
            <InfoItem label="电池状态" value={deviceInfo.battery} />
            <InfoItem label="网络类型" value={deviceInfo.networkType} />
            <InfoItem label="设备方向" value={deviceInfo.orientation} />
          </div>
          {deviceInfo.sensors && (
            <div className="mt-3">
              <h3 className="text-base font-semibold mb-2">传感器数据</h3>
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {deviceInfo.sensors.accelerometer && (
                  <InfoItem
                    label="加速度计"
                    value={`X: ${deviceInfo.sensors.accelerometer.x.toFixed(2)}, Y: ${deviceInfo.sensors.accelerometer.y.toFixed(2)}, Z: ${deviceInfo.sensors.accelerometer.z.toFixed(2)}`}
                  />
                )}
                {deviceInfo.sensors.gyroscope && (
                  <InfoItem
                    label="陀螺仪"
                    value={`Alpha: ${deviceInfo.sensors.gyroscope.alpha.toFixed(2)}, Beta: ${deviceInfo.sensors.gyroscope.beta.toFixed(2)}, Gamma: ${deviceInfo.sensors.gyroscope.gamma.toFixed(2)}`}
                  />
                )}
              </div>
            </div>
          )}
          <motion.button
            variants={itemVariants}
            onClick={handleFetchDeviceInfo}
            disabled={isLoading}
            className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out disabled:opacity-50 text-xs sm:text-sm"
          >
            {isLoading ? '获取中...' : '刷新信息'}
          </motion.button>
        </motion.div>
      )}
      {deviceInfo && deviceInfo.components && (
        <ComponentInfo components={deviceInfo.components} />
      )}
    </motion.section>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className={`flex flex-col border-b border-gray-200 py-1 text-xs sm:text-sm ${value.length > 20 ? 'col-span-3' : ''}`}>
      <span className="font-medium text-gray-600">{label}</span>
      <span className="text-gray-800 break-words">{value}</span>
    </div>
  );
}
