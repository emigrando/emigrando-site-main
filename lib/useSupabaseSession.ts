"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./supabaseClient";

interface SessionState {
  user: User | null;
  loading: boolean;
}

export function useSupabaseSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    user: null,
    loading: true,
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (error || !data?.user) {
        setState({ user: null, loading: false });
      } else {
        setState({ user: data.user, loading: false });
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return state;
}
