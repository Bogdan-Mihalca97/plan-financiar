
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationEmailRequest {
  email: string;
  familyName: string;
  inviterName: string;
  invitationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, familyName, inviterName, invitationId }: InvitationEmailRequest = await req.json();

    // Create the invitation acceptance URL
    const invitationUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/invitation/${invitationId}`;

    // For now, we'll just log the email content and return success
    // In a real implementation, you would integrate with an email service like Resend
    const emailContent = {
      to: email,
      subject: `Invitație în familia ${familyName}`,
      html: `
        <h2>Ai fost invitat să te alături familiei ${familyName}!</h2>
        <p>Salut!</p>
        <p>${inviterName} te-a invitat să te alături familiei ${familyName} pe BugetControl.</p>
        <p>Pentru a accepta invitația, accesează linkul de mai jos:</p>
        <a href="${invitationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Acceptă Invitația
        </a>
        <p>Sau copiază și lipește acest link în browser:</p>
        <p>${invitationUrl}</p>
        <p>Această invitație va expira în 7 zile.</p>
        <p>Cu respect,<br>Echipa BugetControl</p>
      `
    };

    console.log('Email to send:', emailContent);

    // Mark invitation as email sent (you could add an email_sent field to track this)
    await supabaseClient
      .from('family_invitations')
      .update({ 
        status: 'pending' // Keep as pending, but we know email was sent
      })
      .eq('id', invitationId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email prepared',
        emailContent 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-invitation-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
