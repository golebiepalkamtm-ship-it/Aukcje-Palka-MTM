import { NextRequest } from 'next/server'
import { register } from '@/lib/prometheus-helpers'

export async function GET(_request: NextRequest) {
  try {
    const metrics = await register.metrics()
    return new Response(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Error generating metrics:', error)
    return new Response('Error generating metrics', { status: 500 })
  }
}
