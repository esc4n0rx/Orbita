import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10">
            <Star className="h-6 w-6 text-yellow-400" />
          </div>
          <CardTitle className="text-xl">Você está offline</CardTitle>
          <CardDescription>Não foi possível conectar à internet</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-400">
            O Orbita funciona offline, mas algumas funcionalidades podem estar limitadas. Verifique sua conexão e tente
            novamente.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Tentar novamente</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
