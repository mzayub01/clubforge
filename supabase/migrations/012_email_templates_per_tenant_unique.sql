-- ===============================================
-- Migration: Make email_templates unique per tenant
-- and seed default templates for tenants that don't have any
-- ===============================================

-- Drop the global unique constraint on template_key
ALTER TABLE public.email_templates DROP CONSTRAINT IF EXISTS email_templates_template_key_key;

-- Add per-tenant unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_tenant_template_key_unique
  ON public.email_templates (template_key, tenant_id);

-- Also ensure global (NULL tenant_id) templates remain unique
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_global_template_key_unique
  ON public.email_templates (template_key)
  WHERE tenant_id IS NULL;

-- ===============================================
-- Seed default templates for every tenant that doesn't have any
-- ===============================================

DO $$
DECLARE
  v_tenant RECORD;
BEGIN
  FOR v_tenant IN
    SELECT t.id, t.name FROM public.tenants t
    WHERE NOT EXISTS (
      SELECT 1 FROM public.email_templates et
      WHERE et.tenant_id = t.id
      LIMIT 1
    )
  LOOP
    INSERT INTO public.email_templates 
      (tenant_id, template_key, name, description, subject, greeting, body_intro, body_details, body_action, body_closing, signature, button_text, button_url, is_active)
    VALUES
      (v_tenant.id, 'welcome', 'Welcome Email', 'Sent to new members after registration',
       'Welcome to ' || v_tenant.name || ', {{firstName}}!',
       'Hi {{firstName}},',
       'We''re thrilled to welcome you! Your registration at **{{locationName}}** has been successfully completed.',
       E'📍 **Location:** {{locationName}}\n🏷️ **Membership:** {{membershipType}}',
       E'Before your first class, please remember to:\n✅ Bring appropriate training gear\n✅ Arrive 10 minutes early\n✅ Bring water and a positive attitude!',
       'If you have any questions, please don''t hesitate to reach out. See you on the mats!',
       'The ' || v_tenant.name || ' Team',
       'Go to Dashboard', '/dashboard', true),

      (v_tenant.id, 'event_confirmation', 'Event Confirmation', 'Sent after event booking/payment',
       'Booking Confirmed: {{eventTitle}}',
       'Hi {{firstName}},',
       'Great news! Your booking for **{{eventTitle}}** has been confirmed.',
       E'📅 **Date:** {{eventDate}}\n🕐 **Time:** {{eventTime}}\n📍 **Location:** {{eventLocation}}\n💳 **Amount Paid:** {{amountPaid}}',
       'Please arrive at least 15 minutes before the event starts.',
       'We look forward to seeing you there!',
       'The ' || v_tenant.name || ' Team',
       'View Event Details', '/events', true),

      (v_tenant.id, 'membership_activated', 'Membership Activated', 'Sent after successful Stripe payment',
       'Your ' || v_tenant.name || ' Membership is Now Active!',
       'Hi {{firstName}},',
       'Your payment has been processed successfully and your membership is now active!',
       E'📍 **Location:** {{locationName}}\n🏷️ **Plan:** {{membershipType}}\n💳 **Monthly:** {{price}}\n📅 **Started:** {{startDate}}',
       'Your subscription will automatically renew each month. You can manage your membership at any time from your dashboard.',
       'Thank you for joining our community!',
       'The ' || v_tenant.name || ' Team',
       'Go to Dashboard', '/dashboard', true),

      (v_tenant.id, 'payment_failed', 'Payment Failed', 'Sent when subscription payment fails',
       'Action Required: Payment Failed for Your Membership',
       'Hi {{firstName}},',
       'We were unable to process your payment for your **{{membershipType}}** membership.',
       E'💳 **Amount Due:** {{amountDue}}\n🔄 **Attempt:** {{attemptCount}} of 3\n📅 **Next Attempt:** {{nextAttemptDate}}',
       'Please update your payment method to avoid any interruption to your membership.',
       'If you have any questions or need assistance, please don''t hesitate to contact us.',
       'The ' || v_tenant.name || ' Team',
       'Update Payment Method', '/dashboard/membership', true),

      (v_tenant.id, 'announcement_notification', 'Announcement Notification', 'Sent when admin publishes an announcement',
       E'📢 {{announcementTitle}}',
       'Hi {{firstName}},',
       '{{announcementMessage}}',
       NULL, NULL,
       'Thank you for being part of our community!',
       'The ' || v_tenant.name || ' Team',
       'View Dashboard', '/dashboard', true)

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seeded email templates for tenant: % (%)', v_tenant.name, v_tenant.id;
  END LOOP;
END;
$$;
