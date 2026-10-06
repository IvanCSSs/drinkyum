'use client'

/**
 * Branded invoice payment page: /pay/[orderId]?key=<order_key>
 * Linked from the "Send YUM invoice email" admin action. Loads the pending
 * order, tokenizes the card with Accept.js (same flow as checkout), and pays
 * through /api/order-pay.
 */

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MobileLogo from '@/components/MobileLogo'
import Footer from '@/components/Footer'
import { getPaymentConfig } from '@/lib/wc-checkout'

type Summary = {
  id: number
  number: string
  needs_payment: boolean
  subtotal: string
  shipping: string
  tax: string
  total: string
  first_name: string
  items: { name: string; quantity: number; total: string }[]
  error?: string
  message?: string
}

// window.Accept is declared globally by the checkout page's Accept.js types.

export default function PayOrderPage() {
  const params = useParams()
  const search = useSearchParams()
  const orderId = String(params.orderId || '')
  const orderKey = search.get('key') || ''

  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadError, setLoadError] = useState('')
  const [payCfg, setPayCfg] = useState<{ apiLoginId?: string; clientKey?: string; sandbox?: boolean } | null>(null)
  const [acceptReady, setAcceptReady] = useState(false)
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' })
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (!orderId || !orderKey) { setLoadError('This payment link is incomplete.'); return }
    fetch(`/api/order-pay?orderId=${encodeURIComponent(orderId)}&key=${encodeURIComponent(orderKey)}`)
      .then(r => r.json())
      .then((d: Summary) => {
        if ((d as { error?: string }).error || (d as { code?: string } as never) && !d.id) {
          setLoadError(d.message || 'We could not find this invoice.')
        } else setSummary(d)
      })
      .catch(() => setLoadError('We could not load this invoice.'))
  }, [orderId, orderKey])

  useEffect(() => {
    getPaymentConfig().then(cfg => {
      setPayCfg(cfg)
      if (!document.getElementById('acceptjs-script')) {
        const s = document.createElement('script')
        s.id = 'acceptjs-script'
        s.src = cfg.sandbox
          ? 'https://jstest.authorize.net/v1/Accept.js'
          : 'https://js.authorize.net/v1/Accept.js'
        s.async = true
        s.onload = () => setAcceptReady(true)
        document.head.appendChild(s)
      } else setAcceptReady(true)
    }).catch(() => setPayError('Payment system unavailable right now.'))
  }, [])

  const submit = async () => {
    setPayError('')
    if (!window.Accept || !payCfg?.clientKey || !payCfg?.apiLoginId) {
      setPayError('Payment system is still loading — try again in a moment.')
      return
    }
    const [month, year] = card.exp.replace(/\s/g, '').split('/')
    if (!card.number || !month || !year || !card.cvc) {
      setPayError('Please fill in all card fields (expiry as MM/YY).')
      return
    }
    setPaying(true)
    window.Accept.dispatchData(
      {
        authData: { clientKey: payCfg.clientKey, apiLoginID: payCfg.apiLoginId },
        cardData: {
          cardNumber: card.number.replace(/\s/g, ''),
          month,
          year: year.length === 2 ? '20' + year : year,
          cardCode: card.cvc,
        },
      },
      async resp => {
        if (resp.messages.resultCode !== 'Ok' || !resp.opaqueData) {
          setPayError(resp.messages.message?.[0]?.text || 'Card could not be verified.')
          setPaying(false)
          return
        }
        try {
          const res = await fetch('/api/order-pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              key: orderKey,
              dataDescriptor: resp.opaqueData.dataDescriptor,
              dataValue: resp.opaqueData.dataValue,
            }),
          })
          const data = await res.json()
          if (res.ok && data.success) setPaid(true)
          else setPayError(data.message || data.error || 'Payment was declined.')
        } catch {
          setPayError('Payment failed — please try again.')
        }
        setPaying(false)
      }
    )
  }

  const inputCls =
    'w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#E12590]'

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        {loadError && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-3">Invoice unavailable</h1>
            <p className="text-white/60">{loadError}</p>
          </div>
        )}

        {paid && summary && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-3">Payment received 🎉</h1>
            <p className="text-white/70">
              Thanks{summary.first_name ? `, ${summary.first_name}` : ''} — order #{summary.number} is paid.
              A confirmation is on its way to your inbox.
            </p>
          </div>
        )}

        {!loadError && !paid && summary && (
          <>
            <h1 className="text-2xl font-bold text-white mb-1">
              Invoice for order #{summary.number}
            </h1>
            <p className="text-white/60 mb-6">
              {summary.first_name ? `Hi ${summary.first_name} — ` : ''}review and pay below.
            </p>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 mb-6">
              {summary.items.map((it, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/10 text-white/90">
                  <span>{it.name} × {it.quantity}</span>
                  <span>${it.total}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 text-white/60 text-sm">
                <span>Shipping</span><span>${summary.shipping}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm">
                <span>Tax</span><span>${summary.tax}</span>
              </div>
              <div className="flex justify-between pt-3 text-white font-bold text-lg">
                <span>Total due</span><span>${summary.total}</span>
              </div>
            </div>

            {!summary.needs_payment ? (
              <p className="text-center text-white/70">This invoice has already been paid. 🎉</p>
            ) : (
              <div className="space-y-3">
                <input
                  className={inputCls}
                  placeholder="Card number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={card.number}
                  onChange={e => setCard({ ...card, number: e.target.value })}
                />
                <div className="flex gap-3">
                  <input
                    className={inputCls}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    value={card.exp}
                    onChange={e => setCard({ ...card, exp: e.target.value })}
                  />
                  <input
                    className={inputCls}
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvc}
                    onChange={e => setCard({ ...card, cvc: e.target.value })}
                  />
                </div>
                {payError && <p className="text-red-400 text-sm">{payError}</p>}
                <button
                  onClick={submit}
                  disabled={paying || !acceptReady}
                  className="w-full py-4 rounded-xl text-white font-bold transition-all hover:brightness-110 disabled:opacity-50"
                  style={{ background: '#E12590' }}
                >
                  {paying ? 'Processing…' : `Pay $${summary.total}`}
                </button>
                <p className="text-white/40 text-xs text-center">
                  Secured by Authorize.net — your card details never touch our servers.
                </p>
              </div>
            )}
          </>
        )}

        {!loadError && !paid && !summary && (
          <div className="text-center text-white/60 py-16">Loading your invoice…</div>
        )}
      </div>
      <Footer />
    </main>
  )
}
