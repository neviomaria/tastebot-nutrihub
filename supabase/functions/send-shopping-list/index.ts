import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendShoppingListRequest {
  listId: string;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listId, recipientEmail }: SendShoppingListRequest = await req.json();

    // Fetch the shopping list
    const { data: shoppingList, error: listError } = await supabase
      .from("shopping_lists")
      .select("*, shopping_list_items(*)")
      .eq("id", listId)
      .single();

    if (listError) {
      throw new Error(`Error fetching shopping list: ${listError.message}`);
    }

    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }

    // Create HTML content for the email
    const itemsHtml = shoppingList.shopping_list_items
      .map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.ingredient}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color: #666;">
            ${item.quantity || '-'}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            ${item.checked ? '✓' : ''}
          </td>
        </tr>
      `)
      .join("");

    const emailResponse = await resend.emails.send({
      from: "Shopping List <andrea@andreaprando.com>",
      to: [recipientEmail],
      subject: `Shopping List: ${shoppingList.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px;">
            ${shoppingList.title}
          </h1>
          
          <p style="color: #666; margin-bottom: 20px;">
            Here's your shopping list!
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Quantity</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Completed</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="color: #666; margin-top: 30px; font-size: 14px; text-align: center;">
            List generated on ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
            <p>This email was automatically sent from your account.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-shopping-list function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);