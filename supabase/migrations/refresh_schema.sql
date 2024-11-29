-- Notify PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Alternative approach: Reset PostgREST's schema cache
SELECT pg_notify('pgrst', 'reload schema');
