export default async (request, context) => {
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/pmcc/v1', '/api/pmcc/v1');
    const targetUrl = `https://office.uds.com.vn${path}${url.search}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Forward auth token if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }
    const tokenHeader = request.headers.get('token');
    if (tokenHeader) {
        headers.set('token', tokenHeader);
    }

    try {
        let body = null;
        if (request.method !== 'GET' && request.method !== 'HEAD') {
            body = await request.text();
        }

        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: body,
        });

        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config = {
    path: '/api/pmcc/v1/*',
};
