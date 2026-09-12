import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.full_name || '').trim();
    const shopName = String(body.shop_name || '').trim();
    const role = body.requested_role || 'staff';

    if (!email || !shopName) {
      return new Response(JSON.stringify({ error: 'email and shop_name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: requestRow, error: insertError } = await supabase
      .from('access_requests')
      .insert({ email, full_name: fullName || null, shop_name: shopName, requested_role: role })
      .select('id, email, full_name, shop_name, requested_role, created_at')
      .single();

    if (insertError) throw insertError;

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY is not configured');

    const ownerEmail = 'erthcafe11@gmail.com';
    const html = `<div dir="rtl"><h2>طلب تسجيل جديد في CafeMargin</h2><p>الاسم: ${escapeHtml(fullName)}</p><p>البريد: ${escapeHtml(email)}</p><p>المحل: ${escapeHtml(shopName)}</p><p>الصلاحية المطلوبة: ${escapeHtml(role)}</p><p>رقم الطلب: ${requestRow.id}</p><p>افتح لوحة الإدارة لمراجعة الطلب والموافقة عليه.</p></div>`;
    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'CafeMargin <onboarding@resend.dev>', to: [ownerEmail], subject: 'طلب تسجيل جديد في CafeMargin', html }),
    });

    if (!mail.ok) throw new Error(await mail.text());
    return new Response(JSON.stringify({ ok: true, request: requestRow }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char] || char));
}
