"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "../actions";
import { useRouter } from "next/navigation";

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "password is required."),
});

const Signin = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof signinSchema>) {
    const res = await signInWithEmailAndPassword(values);
    router.refresh();
    const { data, error } = JSON.parse(res);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 bg-slate-950 rounded-lg p-4 px-6 border border-gray-800"
      >
        <h1 className="font-semibold text-2xl">Signin</h1>
        <h4 className="font-light text-sm mb-4">Sigin into your account.</h4>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} onChange={field.onChange} />
              </FormControl>
              <FormMessage content="lkjasd" />
            </FormItem>
          )}
        />
        <Button type="submit">Signin</Button>
      </form>
    </Form>
  );
};

export default Signin;
