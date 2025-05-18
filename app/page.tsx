import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Star } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Orbita</h1>
          <p className="text-sm text-slate-400">
            Sistema de rotina inteligente que te mantém na órbita dos seus objetivos
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/50">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                <CardDescription>Entre com sua conta para acessar o sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LoginForm />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-2 text-slate-400">Ou continue com</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-slate-800 bg-slate-950/50 hover:bg-slate-900">
                    Google
                  </Button>
                  <Button variant="outline" className="border-slate-800 bg-slate-950/50 hover:bg-slate-900">
                    GitHub
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-xl">Crie sua conta</CardTitle>
                <CardDescription>Preencha os dados abaixo para se cadastrar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RegisterForm />
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-2 text-slate-400">Ou continue com</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-slate-800 bg-slate-950/50 hover:bg-slate-900">
                    Google
                  </Button>
                  <Button variant="outline" className="border-slate-800 bg-slate-950/50 hover:bg-slate-900">
                    GitHub
                  </Button>
                </div>
              </CardFooter>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="px-8 text-center text-sm text-slate-400">
          Ao continuar, você concorda com nossos{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-white">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
            Política de Privacidade
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
