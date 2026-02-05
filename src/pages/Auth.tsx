
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-10">
        <div className="w-full max-w-md mx-auto px-4">
          <AuthForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;

