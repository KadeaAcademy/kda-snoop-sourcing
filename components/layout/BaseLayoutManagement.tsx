import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { classNames } from "../../lib/utils";
import MenuProfile from "./MenuProfile";
import MenuSteps from "./MenuSteps";
import img from "../../public/img/prochaine-promotion.webp";
import { IoLogoWhatsapp } from "react-icons/io";
import { MdPermPhoneMsg } from "react-icons/md";
import { IoMdMail } from "react-icons/io";

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

const contactDetails = [
  {
    city: "Kinshasa",
    line1: "n° 63, Av Colonel Mondjiba, C/Ngaliema. Concession Cotex, Silikin Village",
    phone: "243810927272",
    displayedPhone: "0810 927 272",
    maps: "https://maps.app.goo.gl/ihzxmn1q8xXdkxUe6"
  },
  {
    city: "Goma",
    line1: "Blvd Kanyamuhanga, Immeuble Diplomate 3ème étage, à côté de BDGL",
    phone: "243838000004",
    displayedPhone: "0838 000 004",
    maps: "https://maps.app.goo.gl/E1odPVaUfNayi46u7"
  },
  {
    city: "Lubumbashi",
    line1: "n°9, Av Fatuma, Q/ Golf les battants, C/ Annexe",
    phone: "243830655560",
    displayedPhone: "0830 655 560",
    maps: "https://maps.app.goo.gl/zH43STac46ytGSoA9"
  },
]

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
                          alt="Logo de Kadea Academy"
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

          <footer className="flex w-full self-end bg-red  items-center px-3 mx-6 rounded-t-md shadow-md">
            <div className="md:h-full md:w-[20%] lg:flex hidden justify-center items-center ">
              <Image
                src={img}
                alt="Illustration: apprenante de Kadea Academy"
                width={220}
                height={247}
              />
            </div>

            <div className="w-full pl-8 pr-4">
              <div className="flex items-center gap-3 bg-white rounded-full px-9 justify-around py-2 my-4">
                <Link href="/forms/">
                <Image
                  src="/img/kadea_logo.png"
                  alt="Logo de Kadea Academy"
                  width={185}
                  height={33}
                />
                </Link>
                <p className="hidden text-black-800 font-semibold text-base md:flex">
                  Une formation qui change une vie
                </p>
              </div>
              <p className="text-white text-sm text-center mb-2">Pour toute préoccupation, n'hésites pas à contacter l'équipe chargée des admissions</p>
              <div className="mb-2 h-[1px] bg-white" />
              <div className="md:flex md:flex-row flex flex-col items-start justify-between text-center gap-6 pb-6 lg:flex-row lg:flex">
                {contactDetails.map((contact, idx) => (
                  <div key={idx} className="text-left w-full lg:w-1/3">
                    <h3 className="uppercase text-white font-bold mb-2 text-lg">
                      {contact.city}
                    </h3>
                    <h3 className="text-white text-sm font-light">
                      <a href={`${contact.maps}`} target="_blank">
                        <span className="font-bold"> Adresse :</span> {contact.line1}
                      </a>
                    </h3>
                    <div className="flex text-white gap-5 mt-3">
                      <h3 className="text-white text-sm mt-2">
                        <span className="font-bold">Téléphone : </span> <a href={`tel:+${contact.phone}`} target="_blank" >{contact.displayedPhone}</a>
                      </h3>
                    </div>
                    <div className="flex text-white text-3xl gap-5 mt-3">
                      <a href={`tel:+${contact.phone}`}>
                        <MdPermPhoneMsg />
                      </a>
                      <a href={`https://wa.me/${contact.phone}`} target="_blank" >
                        <IoLogoWhatsapp />
                      </a>
                      <a href="mailto:admissions@kadea.co" target="_blank" >
                        <IoMdMail />
                      </a>
                    </div>
                    {idx !== contactDetails.length-1 && <hr className="opacity-50 mt-3 md:hidden" />}
                  </div>
              ))}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
