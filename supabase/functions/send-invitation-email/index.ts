
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@2.0.0';

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
    console.log('Starting send-invitation-email function');

    // Verifică dacă RESEND_API_KEY este configurat
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Resend API key exists:', !!resendApiKey);
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'RESEND_API_KEY is not configured',
          details: 'Email service not properly configured'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const { email, familyName, inviterName, invitationId }: InvitationEmailRequest = await req.json();
    console.log('Request data:', { email, familyName, inviterName, invitationId });

    // Generează URL-ul pentru acceptarea invitației
    const baseUrl = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://izsvgmgivjpyjuxteslt.supabase.co';
    const invitationUrl = `${baseUrl}/invitation/${invitationId}`;

    console.log('Generated invitation URL:', invitationUrl);

    // Trimite emailul folosind Resend
    console.log('Attempting to send email to:', email);
    
    const emailResponse = await resend.emails.send({
      from: 'BugetControl <onboarding@resend.dev>',
      to: [email],
      subject: `Invitație în familia ${familyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3b82f6; margin-bottom: 20px;">
            Ai fost invitat să te alături familiei ${familyName}!
          </h2>
          
          <p style="margin-bottom: 16px;">Salut!</p>
          
          <p style="margin-bottom: 16px;">
            <strong>${inviterName}</strong> te-a invitat să te alături familiei 
            <strong>${familyName}</strong> pe BugetControl.
          </p>
          
          <p style="margin-bottom: 20px;">
            Pentru a accepta invitația, accesează linkul de mai jos:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Acceptă Invitația
            </a>
          </div>
          
          <p style="margin-bottom: 16px; color: #666;">
            Sau copiază și lipește acest link în browser:
          </p>
          <p style="margin-bottom: 20px; background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
            ${invitationUrl}
          </p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
            <p style="color: #888; font-size: 14px; margin-bottom: 8px;">
              ⏰ Această invitație va expira în 7 zile.
            </p>
            <p style="color: #888; font-size: 14px;">
              Dacă nu ai solicitat această invitație, poți ignora acest email.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px;">
              Cu respect,<br>
              <strong>Echipa BugetControl</strong>
            </p>
          </div>
        </div>
      `
    });

    console.log('Resend response:', JSON.stringify(emailResponse, null, 2));

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailResponse.error,
          resendError: emailResponse.error
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Email sent successfully via Resend');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        emailId: emailResponse.data?.id,
        invitationUrl: invitationUrl,
        emailData: emailResponse.data
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in send-invitation-email function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: 'Failed to send invitation email',
        stack: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
