export async function getNetworkInfo() {
  const apis = [
    { name: 'UAPIS', url: '/api/uapis/myip.php', type: 'json' },
    { name: 'IP.SB', url: '/api/ip-sb/ip', type: 'plain' },
    { name: '52VMY', url: '/api/52vmy/query/itad', type: 'json' },
    { name: 'Cloudflare', url: '/api/cloudflare/cdn-cgi/trace', type: 'plain' }
  ];

  const results = await Promise.all(apis.map(async (api) => {
    try {
      const response = await fetch(api.url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let rawData;
      if (api.type === 'json') {
        rawData = await response.json();
        return { 
          source: api.name, 
          ip: rawData.ip, 
          info: formatInfo(rawData),
          rawData: JSON.stringify(rawData, null, 2)
        };
      } else {
        rawData = await response.text();
        const ip = api.url.includes('cloudflare') ? rawData.match(/ip=(.*)/)[1] : rawData.trim();
        const ipInfoResponse = await fetch(`/api/52vmy/query/itad?ip=${ip}`);
        const ipInfoData = await ipInfoResponse.json();
        return { 
          source: api.name, 
          ip, 
          info: formatInfo(ipInfoData.data),
          rawData: rawData
        };
      }
    } catch (error) {
      console.error(`Error fetching from ${api.url}:`, error);
      return { source: api.name, error: error.message };
    }
  }));

  const validResults = results.filter(result => result && result.ip && result.info !== 'Information not available');

  if (validResults.length === 0) {
    throw new Error('Failed to fetch IP information');
  }

  // 对 IP 地址进行格式化和去重
  const uniqueIPs = [...new Set(validResults.map(result => formatIP(result.ip)))];

  // 为每个唯一的 IP 地址选择一个结果
  const finalResults = uniqueIPs.map(ip => {
    const matchingResults = validResults.filter(result => formatIP(result.ip) === ip);
    return matchingResults.reduce((best, current) => 
      current.info.length > best.info.length ? current : best
    );
  });

  return { finalResults, allResults: results };
}

function formatIP(ip) {
  // 简单的 IP 格式化，去除空格并转为小写
  return ip.trim().toLowerCase();
}

function formatInfo(data) {
  if (data.country && data.region && data.city && data.isp) {
    return `${data.country} ${data.region} ${data.city} ${data.isp}`;
  } else if (data.address && data.home) {
    return `${data.home} ${data.address}`;
  }
  return 'Information not available';
}

const TIMEOUT = 5000; // 5 秒超时

export async function pingWebsite(url, type) {
  try {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
    }, TIMEOUT);

    if (type === 'local') {
      try {
        const startTime = Date.now();
        const response = await fetch(`https://${url}`, { 
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'omit',
        });
        clearTimeout(timer);
        if (timedOut) {
          return { error: 'Request timed out' };
        }
        const endTime = Date.now();
        const latency = endTime - startTime;
        return { status: 'OK', latency };
      } catch (error) {
        clearTimeout(timer);
        console.error(`Error pinging ${url} locally:`, error);
        if (error.message.includes('Failed to fetch')) {
          return { error: 'Failed to connect' };
        }
        return { error: timedOut ? 'Request timed out' : error.message || 'Request failed' };
      }
    } else {
      try {
        const response = await fetch(`/api/network?action=ping&url=${encodeURIComponent(url)}&type=${type}`);
        clearTimeout(timer);
        if (timedOut) {
          return { error: 'Request timed out' };
        }
        const data = await response.json();
        console.log(`Ping result for ${url} (${type}):`, data);
        return data;
      } catch (error) {
        clearTimeout(timer);
        console.error(`Error pinging ${url} from server:`, error);
        return { error: timedOut ? 'Request timed out' : error.message || 'Request failed' };
      }
    }
  } catch (error) {
    console.error('Unexpected error in pingWebsite:', error);
    return { error: 'Unexpected error occurred' };
  }
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
