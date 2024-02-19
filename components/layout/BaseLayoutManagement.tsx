import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { classNames } from "../../lib/utils";
import MenuProfile from "./MenuProfile";
import MenuSteps from "./MenuSteps";
import { useRouter } from "next/router";
import Loading from "../Loading";
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

const footer_links = [
  {
    title: "Kinshasa",
    address: " n° 63, Av Colonel Mondjiba, C/Ngaliema. Concession Cotex, Silikin Village",
    phone: "243810927272",
    displayedPhone: "0810 927 272",
    maps: "https://maps.app.goo.gl/ihzxmn1q8xXdkxUe6"
  },
  {
    title: "Goma",
    address: "Blvd Kanyamuhanga, Immeuble Diplomate 3ème étage, à côté de BDGL",
    phone: "243838000004",
    displayedPhone: "0838 000 004",
    maps:"https://maps.app.goo.gl/E1odPVaUfNayi46u7"
  },
  {
    title: "Lubumbashi",
    address: "n°9, Av Fatuma, Q/ Golf les battants, C/ Annexe",
    phone: "243830655560",
    displayedPhone: "0830 655 560",
    maps:"https://maps.app.goo.gl/zH43STac46ytGSoA9"
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

          <footer className="flex w-full self-end bg-red  items-center px-3 mx-6 rounded-t-md shadow-md">
            
            <div className=" w-[20%] flex justify-center items-center ">
              <Image
              src={img}
              alt="Kadea  academy logo"
              width={220}
              height={247}
              className=" h-full"
              />

            </div>

            <div className="  w-full pl-8 pr-4">
              <div className=" flex items-center gap-3 bg-white rounded-full px-9 justify-center py-2 my-4">
                <Link href="/forms/">
                    <Image
                      src="/img/kadea_logo.png"
                      alt="Kadea  academy logo"
                      width={185}
                      height={33}
                    />
                </Link>

                <p className=" text-black-800 font-semibold text-base">
                  Une formation qui change une vie.
                </p>

              </div>
                <p className="text-white text-sm text-center mb-2">Pour toute préoccupation, n'hésites pas à contacter l'équipe chargée des admissions</p>

              <hr className=" opacity-50 mb-2" />

              <div className="flex items-start justify-between text-center gap-6 pb-6">

                {footer_links.map((element) => (
                  // <div></div>
                <div className=" text-left w-1/3">
                  <h3 className=" text-white font-bold mb-2 text-lg">
                    {element.title}
                  </h3>

                  <h3 className=" text-white text-sm font-light">
                    <a href={`${element.maps}`} target="_blank">

                  <span className="font-bold"> Adresse :</span> {element.address}
                    </a>
                  </h3>

                  <div className="flex text-white gap-5 mt-3">
                    <h3 className="text-white text-sm mt-2">
                      <span className="font-bold">Téléphone : </span> <a href={`tel:+${element.phone}`} target="_blank" >{element.displayedPhone}</a>
                      </h3>
                    
                  </div>

                  <div className="flex text-white text-3xl gap-5 mt-3">

                      <a href={`tel:+${element.phone}`} className=" ">
                        <MdPermPhoneMsg/>
                      </a>

                    <a href={`https://wa.me/${element.phone}`} target="_blank" >
                    <IoLogoWhatsapp/>
                    </a>
                    <a href={`mailto:admissions@kadea.co`} target="_blank" >
                    <IoMdMail/>
                    </a>

                  </div>
                  
                </div>
                ))}

                
              </div>

              {/* <hr className=" opacity-50 my-3" /> */}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
