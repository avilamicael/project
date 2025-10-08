import { toast as sonnerToast, Toaster } from "sonner";

export function toast(options: { title: string; description?: string; variant?: "default" | "destructive" }) {
  sonnerToast[options.variant === "destructive" ? "error" : "success"](
    options.title + (options.description ? ": " + options.description : "")
  );
}

export { Toaster };
