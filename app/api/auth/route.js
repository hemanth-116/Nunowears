import { NextResponse } from 'next/server'
import { Resend } from 'resend'

var resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    var body = await request.json()
    var { email, name, orderId, items, total, shipping, address } = body

    var itemsHtml = items.map(function(item) {
      return '<tr><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f5f3ee;">' + item.name + ' (Size: ' + item.size + ') × ' + item.qty + '</td><td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#c8ff00;text-align:right;">₹' + (item.price * item.qty).toLocaleString('en-IN') + '</td></tr>'
    }).join('')

    var html = '\n      <div style="background:#0a0a0a;color:#f5f3ee;font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 32px;">\n        <div style="font-family:\'Arial Black\',sans-serif;font-size:28px;letter-spacing:6px;margin-bottom:32px;">NUNO</div>\n        <h2 style="font-size:20px;font-weight:500;margin-bottom:8px;">Order Confirmed!</h2>\n        <p style="color:#888;font-size:14px;margin-bottom:32px;">Hi ' + name + ', your order has been placed successfully.</p>\n        <div style="background:#111;border:1px solid #2a2a2a;padding:24px;margin-bottom:24px;">\n          <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Order #' + orderId.slice(0, 8).toUpperCase() + '</div>\n          <table style="width:100%;border-collapse:collapse;">' + itemsHtml + '</table>\n          <div style="margin-top:16px;display:flex;justify-content:space-between;">\n            <span style="color:#888;font-size:13px;">Shipping</span>\n            <span style="font-size:13px;color:' + (shipping === 0 ? '#c8ff00' : '#f5f3ee') + ';">' + (shipping === 0 ? 'FREE' : '₹' + shipping) + '</span>\n          </div>\n          <div style="border-top:1px solid #2a2a2a;margin-top:12px;padding-top:12px;display:flex;justify-content:space-between;">\n            <span style="font-size:14px;font-weight:500;">Total</span>\n            <span style="font-size:18px;color:#c8ff00;font-weight:500;">₹' + (total + shipping).toLocaleString('en-IN') + '</span>\n          </div>\n        </div>\n        <div style="background:#111;border:1px solid #2a2a2a;padding:24px;margin-bottom:32px;">\n          <div style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Delivering To</div>\n          <div style="font-size:13px;line-height:1.8;color:#f5f3ee;">' + address.full_name + '<br>' + address.address + '<br>' + address.city + ', ' + address.state + ' - ' + address.pincode + '<br>' + address.phone + '</div>\n        </div>\n        <p style="color:#555;font-size:12px;">You\'ll receive a shipping update once your order is dispatched. For help, reply to this email.</p>\n      </div>\n    '

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NUNO <orders@resend.dev>',
      to: email,
      subject: 'Order Confirmed — NUNO #' + orderId.slice(0, 8).toUpperCase(),
      html: html,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
