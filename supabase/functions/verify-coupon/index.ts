import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { coupon_code } = await req.json()
    
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

    const booksResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri', {
      headers: {
        'Authorization': token,
      },
    })

    const books = await booksResponse.json()
    const book = books.find((book: any) => book.acf.coupon === coupon_code)

    if (!book) {
      return new Response(
        JSON.stringify({ error: 'Invalid coupon code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})