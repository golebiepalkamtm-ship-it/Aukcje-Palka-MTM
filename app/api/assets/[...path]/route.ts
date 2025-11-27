import { NextRequest, NextResponse } from 'next/server';
import { buildAssetCdnUrl, hasAssetCdn } from '@/lib/asset-proxy';

export const runtime = 'nodejs';

const CDN_CACHE = 'public, max-age=31536000, immutable';

async function proxyAssetRequest(assetPath: string) {
  const targetUrl = buildAssetCdnUrl(assetPath);

  if (!targetUrl) {
    return NextResponse.json({ error: 'Asset CDN not configured' }, { status: 404 });
  }

  const upstream = await fetch(targetUrl, {
    // Avoid Next.js fetch cache – rely on upstream caching headers
    cache: 'no-store',
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: 'Asset not found', detail: upstream.statusText },
      { status: upstream.status }
    );
  }

  const headers = new Headers(upstream.headers);
  headers.set('Cache-Control', CDN_CACHE);
  headers.delete('content-security-policy');
  headers.delete('x-goog-hash');

  return new NextResponse(upstream.body, {
    status: 200,
    headers,
  });
}

export async function GET(
  _request: NextRequest,
  ctx: { params: { path?: string[] | string } }
) {
  const segments = ctx.params.path;
  const pathArray = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];

  if (!hasAssetCdn()) {
    return NextResponse.next();
  }

  if (!pathArray.length) {
    return NextResponse.json({ error: 'Missing asset path' }, { status: 400 });
  }

  const assetPath = `/${pathArray.join('/')}`;
  return proxyAssetRequest(assetPath);
}

export async function HEAD(
  request: NextRequest,
  ctx: { params: { path?: string[] | string } }
) {
  return GET(request, ctx);
}

