import { NextResponse } from 'next/server'

export async function POST() {
  // Refund flow is temporarily disabled — payment system is being re-architected.
  return NextResponse.json({ error: 'Refund system is not available yet.' }, { status: 503 })
}
