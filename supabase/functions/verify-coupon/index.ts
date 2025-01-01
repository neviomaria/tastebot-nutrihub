import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORDPRESS_API_URL = 'https://brainscapebooks.com'
const WORDPRESS_USERNAME = Deno.env.get('WORDPRESS_USERNAME')
const WORDPRESS_PASSWORD = Deno.env.get('WORDPRESS_PASSWORD')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { coupon_code } = await req.json()
    console.log('Verifying coupon:', coupon_code)

    if (!coupon_code) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Coupon code is required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Check if WordPress credentials are available
    if (!WORDPRESS_USERNAME || !WORDPRESS_PASSWORD) {
      console.error('WordPress credentials missing. Please set WORDPRESS_USERNAME and WORDPRESS_PASSWORD in Supabase secrets')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service configuration error. Please contact support.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // First, authenticate with WordPress
    console.log('Attempting WordPress authentication...')
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
      const errorData = await loginResponse.text()
      console.error('WordPress login error. Status:', loginResponse.status, 'Response:', errorData)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to authenticate with WordPress. Please try again later.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const authData = await loginResponse.json()
    console.log('WordPress authentication successful. Token received.')

    if (!authData.token) {
      console.error('No token received from WordPress')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication error. Please try again later.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get all books with their coupon codes using the received token
    const booksResponse = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/libri?_fields=id,title,acf`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
      },
    })

    if (!booksResponse.ok) {
      const errorData = await booksResponse.text()
      console.error('WordPress books fetch error. Status:', booksResponse.status, 'Response:', errorData)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify coupon. Please try again later.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const books = await booksResponse.json()
    console.log('Successfully fetched books from WordPress')

    // Find the book with matching coupon code
    const matchingBook = books.find(book => book.acf?.coupon === coupon_code)

    if (!matchingBook) {
      console.log('No matching book found for coupon:', coupon_code)
      return new Response(
        JSON.stringify({
          success: true,
          valid: false,
          message: 'Invalid coupon code',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log('Found matching book:', matchingBook.title.rendered)

    // Return success with book information
    return new Response(
      JSON.stringify({
        success: true,
        valid: true,
        book_id: matchingBook.id.toString(),
        book_title: matchingBook.title.rendered,
        access_level: 'premium',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
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
        status: 500,
      }
    )
  }
})