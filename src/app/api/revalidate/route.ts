import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  // Check for secret to confirm this is a valid request
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get('path')
  const tag = request.nextUrl.searchParams.get('tag')

  try {
    if (path) {
      // Revalidate specific path
      revalidatePath(path)
      return Response.json({
        revalidated: true,
        type: 'path',
        target: path,
        now: Date.now(),
      })
    } else if (tag) {
      // Revalidate by tag
      revalidateTag(tag)
      return Response.json({
        revalidated: true,
        type: 'tag',
        target: tag,
        now: Date.now(),
      })
    } else {
      // Revalidate all ai-coding-stack pages
      revalidatePath('ides')
      revalidatePath('models')
      revalidatePath('clis')
      revalidatePath('model-providers')
      return Response.json({
        revalidated: true,
        type: 'all',
        now: Date.now(),
      })
    }
  } catch (err) {
    return Response.json(
      {
        message: 'Error revalidating',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
