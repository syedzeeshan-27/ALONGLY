import { BrandWordmark } from "@/app/components/brand-logo";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const confirmationError = firstParam(params.error) === "confirmation";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,_#fdf6ec_0%,_#fbf7f1_55%,_#f3faf9_100%)] px-5 py-12">
      <section className="w-full max-w-md rounded-[28px] border border-white/80 bg-white/85 p-8 shadow-xl shadow-stone-300/20 backdrop-blur">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandWordmark className="mb-5 h-12 w-auto" priority sizes="180px" />
          <h1 className="text-[1.7rem] font-bold tracking-tight text-stone-950">
            Welcome back
          </h1>
        </div>

        <LoginForm
          nextPath={firstParam(params.next)}
          notice={
            confirmationError
              ? "That confirmation link could not be verified. Try logging in or request a new link."
              : undefined
          }
        />
      </section>
    </main>
  );
}
