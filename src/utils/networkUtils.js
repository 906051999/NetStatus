const API_TIMEOUT = 5000; // 5 秒超时

export async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

export async function getNetworkInfo() {
  const [localResults, serverResults] = await Promise.all([
    getLocalNetworkInfo(),
    getServerNetworkInfo()
  ]);

  return { localResults, serverResults };
}

async function getLocalNetworkInfo() {
  // 使用之前的 getNetworkInfo 逻辑
  const apis = [
    { name: 'UAPIS', url: '/api/uapis/myip.php', type: 'json' },
    { name: 'IP.SB', url: '/api/ip-sb/ip', type: 'plain' },
    { name: '52VMY', url: '/api/52vmy/query/itad', type: 'json' },
    { name: 'Cloudflare', url: '/api/cloudflare/cdn-cgi/trace', type: 'plain' }
  ];

  const results = await Promise.all(apis.map(fetchApiData));
  return processResults(results);
}

async function getServerNetworkInfo() {
  try {
    const response = await fetchWithTimeout('/api/network?action=getIpInfo');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return processResults([result]); // 将结果包装在数组中，以保持与之前逻辑的一致性
  } catch (error) {
    console.error('Error fetching server network info:', error);
    return { finalResults: [], allResults: [] };
  }
}

function processResults(results) {
  const validResults = results.filter(result => result && result.ip && result.info !== 'Information not available');

  if (validResults.length === 0) {
    return { finalResults: [], allResults: results };
  }

  const uniqueIPs = [...new Set(validResults.map(result => formatIP(result.ip)))];

  const finalResults = uniqueIPs.map(ip => {
    const matchingResults = validResults.filter(result => formatIP(result.ip) === ip);
    return matchingResults.reduce((best, current) => 
      current.info.length > best.info.length ? current : best
    );
  });

  return { finalResults, allResults: results };
}

async function fetchApiData(api) {
  try {
    const response = await fetchWithTimeout(api.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let rawData, ip, ipInfoData;
    if (api.type === 'json') {
      rawData = await response.json();
      ip = rawData.ip;
      ipInfoData = rawData;
    } else {
      rawData = await response.text();
      ip = api.url.includes('cloudflare') ? rawData.match(/ip=(.*)/)[1] : rawData.trim();
      const ipInfoResponse = await fetchWithTimeout(`/api/52vmy/query/itad?ip=${ip}`);
      ipInfoData = await ipInfoResponse.json();
    }
    return { 
      source: api.name, 
      ip, 
      info: formatInfo(api.type ===
      'json' ? ipInfoData : ipInfoData.data),
      rawData: api.type === 'json' ? JSON.stringify(rawData, null, 2) : rawData
    };
  } catch (error) {
    console.error(`Error fetching from ${api.url}:`, error);
    return { source: api.name, error: error.message };
  }
}

function formatIP(ip) {
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

export async function pingWebsite(url, type) {
  if (type === 'local') {
    return localPingWebsite(url);
  } else if (type === 'server') {
    return serverPingWebsite(url);
  } else {
    throw new Error('Invalid ping type');
  }
}

async function localPingWebsite(url) {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = img.onerror = () => {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      resolve({ status: 'Reachable', latency });
    };
    
    img.src = `https://${url}/favicon.ico?t=${Date.now()}`;
    
    // 设置超时
    setTimeout(() => {
      if (!img.complete) {
        img.src = '';
        resolve({ error: 'Request timed out' });
      }
    }, API_TIMEOUT);
  });
}

async function serverPingWebsite(url) {
  try {
    const response = await fetchWithTimeout(`/api/network?action=ping&url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return { error: 'Request was aborted' };
    }
    return { error: error.message || 'Request failed' };
  }
}

export async function getLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
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
