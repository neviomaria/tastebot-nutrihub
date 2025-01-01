import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORDPRESS_API_URL = 'https://brainscapebooks.com'
const WORDPRESS_JWT_TOKEN = Deno.env.get('WORDPRESS_JWT_TOKEN')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { coupon_code } = await req.json()
    console.log('Verifying coupon:', coupon_code)

    if (!WORDPRESS_JWT_TOKEN) {
      throw new Error('WordPress JWT token missing')
    }

    // Call WordPress API to verify the coupon
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/custom/v1/verify-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WORDPRESS_JWT_TOKEN}`,
      },
      body: JSON.stringify({ coupon_code }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('WordPress API error:', errorData)
      throw new Error(errorData.message || 'Failed to verify coupon')
    }

    const data = await response.json()
    console.log('WordPress API response:', data)

    return new Response(
      JSON.stringify({
        success: true,
        valid: data.valid,
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