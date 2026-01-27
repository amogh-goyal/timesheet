import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    if (session.user.roles.includes("ADMIN")) {
      redirect("/admin/dashboard");
    }
    redirect("/timesheet");
  }

  redirect("/login");
}
