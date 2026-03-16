import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    var body = await request.json()
    var { amount } = body

    // Create Razorpay order via API
    var credentials = Buffer.from(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET
    ).toString('base64')

    var response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + credentials,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'INR',
        receipt: 'nuno_' + Date.now(),
      }),
    })

    var order = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ orderId: order.id })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
