"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.isSupabaseConfigured = void 0;
var ssr_1 = require("@supabase/ssr");
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
exports.isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
// Only construct the client when credentials exist — createBrowserClient() is safe
// to call even during server-side rendering because we check isBrowser().
exports.supabase = exports.isSupabaseConfigured && (0, ssr_1.isBrowser)()
    ? (0, ssr_1.createBrowserClient)(supabaseUrl, supabaseAnonKey)
    : null;
