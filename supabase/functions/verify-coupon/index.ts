import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORDPRESS_API_URL = Deno.env.get('WORDPRESS_API_URL')
const WORDPRESS_API_KEY = Deno.env.get('WORDPRESS_API_KEY')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { coupon_code } = await req.json()
    console.log('Verifying coupon:', coupon_code)

    if (!WORDPRESS_API_URL || !WORDPRESS_API_KEY) {
      throw new Error('WordPress API configuration missing')
    }

    // Call WordPress API to verify the coupon
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/custom/v1/verify-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': WORDPRESS_API_KEY,
      },
      body: JSON.stringify({ coupon_code }),
    })

    const data = await response.json()
    console.log('WordPress API response:', data)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify coupon')
    }

    return new Response(
      JSON.stringify({
        success: true,
        book_id: data.book_id,
        access_level: data.access_level,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})