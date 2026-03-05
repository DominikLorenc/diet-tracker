import { RegisterForm } from "@/app/_components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Register
        </h2>
        <RegisterForm />
      </div>
    </div>
  );
}
