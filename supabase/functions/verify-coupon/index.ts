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

    // First, get a JWT token using basic auth
    console.log('Attempting WordPress authentication...')
    const tokenResponse = await fetch(`${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: WORDPRESS_USERNAME,
        password: WORDPRESS_PASSWORD,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token fetch failed:', tokenResponse.status)
      const errorText = await tokenResponse.text()
      console.error('Token error response:', errorText)
      throw new Error('Failed to authenticate with WordPress')
    }

    const tokenData = await tokenResponse.json()
    console.log('Successfully obtained WordPress token')

    // Get all books with their coupon codes using the JWT token
    console.log('Fetching books with JWT token')
    const booksResponse = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/libri?_fields=id,title,acf`, {
      headers: {
        'Authorization': `Bearer ${tokenData.token}`,
      },
    })

    if (!booksResponse.ok) {
      console.error('Books fetch failed:', booksResponse.status)
      const errorText = await booksResponse.text()
      console.error('Books fetch error response:', errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch books data',
          debug: { status: booksResponse.status, error: errorText }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    const books = await booksResponse.json()
    console.log('Successfully fetched books data:', books.length, 'books found')

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