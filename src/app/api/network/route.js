import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

const TIMEOUT = 10000; // 10 秒超时

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const url = searchParams.get('url');

  if (action === 'ping') {
    return handlePing(url);
  } else if (action === 'getIpInfo') {
    return handleGetIpInfo();
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

async function handlePing(url) {
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const result = await serverPingWebsite(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error pinging ${url}:`, error);
    return NextResponse.json({ error: error.message || 'Request failed' }, { status: 500 });
  }
}

async function serverPingWebsite(url) {
  const startTime = Date.now();
  try {
    const response = await fetch(`https://${url}`, {
      method: 'HEAD',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PingBot/1.0;)',
      },
    });
    const endTime = Date.now();
    const latency = endTime - startTime;
    return { status: response.status, latency };
  } catch (error) {
    if (error.type === 'request-timeout') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

async function handleGetIpInfo() {
  try {
    const result = await getIpInfo();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting IP info:', error);
    return NextResponse.json({ error: error.message || 'Failed to get IP info' }, { status: 500 });
  }
}

async function getIpInfo() {
  try {
    // 使用 Cloudflare 获取 IP
    const cfResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { timeout: TIMEOUT });
    const cfText = await cfResponse.text();
    const ip = cfText.match(/ip=(.*)/)[1].trim();

    // 使用获取到的 IP 查询详细信息
    const ipInfoResponse = await fetch(`https://api.52vmy.cn/api/query/itad?ip=${ip}`, { timeout: TIMEOUT });
    const ipInfoData = await ipInfoResponse.json();

    return {
      source: 'Cloudflare + 52VMY',
      ip: ip,
      info: formatInfo(ipInfoData.data),
      rawData: JSON.stringify({ cloudflare: cfText, ipInfo: ipInfoData }, null, 2)
    };
  } catch (error) {
    console.error('Error fetching IP info:', error);
    throw new Error('Failed to fetch IP information');
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

async function getLocation() {
  return NextResponse.json({ error: 'Location service not implemented' }, { status: 501 });
}
