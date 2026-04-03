import { NextResponse } from 'next/server'

export async function POST() {
  // Payment webhook is temporarily disabled.
  return NextResponse.json({ error: 'Not available' }, { status: 503 })
}
