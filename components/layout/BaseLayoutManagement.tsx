import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { classNames } from "../../lib/utils";
import MenuProfile from "./MenuProfile";
import MenuSteps from "./MenuSteps";
import { useRouter } from "next/router";
import Loading from "../Loading";
import { SiGooglemessages } from "react-icons/si";
import { SiWhatsapp } from "react-icons/si";
import { ImMail4 } from "react-icons/im";

interface BaseLayoutManagementProps {
  title: string;
  children: React.ReactNode;
  breadcrumbs?: any;
  steps?: any;
  currentStep?: string;
  activeMenu?: string;
  bgClass?: string;
  limitHeightScreen?: boolean;
}

export default function BaseLayoutManagement({
  title,
  steps,
  currentStep,
  children,
  bgClass = "bg-ui-gray-lighter",
  limitHeightScreen = false,
  activeMenu,
}: BaseLayoutManagementProps) {
  const session = useSession();
  const { user } = session.data;
  const adminMenus = [
    { id: "forms", name: "Sourcings", href: "/" },
    { id: "users", name: "Gestion d'utilisateurs", href: "/users" },
  ];
  const router = useRouter();
  const { asPath } = router;
  if (!user.profileIsValid) {
    router.push({
      pathname: `/users/update-profile`,
      query: { next: asPath },
    });
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div
        className={classNames(
          bgClass,
          limitHeightScreen
            ? "h-screen max-h-screen overflow-hidden"
            : "min-h-screen",
          "flex h-full"
        )}
      >
        <div
          className={classNames(
            limitHeightScreen ? "max-h-full" : "h-full",
            "flex flex-row flex-wrap flex-1 w-full min-h-screen"
          )}
        >
          <header className="w-full">
            <div className="relative z-10 flex flex-shrink-0 h-16 bg-white border-b shadow-sm border-ui-gray-light max-sm:pr-2 max-sm:pl-2 max-md:pr-2 max-md:pl-2">
              <div className="grid w-full grid-cols-3 ">
                <div className="flex-1  space-x-2 sm:flex justify-start ">
                  <div className="sm:w-fit ml-6 flex items-center h-full">
                    <Link href="/forms/">
                      <a className="text-ui-gray-dark hover:text-ui-gray-dark">
                        <Image
                          src="/img/kadea_logo.png"
                          alt="Kadea  academy logo"
                          width={140}
                          height={30}
                        />
                      </a>
                    </Link>
                  </div>

                  {user.role === "ADMIN" && (
                    <div className="flex-1 hidden  space-x-2 lg:flex items-center ">
                      {adminMenus && (
                        <MenuSteps
                          steps={adminMenus}
                          currentStep={activeMenu}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className=" flex sm:flex-1 items-center justify-center">
                  {steps && (
                    <MenuSteps steps={steps} currentStep={currentStep} />
                  )}
                </div>

                <div className="flex items-center justify-end flex-1 space-x-2 text-right sm:space-x-4">
                  <div className="mr-6">
                    <MenuProfile />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex flex-col w-full">{children}</div>

          <footer className="w-full self-end bg-red  items-center py-6 ">
            <div className=" mx-auto 2xl:max-w-screen-xl xl:max-w-screen-lg lg:px-10">
              <div className=" mb-4 flex flex-col  justify-between items-center ">
                <Link href="/forms/">
                  <a className="text-ui-gray-dark hover:text-ui-gray-dark">
                    <Image
                      src="/img/logo-white.webp"
                      alt="Kadea  academy logo"
                      width={140}
                      height={30}
                    />
                  </a>
                </Link>

                <p className=" text-white text-xs">
                  Une formation qui change une vie.
                </p>
              </div>

              <hr className=" opacity-50" />

              <div className="flex items-start justify-between text-center py-8">
                <div className=" text-left w-1/3">
                  <h3 className=" text-white font-medium uppercase mb-2 text-lg">
                    Kinshasa
                  </h3>
                  <h3 className=" text-white font-normal text-sm">
                    N° 63, Ave Colonel Mondjiba, Silikin Village, <br />
                    Concession COTEX, Kinshasa
                  </h3>
                  <div className=" flex gap-2 text-white text-xl">
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="sms:+243810927272&body=En quoi pouvons-nous vous aider ?"
                      >
                        <SiGooglemessages />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="https://wa.me/243810927272"
                      >
                        <SiWhatsapp />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="mailto:admissions@kadea.co"
                      >
                        <ImMail4 />
                      </a>
                    </address>
                  </div>
                </div>

                <div className=" text-center w-1/3">
                  <h3 className=" text-white font-medium uppercase mb-2 text-lg">
                    Goma
                  </h3>
                  {/* <h3 className=" text-white font-normal text-sm">
                    N° 63, Ave Colonel Mondjiba, Silikin Village, <br />
                    Concession COTEX, Kinshasa
                  </h3> */}
                  <div className=" flex gap-2 text-white text-xl justify-center">
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="sms:+243838000004&body=En quoi pouvons-nous vous aider ?"
                      >
                        <SiGooglemessages />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="https://wa.me/243838000004"
                      >
                        <SiWhatsapp />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="mailto:admissions@kadea.co"
                      >
                        <ImMail4 />
                      </a>
                    </address>
                  </div>
                </div>

                <div className=" text-right w-1/3">
                  <h3 className=" text-white font-medium uppercase mb-2 text-lg">
                    Lubumbashi
                  </h3>
                  {/* <h3 className=" text-white font-normal text-sm">
                    N° 63, Ave Colonel Mondjiba, Silikin Village, <br />
                    Concession COTEX, Kinshasa
                  </h3> */}
                  <div className=" flex gap-2 items-end justify-end text-white text-xl">
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="sms:+243830655560&body=En quoi pouvons-nous vous aider ?"
                      >
                        <SiGooglemessages />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="https://wa.me/243830655560"
                      >
                        <SiWhatsapp />
                      </a>
                    </address>
                    <address>
                      <a
                        className="text-center py-4 lg:text-left text-white"
                        href="mailto:admissions@kadea.co"
                      >
                        <ImMail4 />
                      </a>
                    </address>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
