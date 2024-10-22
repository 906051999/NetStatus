import { NextResponse } from 'next/server';
import https from 'https';

const TIMEOUT = 5000; // 5 秒超时

async function fetchWithTimeout(url, options = {}) {
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

    req.setTimeout(TIMEOUT, () => {
      req.destroy();
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
    { name: 'UAPIS', url: 'https://uapis.cn/api/myip.php', type: 'json' },
    { name: 'IP.SB', url: 'https://api.ip.sb/ip', type: 'plain' },
    { name: '52VMY', url: 'https://api.52vmy.cn/api/query/itad', type: 'json' },
    { name: 'Cloudflare', url: 'https://www.cloudflare.com/cdn-cgi/trace', type: 'plain' }
  ];

  const results = await Promise.all(apis.map(async (api) => {
    try {
      const response = await fetchWithTimeout(api.url);
      if (api.type === 'json') {
        const data = JSON.parse(response.data);
        return { source: api.name, ip: data.ip, info: formatInfo(data) };
      } else {
        const text = response.data;
        const ip = api.url.includes('cloudflare') ? text.match(/ip=(.*)/)[1] : text.trim();
        const { data: ipData } = await fetchWithTimeout(`https://api.52vmy.cn/api/query/itad?ip=${ip}`);
        const data = JSON.parse(ipData);
        return { source: api.name, ip, info: formatInfo(data.data) };
      }
    } catch (error) {
      console.error(`Error fetching from ${api.url}:`, error);
      return null;
    }
  }));

  const validResults = results.filter(result => result && result.ip);

  if (validResults.length === 0) {
    return NextResponse.json({ error: 'Failed to fetch IP information' }, { status: 500 });
  }

  // 根据 IP 地址分组
  const groupedByIP = validResults.reduce((acc, result) => {
    if (!acc[result.ip]) {
      acc[result.ip] = [];
    }
    acc[result.ip].push(result);
    return acc;
  }, {});

  // 对于每个唯一的 IP 地址，只保留一个结果（优先选择有更多信息的结果）
  const uniqueResults = Object.values(groupedByIP).map(group => 
    group.reduce((best, current) => 
      current.info.length > best.info.length ? current : best
    )
  );

  return NextResponse.json(uniqueResults);
}

// 新增函数：格式化 IP 信息以便比较
function formatInfoForComparison(info) {
  return info.toLowerCase().replace(/\s+/g, ' ').trim();
}

function formatInfo(data) {
  if (data.country && data.region && data.city && data.isp) {
    return `${data.country} ${data.region} ${data.city} ${data.isp}`;
  } else if (data.address && data.home) {
    return `${data.home} ${data.address}`;
  }
  return 'Information not available';
}

async function pingWebsite(url) {
  const startTime = Date.now();
  try {
    const response = await fetchWithTimeout(`https://${url}`);
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return NextResponse.json({
      url,
      status: response.status,
      latency: latency
    });
  } catch (error) {
    return NextResponse.json({
      url,
      error: error.message === 'Request timed out' ? 'Request timed out' : error.message || 'Request failed'
    }, { status: 200 }); // 使用 200 状态码，让错误信息能够正常返回到前端
  }
}

async function getLocation() {
  return NextResponse.json({ error: 'Location service not implemented' }, { status: 501 });
}
