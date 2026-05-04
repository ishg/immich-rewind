import { NextRequest, NextResponse } from 'next/server'

const BASE = (process.env.IMMICH_SERVER_URL ?? '').replace(/\/$/, '')
const KEY = process.env.IMMICH_API_KEY ?? ''

type Ctx = { params: { path: string[] } }

function authHeaders(extra: Record<string, string> = {}) {
  return { 'x-api-key': KEY, ...extra }
}

function missingVars() {
  const missing: string[] = []
  if (!BASE) missing.push('IMMICH_SERVER_URL')
  if (!KEY) missing.push('IMMICH_API_KEY')
  return missing
}

function notConfigured() {
  const missing = missingVars()
  return NextResponse.json({ error: 'not_configured', missing }, { status: 503 })
}

export async function GET(req: NextRequest, { params }: Ctx) {
  if (missingVars().length) return notConfigured()
  const path = params.path.join('/')
  const range = req.headers.get('range')
  const res = await fetch(`${BASE}/api/${path}${req.nextUrl.search}`, {
    headers: authHeaders(range ? { range } : {}),
    cache: 'no-store',
  })

  const ct = res.headers.get('Content-Type') ?? ''
  if (ct.startsWith('image/') || ct.startsWith('video/')) {
    const headers: Record<string, string> = { 'Content-Type': ct }
    if (ct.startsWith('video/')) {
      headers['Accept-Ranges'] = 'bytes'
      const cl = res.headers.get('Content-Length')
      const cr = res.headers.get('Content-Range')
      if (cl) headers['Content-Length'] = cl
      if (cr) headers['Content-Range'] = cr
    } else {
      headers['Cache-Control'] = 'public, max-age=86400, immutable'
    }
    return new NextResponse(res.body, { status: res.status, headers })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest, { params }: Ctx) {
  if (missingVars().length) return notConfigured()
  const path = params.path.join('/')
  const body = await req.json()
  const res = await fetch(`${BASE}/api/${path}`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (missingVars().length) return notConfigured()
  const path = params.path.join('/')
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${BASE}/api/${path}`, {
    method: 'DELETE',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  const text = await res.text()
  if (!text) return new NextResponse(null, { status: res.status })
  return NextResponse.json(JSON.parse(text), { status: res.status })
}
