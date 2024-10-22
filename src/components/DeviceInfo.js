'use client';

import { useState } from 'react';
import { getDeviceInfo } from '../utils/deviceUtils';

export default function DeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">设备信息</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!deviceInfo ? (
        <button
          onClick={handleFetchDeviceInfo}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? '获取中...' : '获取设备信息'}
        </button>
      ) : (
        <>
          <ul className="space-y-2">
            <li>设备类型：{deviceInfo.type}</li>
            <li>型号：{deviceInfo.model}</li>
            <li>分辨率：{deviceInfo.resolution}</li>
            <li>电池状态：{deviceInfo.battery}</li>
            <li>
              传感器数据：
              <ul className="pl-4">
                <li>加速度计：X: {deviceInfo.sensors.accelerometer.x}, Y: {deviceInfo.sensors.accelerometer.y}, Z: {deviceInfo.sensors.accelerometer.z}</li>
                <li>陀螺仪：Alpha: {deviceInfo.sensors.gyroscope.alpha}, Beta: {deviceInfo.sensors.gyroscope.beta}, Gamma: {deviceInfo.sensors.gyroscope.gamma}</li>
              </ul>
            </li>
          </ul>
          <button
            onClick={handleFetchDeviceInfo}
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
