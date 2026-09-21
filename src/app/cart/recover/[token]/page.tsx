'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { recoverCart, markCartRecovered } from '@/lib/abandoned-cart'
import Navbar from '@/components/Navbar'
import MobileLogo from '@/components/MobileLogo'
import Footer from '@/components/Footer'
import Link from 'next/link'

type RecoveryStatus = 'loading' | 'recovering' | 'error' | 'expired'

export default function CartRecoveryPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, clearCart } = useCart()
  const [status, setStatus] = useState<RecoveryStatus>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const token = params.token as string

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('Invalid recovery link')
      return
    }

    async function recover() {
      try {
        const data = await recoverCart(token)
        
        if (!data || !data.success) {
          setStatus(data === null ? 'expired' : 'error')
          setErrorMsg('This cart was not found. It may have already been completed.')
          return
        }

        setStatus('recovering')

        // Clear current cart and add recovered items
        clearCart()

        // Older records stored the obfuscated product id — md5(numericId) — which
        // is what /products/<hash> URLs use. CoCart can't resolve it, so every add
        // silently 404'd and the customer landed on an empty checkout. MD5 is one
        // way, so we resolve by hashing each catalog id and matching.
        const resolveProductId = async (item: { product_id: string | number }): Promise<string | null> => {
          const raw = String(item.product_id)
          if (/^\d+$/.test(raw)) return raw
          try {
            const res = await fetch(`/api/products/resolve-hash?hash=${encodeURIComponent(raw)}`)
            if (!res.ok) return null
            const json = await res.json()
            return json?.id ? String(json.id) : null
          } catch (err) {
            console.error('[CartRecovery] resolve failed for', raw, err)
          }
          return null
        }

        let added = 0
        for (const item of data.cart) {
          try {
            const pid = await resolveProductId(item)
            if (!pid) {
              console.error('[CartRecovery] could not resolve product', item.product_id)
              continue
            }
            await addToCart(pid, item.quantity)
            added++
          } catch (err) {
            console.error('[CartRecovery] Failed to add item:', item.product_id, err)
          }
        }

        if (added === 0) {
          setStatus('error')
          setErrorMsg('We could not restore these items — they may no longer be available.')
          return
        }

        // Mark cart as recovered
        await markCartRecovered(token)

        // Redirect to checkout
        router.push('/checkout')
      } catch (err) {
        console.error('[CartRecovery] Error:', err)
        setStatus('error')
        setErrorMsg('Something went wrong loading your cart')
      }
    }

    recover()
  }, [token, addToCart, clearCart, router])

  return (
    <main className="min-h-screen bg-yum-dark relative">
      <MobileLogo />
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        {(status === 'loading' || status === 'recovering') && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E12590] mx-auto mb-4" />
            <p className="text-white/60 text-lg">
              {status === 'loading' ? 'Loading your cart...' : 'Restoring your items...'}
            </p>
          </div>
        )}
        
        {status === 'expired' && (
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-3">Cart Expired</h1>
            <p className="text-white/60 mb-6">
              This cart link has expired. But don&apos;t worry — check out our latest products!
            </p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 rounded-xl text-white font-semibold transition-all hover:brightness-110"
              style={{ background: 'rgba(220, 3, 135, 0.4)', border: '1px solid rgba(220, 3, 135, 0.6)' }}
            >
              Shop Now
            </Link>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-3">Oops!</h1>
            <p className="text-white/60 mb-6">{errorMsg}</p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 rounded-xl text-white font-semibold transition-all hover:brightness-110"
              style={{ background: 'rgba(220, 3, 135, 0.4)', border: '1px solid rgba(220, 3, 135, 0.6)' }}
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  )
}
