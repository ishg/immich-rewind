export async function GET() {
  return Response.json({
    immichUrl: (process.env.IMMICH_SERVER_URL ?? '').replace(/\/$/, ''),
  })
}
