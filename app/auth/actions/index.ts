"use client";

import { Database } from "@/lib/database.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export async function signUpWithEmailAndPassword(data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpass: string;
}) {
  const supabase = createClientComponentClient<Database>();
  const res = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.firstname,
        last_name: data.lastname,
      },
    },
  });
  return JSON.stringify(res);
}

export async function signInWithEmailAndPassword(data: {
  email: string;
  password: string;
}) {
  const supabase = createClientComponentClient<Database>();
  const res = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  return JSON.stringify(res);
}
export async function signOut() {
  const supabase = createClientComponentClient<Database>();
  return supabase.auth.signOut();
}
