import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORDPRESS_API_URL = 'https://brainscapebooks.com'
const WORDPRESS_USERNAME = Deno.env.get('WORDPRESS_USERNAME')
const WORDPRESS_PASSWORD = Deno.env.get('WORDPRESS_PASSWORD')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { coupon_code } = await req.json()
    console.log('Verifying coupon:', coupon_code)

    if (!WORDPRESS_USERNAME || !WORDPRESS_PASSWORD) {
      throw new Error('WordPress credentials missing')
    }

    // First, authenticate with WordPress
    const loginResponse = await fetch(`${WORDPRESS_API_URL}/wp-json/custom/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: WORDPRESS_USERNAME,
        password: WORDPRESS_PASSWORD,
      }),
    })

    if (!loginResponse.ok) {
      const errorData = await loginResponse.json()
      console.error('WordPress login error:', errorData)
      throw new Error(errorData.message || 'Failed to authenticate with WordPress')
    }

    const { token } = await loginResponse.json()
    console.log('Successfully authenticated with WordPress')

    // Call WordPress API to verify the coupon using the obtained token
    const response = await fetch(`${WORDPRESS_API_URL}/wp-json/custom/v1/verify-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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