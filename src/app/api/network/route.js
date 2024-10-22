import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
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
        const data = await response.json();
        return { ip: data.ip, info: formatInfo(data) };
      } else {
        const text = await response.text();
        const ip = api.url.includes('cloudflare') ? text.match(/ip=(.*)/)[1] : text.trim();
        const data = await (await fetch(`https://api.52vmy.cn/api/query/itad?ip=${ip}`)).json();
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
    // 所有 API 返回相同的 IP，只返回一个结果
    return NextResponse.json([validResults[0]]);
  } else {
    // IP 不一致，返回所有有效结果
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
  if (type === 'local') {
    return await localPing(url);
  } else if (type === 'server') {
    return await serverPing(url);
  } else {
    return NextResponse.json({ error: 'Invalid ping type' }, { status: 400 });
  }
}

async function localPing(url) {
  const startTime = Date.now();
  try {
    const response = await fetch(`https://${url}`);
    const endTime = Date.now();
    return NextResponse.json({
      url,
      status: response.status,
      latency: endTime - startTime
    });
  } catch (error) {
    return NextResponse.json({
      url,
      error: error.message
    });
  }
}

async function serverPing(url) {
  try {
    console.log(`Attempting to ping ${url} from server`);
    const { stdout, stderr } = await execPromise(`ping -c 4 ${url}`);
    console.log(`Ping stdout: ${stdout}`);
    console.log(`Ping stderr: ${stderr}`);

    const avgMatch = stdout.match(/rtt min\/avg\/max\/mdev = [\d.]+\/([\d.]+)\/[\d.]+\/[\d.]+ ms/);
    if (avgMatch) {
      const avgLatency = parseFloat(avgMatch[1]);
      return NextResponse.json({
        url,
        status: 'OK',
        latency: avgLatency
      });
    } else {
      console.error(`Failed to parse ping output for ${url}`);
      return NextResponse.json({
        url,
        status: 'Error',
        error: 'Failed to parse ping output'
      });
    }
  } catch (error) {
    console.error(`Error pinging ${url} from server:`, error);
    return NextResponse.json({
      url,
      status: 'Error',
      error: error.message
    });
  }
}

async function getLocation() {
  // 这里需要实现获取GPS位置的逻辑
  // 由于浏览器限制，这部分可能需要在客户端实现
  return NextResponse.json({ error: 'Location service not implemented' }, { status: 501 });
}
