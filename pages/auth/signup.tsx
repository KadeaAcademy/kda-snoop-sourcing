import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import getConfig from "next/config";
import BaseLayoutUnauthorized from "../../components/layout/BaseLayoutUnauthorized";
import { createUser } from "../../lib/users";
import { handlePhoneNumberValidity } from "../../lib/utils";
import { toast } from "react-toastify";
import { DRCProvinces } from "../../lib/enums";

const { publicRuntimeConfig } = getConfig();

export default function SignUpPage() {
  const router = useRouter();

  const {
    emailVerificationDisabled,
    privacyUrl,
    termsUrl,
  } = publicRuntimeConfig;

  const handleSubmit = async (e) => {
    const callbackUrl = router.query.callbackUrl?.toString() || "/soucings";
    e.preventDefault();
    try {
      await createUser(
        {
          firstname: e.target.elements.firstname.value,
          lastname: e.target.elements.lastname.value,
          gender: e.target.elements.gender.value,
          phone: handlePhoneNumberValidity(e.target.elements.phone.value),
          dob : new Date(e.target.elements.dob.value),
          
          whatsapp: e.target.elements.whatsapp.value,
          email: e.target.elements.email.value.toLowerCase(),
          password: e.target.elements.password.value,
        },
        {
          line1: e.target.elements.line1.value,
          line2: e.target.elements.line2.value,
          commune:e.target.elements.commune.value,
          ville:e.target.elements.ville.value,
          province :e.target.elements.province.value
        },
        callbackUrl
      );

      const url = emailVerificationDisabled
        ? `/auth/signup-without-verification-success`
        : `/auth/verification-requested?email=${encodeURIComponent(
            e.target.elements.email.value
          )}&callbackUrl=${encodeURIComponent(callbackUrl)}`;

      router.push(url);
    } catch (e) {
      toast(e.message);
    }
  };
  return (
    <BaseLayoutUnauthorized title="Créer votre compte">
      <div className="flex min-h-screen bg-ui-gray-light">
        <div className="flex flex-col justify-center flex-1 px-4 py-12 mx-auto sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="w-full max-w-sm p-8 mx-auto bg-white rounded-xl shadow-cont lg:w-96">
            <div className="w-fit m-auto">
              <Image
                src="/img/kda_logo.png"
                alt="kinshasa digital academy logo"
                width={180}
                height={60}
              />
            </div>

            <div className="mt-4">
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="firstname"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Prénom
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstname"
                        name="firstname"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Jean"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastname"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Nom de famille
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastname"
                        name="lastname"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Kingandi"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>                  
                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Genre
                    </label>
                    <div className="mt-1 flex">
                      <div className="flex items-center mr-5">
                        <input
                          id="male"
                          name="gender"
                          type="radio"
                          value="male"
                          required
                          className="block form-check-input border rounded-md shadow-sm appearance-none  border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 mr-1.5"
                        />
                        <label
                          className="form-check-label inline-block text-gray-800"
                          htmlFor="male"
                        >
                          Homme
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="female"
                          name="gender"
                          type="radio"
                          value="female"
                          required
                          className="block form-check-input border rounded-md shadow-sm appearance-none  border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 mr-1.5 "
                        />
                        <label
                          className="form-check-label inline-block text-gray-800"
                          htmlFor="female"
                        >
                          Femme
                        </label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Date de naissance
                    </label>
                    <div className="mt-1">
                      <input
                        id="dob"
                        name="dob"
                        type="date"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                    htmlFor="address"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Adresse
                    </label>
                    <div className="mt-1">
                      <input
                        id="line1"
                        name="line1"
                        type="text"
                        placeholder="N° 63, Ave Colonel Mondjiba, Q. Basoko"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <input
                        id="line2"
                        name="line2"
                        type="text"
                        placeholder="Réf. Silikin Village, Concession COTEX"
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <input
                        id="commune"
                        name="commune"
                        type="text"
                        placeholder="Commune ou Territoire"

                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                    
                    <div className="mt-1">
                      <input
                        id="ville"
                        name="ville"
                        type="text"
                        placeholder="Ville"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <select 
                        name="province"
                        id="province"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture">
                        
                        <option value="" selected disabled hidden className="block text-sm font-medium text-ui-gray-dark">Sélectionnez votre province</option>
                        {Object.keys(DRCProvinces).map((province)=>(<option className="block text-sm font-medium text-ui-gray-dark" value={province}>{DRCProvinces[province]}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Numéro de téléphone (pour appels et SMS)
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+243891341236 ou 0891341236"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Numéro Whatsapp
                    </label>
                    <div className="mt-1">
                      <input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        pattern="^\+[1-9]{1}[0-9]{6,14}$" //^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$ //^\+243|0[0-9]{9}$
                        placeholder="+15289134"
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Adresse E-mail
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="jean.kingandi@exemple.cd"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Mot de passe
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••••"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-ui-gray-dark"
                    >
                      Adresse
                    </label>
                    <div className="mt-1">
                      <input
                        id="line1"
                        name="line1"
                        type="text"
                        placeholder="N° 63, Ave Colonel Mondjiba, Q. Basoko"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <input
                        id="line2"
                        name="line2"
                        type="text"
                        placeholder="Réf. Silikin Village, Concession COTEX"
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <input
                        id="commune"
                        name="commune"
                        type="text"
                        placeholder="Commune ou Territoire"

                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>
                    
                    <div className="mt-1">
                      <input
                        id="ville"
                        name="ville"
                        type="text"
                        placeholder="Ville"
                        required
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture"
                      />
                    </div>

                    <div className="mt-1">
                      <select 
                        name="province"
                        id="province"
                        required
                        value='Sélectionnez votre province'
                        className="block w-full px-3 py-2 border rounded-md shadow-sm appearance-none placeholder-ui-gray-medium border-ui-gray-medium focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ph-no-capture">
                        
                        <option value=""  disabled hidden className="block text-sm font-medium text-ui-gray-dark">Sélectionnez votre province</option>
                        {Object.keys(DRCProvinces).map((province, key)=>(
                        <option key={key}  value={province}>{DRCProvinces[province]}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-red hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      S&apos;inscrire
                    </button>

                    <div className="mt-3 text-xs text-center text-gray-600">
                      As-tu déjà un compte ?{" "}
                      <Link href="/auth/signin">
                        <a className="text-red hover:text-red-600">
                          Connecte-toi.
                        </a>
                      </Link>
                    </div>
                    {(termsUrl || privacyUrl) && (
                      <div className="mt-3 text-xs text-center text-gray-400">
                        En cliquant sur &quot;S&apos;inscrire&quot;, vous
                        acceptez nos <br />
                        {termsUrl && (
                          <a
                            className="text-red hover:text-red-600"
                            href={termsUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            conditions d&apos;utilisation
                          </a>
                        )}
                        {termsUrl && privacyUrl && <span> et </span>}
                        {privacyUrl && (
                          <a
                            className="text-red hover:text-red-600"
                            href={privacyUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            politique de confidentialité
                          </a>
                        )}
                        .<br />
                        Nous t&apos;enverrons occasionnellement des informations
                        sur ton compte par e-mail.
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayoutUnauthorized>
  );
}
