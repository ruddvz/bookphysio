import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'
import { uploadRatelimit } from '@/lib/upstash'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

const metaSchema = z.object({
  type: z.enum(['degree', 'registration', 'id_proof', 'photo']),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rateLimit = await uploadRatelimit.limit(`upload:${user.id}`)
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many upload requests. Please try again shortly.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const typeMeta = metaSchema.safeParse({ type: formData.get('type') })

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!typeMeta.success) return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Only PDF, JPG, and PNG files are allowed' }, { status: 415 })
  if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: 'File must be under 10MB' }, { status: 413 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: 'Only .pdf, .jpg, .jpeg, and .png file extensions are allowed' }, { status: 415 })
  }

  const storagePath = `providers/${user.id}/${typeMeta.data.type}-${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabaseAdmin.storage
    .from('credentials')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const { data, error } = await supabase
    .from('documents')
    .insert({ provider_id: user.id, type: typeMeta.data.type, storage_path: storagePath })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to record document' }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
