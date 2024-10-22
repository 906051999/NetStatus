import FingerprintJS from '@fingerprintjs/fingerprintjs';
import UAParser from 'ua-parser-js';

export async function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return { error: 'Cannot get device info on server side' };
  }

  try {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    const uaResult = new UAParser().getResult();

    const deviceInfo = {
      fingerprint: result.visitorId,
      type: getDeviceType(uaResult),
      os: `${uaResult.os.name} ${uaResult.os.version}`,
      browser: `${uaResult.browser.name} ${uaResult.browser.version}`,
      model: uaResult.device.model || '未知',
      vendor: uaResult.device.vendor || '未知',
      ...getScreenInfo(),
      battery: await getBatteryInfo(),
      networkType: await getNetworkType(),
      orientation: getOrientation(),
      sensors: await getSensorData(),
      components: result.components,
    };

    return deviceInfo;
  } catch (error) {
    console.error('Error getting device info:', error);
    return { error: error.message };
  }
}

function getDeviceType(uaResult) {
  const deviceType = uaResult.device.type;
  if (deviceType === 'mobile') return '智能手机';
  if (deviceType === 'tablet') return '平板';
  if (deviceType === 'desktop') return '桌面设备';
  return '未知';
}

function getScreenInfo() {
  const logicalWidth = window.screen.width;
  const logicalHeight = window.screen.height;
  const dpr = window.devicePixelRatio || 1;

  const physicalWidth = Math.round(logicalWidth * dpr);
  const physicalHeight = Math.round(logicalHeight * dpr);

  return {
    logicalResolution: `${logicalWidth} x ${logicalHeight}`,
    physicalResolution: `${physicalWidth} x ${physicalHeight}`,
    devicePixelRatio: dpr
  };
}

async function getBatteryInfo() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return `${(battery.level * 100).toFixed(0)}%, ${battery.charging ? '充电中' : '未充电'}`;
    } catch (error) {
      console.error('获取电池信息失败:', error);
      return '不可用';
    }
  }
  return '不可用';
}

async function getNetworkType() {
  if ('connection' in navigator && navigator.connection) {
    const connection = navigator.connection;
    if (connection.type) {
      return connection.type;
    } else if (connection.effectiveType) {
      const types = {
        'slow-2g': '2G',
        '2g': '2G',
        '3g': '3G',
        '4g': '4G',
      };
      return types[connection.effectiveType] || connection.effectiveType;
    }
  }
  return '未知';
}

function getOrientation() {
  if ('orientation' in screen) {
    switch (screen.orientation.type) {
      case 'portrait-primary':
      case 'portrait-secondary':
        return '竖屏';
      case 'landscape-primary':
      case 'landscape-secondary':
        return '横屏';
      default:
        return screen.orientation.type;
    }
  }
  return '不可用';
}

async function getSensorData() {
  return new Promise((resolve) => {
    const sensors = {};

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', (event) => {
        sensors.accelerometer = {
          x: event.acceleration.x || 0,
          y: event.acceleration.y || 0,
          z: event.acceleration.z || 0,
        };
      }, { once: true });
    }

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', (event) => {
        sensors.gyroscope = {
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0,
        };
      }, { once: true });
    }

    setTimeout(() => {
      resolve(sensors);
    }, 1000);
  });
}
