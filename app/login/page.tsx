import { Chrome } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-primary-800 mb-2">
          Iftar Match
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Ramazan Davet Eşleştirme Sistemi
        </p>

        <form action={loginAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <Chrome className="w-5 h-5" />
            Google ile Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
