import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!session) return;

    const ensureProfileRow = async () => {
      const payload = {
        user_id: session.user.id,
        full_name: session.user.user_metadata?.full_name || session.user.email || null,
        role: session.user.user_metadata?.role || "community_user",
      };
      const { error } = await supabase.from("profiles").upsert([payload], { onConflict: "user_id" });
      if (error) {
        console.warn("Unable to ensure profile row", error.message);
      }
    };

    ensureProfileRow();
  }, [session]);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
      }
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (mounted) {
        setSession(updatedSession);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
  };
};
