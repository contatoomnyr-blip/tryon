import { redirect } from "next/navigation"

// Esta rota raiz é tratada pelo (dashboard)/page.tsx via route group.
// O middleware redireciona usuários não autenticados para /login.
export default function RootPage() {
  redirect("/try-on")
}
