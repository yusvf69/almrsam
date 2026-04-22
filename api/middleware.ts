import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/:path*',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl;

  // Only apply to HTML pages (not API, not static)
  const isHTMLPage = 
    url.pathname.endsWith('/') || 
    url.pathname.endsWith('.html') ||
    (url.pathname === '/');

  if (!isHTMLPage) {
    // Check for .well-known endpoints that need correct content-type
    if (url.pathname.startsWith('/.well-known/')) {
      return response;
    }
  }

  // Add Link headers for agent discovery (RFC 8288)
  const linkHeaders = [
    '</.well-known/api-catalog>; rel="api-catalog"',
    '</sitemap.xml>; rel="sitemap"',
    '</.well-known/agent-skills/index.json>; rel="skills"',
  ];

  response.headers.set('Link', linkHeaders.join(', '));

  // Markdown negotiation - return markdown when AI requests it
  const accept = request.headers.get('Accept') || '';
  
  if (accept.includes('text/markdown') || accept.includes('text/md')) {
    // For now, we'll let the frontend handle markdown conversion
    // In production, you'd convert HTML to markdown here
    response.headers.set('X-Content-Type-Options', 'markdown-available');
  }

  return response;
}