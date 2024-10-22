export async function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  const deviceInfo = {
    type: getDeviceType(userAgent, platform),
    model: getDeviceModel(userAgent),
    resolution: `${window.screen.width} x ${window.screen.height}`,
    battery: await getBatteryInfo(),
    sensors: await getSensorData(),
  };

  return deviceInfo;
}

function getDeviceType(userAgent, platform) {
  if (/mobile/i.test(userAgent)) return 'Smartphone';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  if (/win/i.test(platform)) return 'Desktop (Windows)';
  if (/mac/i.test(platform)) return 'Desktop (Mac)';
  if (/linux/i.test(platform)) return 'Desktop (Linux)';
  return 'Unknown';
}

function getDeviceModel(userAgent) {
  const matches = userAgent.match(/\(([^)]+)\)/);
  return matches ? matches[1] : 'Unknown';
}

async function getBatteryInfo() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return `${(battery.level * 100).toFixed(2)}%, ${battery.charging ? 'charging' : 'not charging'}`;
    } catch (error) {
      console.error('Error getting battery info:', error);
      return 'Not available';
    }
  }
  return 'Not available';
}

async function getSensorData() {
  const sensors = {
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
  };

  if ('DeviceMotionEvent' in window && typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceMotionEvent.requestPermission();
      if (permission === 'granted') {
        window.addEventListener('devicemotion', (event) => {
          sensors.accelerometer = {
            x: event.acceleration.x,
            y: event.acceleration.y,
            z: event.acceleration.z,
          };
        });
      }
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
    }
  }

  if ('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === 'granted') {
        window.addEventListener('deviceorientation', (event) => {
          sensors.gyroscope = {
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
          };
        });
      }
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  }

  return sensors;
}
