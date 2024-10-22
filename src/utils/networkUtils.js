export async function getNetworkInfo() {
  const response = await fetch('/api/network?action=ip');
  if (!response.ok) {
    throw new Error('Failed to fetch network info');
  }
  return response.json();
}

export async function pingWebsite(url, type) {
  const response = await fetch(`/api/network?action=ping&url=${encodeURIComponent(url)}&type=${type}`);
  const data = await response.json();
  console.log(`Ping result for ${url} (${type}):`, data);
  if (!response.ok) {
    throw new Error(data.error || 'Failed to ping website');
  }
  return data;
}

export async function getLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // 这里可以添加反向地理编码的 API 调用来获取地址
          resolve({ latitude, longitude });
        },
        (error) => {
          reject(new Error('Failed to get location: ' + error.message));
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
}
