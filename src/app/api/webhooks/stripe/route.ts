import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Cliente de Supabase con service role para operaciones administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event

  try {
    const stripe = getServerStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      metadata: {
        parentalId: string
        packageType: string
        ticketQuantity: string
      }
    }

    const { parentalId, packageType, ticketQuantity } = session.metadata

    try {
      // Mapear packageType a package_id existente
      const packageMapping = {
        basic: '7fc9b592-2432-4ed9-ab70-f75522643c28', // Pack 5 Clases
        popular: 'afce5582-e2e3-41cd-88f2-981d5836d90d', // Pack 10 Clases
        premium: '3234c117-f4b5-48c9-a100-d9964b5a09d4', // Pack 20 Clases
      }

      const packageId =
        packageMapping[packageType as keyof typeof packageMapping]

      // Crear el registro de compra en purchased_tickets
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('purchased_tickets')
        .insert({
          parental_id: parentalId,
          package_id: packageId,
          total_tickets: parseInt(ticketQuantity),
          used_tickets: 0,
          purchase_date: new Date().toISOString(),
          expiry_date: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 año de validez
        })
        .select()
        .single()

      if (purchaseError) {
        console.error('Error creating purchase:', purchaseError)
        throw purchaseError
      }

      // Crear los ticket_units individuales
      const ticketUnits = Array.from(
        { length: parseInt(ticketQuantity) },
        () => ({
          purchase_id: purchase.id,
          status: 'available' as const,
        })
      )

      const { error: unitsError } = await supabaseAdmin
        .from('ticket_units')
        .insert(ticketUnits)

      if (unitsError) {
        console.error('Error creating ticket units:', unitsError)
        throw unitsError
      }

      console.log(
        `✅ Successfully created ${ticketQuantity} tickets for user ${parentalId}`
      )
    } catch (error) {
      console.error('Error processing payment:', error)
      return NextResponse.json(
        { error: 'Error processing payment' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
