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
      console.error('WordPress credentials missing')
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

    console.log('Login response status:', loginResponse.status)
    const responseText = await loginResponse.text()
    console.log('Raw login response:', responseText)

    let authData
    try {
      authData = JSON.parse(responseText)
      console.log('Parsed auth data:', authData)
    } catch (e) {
      console.error('Failed to parse auth response:', e)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid authentication response from WordPress',
          debug: { responseText }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    if (!authData.token) {
      console.error('No token in auth response')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication failed - no token received',
          debug: { authData }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Get all books with their coupon codes using the received token
    console.log('Fetching books with token:', authData.token)
    const booksResponse = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/libri?_fields=id,title,acf`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
      },
    })

    console.log('Books response status:', booksResponse.status)
    const booksText = await booksResponse.text()
    console.log('Raw books response:', booksText)

    let books
    try {
      books = JSON.parse(booksText)
      console.log('Parsed books:', books)
    } catch (e) {
      console.error('Failed to parse books response:', e)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid books response from WordPress',
          debug: { booksText }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        debug: { 
          error: error.toString(),
          stack: error.stack
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})