import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export const useSupabaseSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  const ensureProfileRow = useCallback(async () => {
    if (!session?.user?.id) {
      setProfileRole(null);
      setLoadingRole(false);
      return;
    }

    setLoadingRole(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (error) {
      console.warn("Unable to load profile role", error.message);
      setLoadingRole(false);
      return;
    }

    if (data) {
      setProfileRole(data.role);
      setLoadingRole(false);
      return;
    }

    const payload = {
      user_id: session.user.id,
      full_name: session.user.user_metadata?.full_name || session.user.email || null,
    };

    const { error: insertError } = await supabase.from("profiles").insert([payload]);
    if (insertError) {
      console.warn("Unable to ensure profile row", insertError.message);
      setLoadingRole(false);
      return;
    }

    const { data: insertedData, error: readError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (readError) {
      console.warn("Unable to load inserted profile role", readError.message);
      setLoadingRole(false);
      return;
    }

    setProfileRole(insertedData?.role ?? null);
    setLoadingRole(false);
  }, [session]);

  useEffect(() => {
    ensureProfileRow();
  }, [ensureProfileRow]);

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
    profileRole,
    loadingRole,
  };
};
