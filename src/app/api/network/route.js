import { NextResponse } from 'next/server';
import https from 'https';

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(timeout, () => {
      req.abort();
      reject(new Error('Request timed out'));
    });
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'ip':
        return await getIpInfo();
      case 'ping':
        const url = searchParams.get('url');
        const type = searchParams.get('type');
        return await pingWebsite(url, type);
      case 'location':
        return await getLocation();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getIpInfo() {
  const apis = [
    { url: 'https://uapis.cn/api/myip.php', type: 'json' },
    { url: 'https://api.ip.sb/ip', type: 'plain' },
    { url: 'https://api.52vmy.cn/api/query/itad', type: 'json' },
    { url: 'https://www.cloudflare.com/cdn-cgi/trace', type: 'plain' }
  ];

  const results = await Promise.all(apis.map(async (api) => {
    try {
      const response = await fetchWithTimeout(api.url);
      if (api.type === 'json') {
        const data = JSON.parse(response.data);
        return { ip: data.ip, info: formatInfo(data) };
      } else {
        const text = response.data;
        const ip = api.url.includes('cloudflare') ? text.match(/ip=(.*)/)[1] : text.trim();
        const { data: ipData } = await fetchWithTimeout(`https://api.52vmy.cn/api/query/itad?ip=${ip}`);
        const data = JSON.parse(ipData);
        return { ip, info: formatInfo(data.data) };
      }
    } catch (error) {
      console.error(`Error fetching from ${api.url}:`, error);
      return null;
    }
  }));

  const validResults = results.filter(result => result && result.ip && result.info !== 'Information not available');

  if (validResults.length === 0) {
    return NextResponse.json({ error: 'Failed to fetch IP information' }, { status: 500 });
  }

  const uniqueIps = [...new Set(validResults.map(result => result.ip))];

  if (uniqueIps.length === 1) {
    return NextResponse.json([validResults[0]]);
  } else {
    return NextResponse.json(validResults);
  }
}

function formatInfo(data) {
  if (data.country && data.region && data.city && data.isp) {
    return `${data.country} ${data.region} ${data.city} ${data.isp}`;
  } else if (data.address && data.home) {
    return `${data.home} ${data.address}`;
  }
  return 'Information not available';
}

async function pingWebsite(url, type) {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(`https://${url}`);
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    // 检查是否真的超时了
    if (latency >= 10000) {
      throw new Error('Request timed out');
    }
    
    return NextResponse.json({
      url,
      status: response.status,
      latency: latency
    });
  } catch (error) {
    return NextResponse.json({
      url,
      error: error.message
    }, { status: 504 }); // 使用 504 Gateway Timeout 状态码
  }
}

async function getLocation() {
  return NextResponse.json({ error: 'Location service not implemented' }, { status: 501 });
}
