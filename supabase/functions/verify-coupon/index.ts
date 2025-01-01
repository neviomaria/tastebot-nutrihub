import { createClient } from '@supabase/supabase-js';

const handler = async (req: any) => {
  try {
    const { coupon_code } = await req.json();
    console.log('Verifying coupon:', coupon_code);

    // Get WordPress credentials from environment variables
    const wpUsername = Deno.env.get('WORDPRESS_USERNAME');
    const wpPassword = Deno.env.get('WORDPRESS_PASSWORD');

    if (!wpUsername || !wpPassword) {
      throw new Error('WordPress credentials not configured');
    }

    // Login to WordPress
    const loginResponse = await fetch('https://brainscapebooks.com/wp-json/custom/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: wpUsername,
        password: wpPassword,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('WordPress login failed');
    }

    const loginData = await loginResponse.json();
    console.log('Login successful, token:', loginData.token);

    // Fetch books
    const booksResponse = await fetch('https://brainscapebooks.com/wp-json/wp/v2/libri', {
      headers: {
        'Authorization': loginData.token,
      },
    });

    if (!booksResponse.ok) {
      console.error('Books fetch failed:', booksResponse.status);
      const errorText = await booksResponse.text();
      console.error('Books fetch error response:', errorText);
      throw new Error('Failed to fetch books');
    }

    const books = await booksResponse.json();
    console.log('Fetched books:', books);

    // Find book with matching coupon
    const book = books.find((b: any) => b.acf?.coupon === coupon_code);
    console.log('Found book:', book);

    if (!book) {
      return new Response(JSON.stringify({
        valid: false,
        error: 'Invalid coupon code'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update Supabase profile with book info
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        coupon_code,
        book_id: book.id.toString(),
        book_title: book.title.rendered,
        access_level: 'standard'
      })
      .eq('coupon_code', coupon_code);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      valid: true,
      book_id: book.id.toString(),
      access_level: 'standard'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      valid: false,
      error: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

export default handler;
