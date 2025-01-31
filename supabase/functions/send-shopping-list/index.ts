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
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${item.ingredient}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">
            ${item.quantity || '-'}
          </td>
        </tr>
      `)
      .join("");

    const emailResponse = await resend.emails.send({
      from: "Shopping List <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Shopping List: ${shoppingList.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            ${shoppingList.title}
          </h1>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
                <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #eee;">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="color: #666; margin-top: 20px; font-size: 14px;">
            Generated on ${new Date().toLocaleDateString()}
          </p>
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