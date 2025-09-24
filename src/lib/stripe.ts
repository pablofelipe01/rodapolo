import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'
import Stripe from 'stripe'

let stripePromise: Promise<StripeJS | null>
let serverStripe: Stripe | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export function getServerStripe() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerStripe should only be called on the server side')
  }

  if (!serverStripe) {
    serverStripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // @ts-expect-error - Using older Stripe API version for compatibility
      apiVersion: '2024-04-10',
    })
  }

  return serverStripe
}
