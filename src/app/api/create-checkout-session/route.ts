import { NextRequest, NextResponse } from 'next/server'
import { getServerStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { packageType, parentalId } = await request.json()

    // Definir los paquetes de tickets
    const packages = {
      basic: {
        name: 'Paquete Básico',
        quantity: 5,
        price: 2500, // precio en centavos USD ($25.00)
        description: '5 tickets para clases de polo',
      },
      popular: {
        name: 'Paquete Popular',
        quantity: 10,
        price: 4500, // precio en centavos USD ($45.00)
        description: '10 tickets para clases de polo',
      },
      premium: {
        name: 'Paquete Premium',
        quantity: 20,
        price: 8000, // precio en centavos USD ($80.00)
        description: '20 tickets para clases de polo',
      },
    }

    const selectedPackage = packages[packageType as keyof typeof packages]

    if (!selectedPackage) {
      return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 })
    }

    // Crear sesión de Stripe Checkout
    const stripe = getServerStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        parentalId,
        packageType,
        ticketQuantity: selectedPackage.quantity.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/parental?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/parental?payment=cancelled`,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
