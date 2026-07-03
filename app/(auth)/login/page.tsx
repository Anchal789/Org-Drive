import HeroPanel from "@/components/authPages/HeroPanel";
import LoginForm from "@/components/authPages/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      <HeroPanel />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
