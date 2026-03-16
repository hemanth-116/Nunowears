import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    var body = await request.json()
    var { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body

    // Verify signature
    var expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Save order to Supabase
    var supabase = createServiceSupabase()

    var { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id || null,
        status: 'paid',
        total: orderData.total,
        shipping: orderData.shipping,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        address: orderData.address,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Save order items
    var items = orderData.items.map(function(item) {
      return {
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url || null,
        size: item.size,
        quantity: item.qty,
        price: item.price,
      }
    })

    await supabase.from('order_items').insert(items)

    // Reduce stock for each item
    for (var i = 0; i < orderData.items.length; i++) {
      var item = orderData.items[i]
      await supabase.rpc('decrement_stock', { product_id: item.id, qty: item.qty })
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (err) {
    console.error('Order error:', err)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
  }
}
