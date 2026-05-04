import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Props {
  type: 'not_configured' | 'unreachable' | 'unauthorized'
  missing?: string[]
}

export default function SetupError({ type, missing }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-danger shrink-0" />
          <h2 className="font-display text-xl text-fg">
            {type === 'not_configured' && 'Not configured'}
            {type === 'unreachable' && 'Server unreachable'}
            {type === 'unauthorized' && 'Invalid API key'}
          </h2>
        </div>

        {type === 'not_configured' && (
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <p>Create a <code className="text-fg bg-surface2 px-1.5 py-0.5 rounded text-xs">.env.local</code> file in the project root with:</p>
            <pre className="bg-surface2 border border-border rounded-xl p-4 text-xs text-fg font-mono overflow-x-auto">{
`IMMICH_SERVER_URL=http://your-immich-host:2283
IMMICH_API_KEY=your_api_key_here${'\n'}# Optional — enables "Open in Immich" links
NEXT_PUBLIC_IMMICH_URL=http://your-immich-host:2283`
            }</pre>
            {missing && missing.length > 0 && (
              <p>Missing: {missing.map(v => (
                <code key={v} className="text-danger bg-danger/10 px-1.5 py-0.5 rounded text-xs mx-0.5">{v}</code>
              ))}</p>
            )}
            <p>Then restart the dev server.</p>
          </div>
        )}

        {type === 'unreachable' && (
          <p className="text-sm text-muted leading-relaxed">
            Could not connect to the Immich server at <code className="text-fg bg-surface2 px-1.5 py-0.5 rounded text-xs">IMMICH_SERVER_URL</code>.
            Check that the server is running and the URL is correct in your <code className="text-fg bg-surface2 px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          </p>
        )}

        {type === 'unauthorized' && (
          <p className="text-sm text-muted leading-relaxed">
            The server rejected the API key. Check <code className="text-fg bg-surface2 px-1.5 py-0.5 rounded text-xs">IMMICH_API_KEY</code> in your <code className="text-fg bg-surface2 px-1.5 py-0.5 rounded text-xs">.env.local</code>.
          </p>
        )}
      </div>
    </div>
  )
}
