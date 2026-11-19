-- Paste this in the Younes Shop SQL editor.
-- Adds a payment status to cheques. Existing and new cheques start as 'pending'.

ALTER TABLE public.client_checks
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_checks_status_check'
  ) THEN
    ALTER TABLE public.client_checks
      ADD CONSTRAINT client_checks_status_check
      CHECK (status IN ('pending', 'paid', 'unpaid'));
  END IF;
END $$;
