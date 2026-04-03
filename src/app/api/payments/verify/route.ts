import { NextResponse } from 'next/server'

export async function POST() {
  // Payment flow is temporarily disabled.
  return NextResponse.json({ error: 'Payment system is not available yet.' }, { status: 503 })
}
