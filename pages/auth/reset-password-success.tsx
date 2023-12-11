import Image from "next/image";
import BaseLayoutUnauthorized from "../../components/layout/BaseLayoutUnauthorized";
import { useRouter } from "next/router";

export default function ResetPasswordSuccess() {
  const router = useRouter();
  const formId = router.query.id?.toString();

  const redirectToSignin = () => {
    formId ? router.push(`/auth/signin?id=${formId}`) : router.push("/auth/signin")
  }
  return (
    <BaseLayoutUnauthorized title="Réinitialisation du mot de passe">
      <div className="flex min-h-screen bg-ui-gray-light">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 mx-auto sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="w-full max-w-sm p-8 mx-auto bg-white rounded-xl shadow-cont lg:w-96">
            <div className="w-fit m-auto">
              <Image
                src="/img/kadea_logo.png"
                alt="Kadea  academy logo"
                width={180}
                height={40}
              />
            </div>

            <div className="mt-8">
              <h1 className="mb-4 font-bold text-center leading-2">
                Mot de passe réinitialisé avec succès
              </h1>
              <p className="text-center">
                Tu peux maintenant te connecter avec ton nouveau mot de passe{" "}
              </p>
              <div className="mt-3 text-center">
                <button
                  onClick={redirectToSignin}
                >
                  <span
                    // href=""
                    className="text-xs text-red hover:text-red-600 block"
                  >
                    Connecte-toi
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayoutUnauthorized>
  );
}