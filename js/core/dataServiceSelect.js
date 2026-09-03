/* FLUENTR — core/dataServiceSelect.js
   Picks the active FluentrData provider. Must load after both
   dataService.js (LocalDataProvider) and supabaseDataProvider.js
   (SupabaseDataProvider) — that's why the choice isn't made inside either
   of those files directly. See core/config.js to switch providers. */
const FluentrData = (FluentrSupabaseAuth.isEnabled()) ? SupabaseDataProvider : LocalDataProvider;
