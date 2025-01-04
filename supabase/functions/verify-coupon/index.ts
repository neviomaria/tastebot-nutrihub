import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting coupon verification');
    
    const { coupon_code } = await req.json()
    
    if (!coupon_code) {
      console.error('No coupon code provided');
      return new Response(
        JSON.stringify({ error: 'Coupon code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Authenticating with WordPress');
    const response = await fetch('https://brainscapebooks.com/wp-json/custom/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: Deno.env.get('WORDPRESS_USERNAME'),
        password: Deno.env.get('WORDPRESS_PASSWORD'),
      }),
    })

    const { token } = await response.json()

    console.log('Fetching books from WordPress');
    const booksResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri', {
      headers: {
        'Authorization': token,
      },
    })

    const books = await booksResponse.json()
    console.log(`Found ${books.length} books, searching for coupon: ${coupon_code}`);
    
    const book = books.find((book: any) => book.acf.coupon === coupon_code)

    if (!book) {
      console.error('No book found for coupon:', coupon_code);
      return new Response(
        JSON.stringify({ error: 'Invalid coupon code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Book found:', { id: book.id, title: book.title.rendered });
    return new Response(
      JSON.stringify({ 
        success: true,
        book_id: book.id.toString(),
        book_title: book.title.rendered,
        access_level: 'premium'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})