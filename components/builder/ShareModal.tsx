/* This example requires Tailwind CSS v2.0+ */
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { Fragment } from "react";
import { useNoCodeForm } from "../../lib/noCodeForm";
import Loading from "../Loading";

export default function ShareModal({ open, setOpen, formId }) {
  const { noCodeForm, isLoadingNoCodeForm } = useNoCodeForm(formId);

  const getPublicFormUrl = () => {
    if (process.browser) {
      return `${window.location.protocol}//${window.location.host}/sourcings/${formId}/`;
    }
  };

  if (isLoadingNoCodeForm) {
    return <Loading />;
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-4xl sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                {!noCodeForm.published ? (
                  <div className="p-4 border border-gray-700 rounded-md bg-ui-gray-light">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon
                          className="w-5 h-5 text-blue-400"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1 ml-3 md:flex md:justify-between">
                        <p className="text-sm text-gray-700">
                          Vous n&apos;avez pas encore publié ce formulaire.
                          Veuillez publier ce formulaire pour le partager avec
                          d&apos;autres et obtenir les premières soumissions.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-5 sm:p-6 ">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Partagez votre formulaire
                    </h3>
                    <div className="max-w-xl mt-2 text-sm text-gray-500">
                      <p>
                        Laissez vos participants remplir votre formulaire en y
                        accédant via le lien public.
                      </p>
                    </div>
                    <div className="mt-5 sm:flex sm:items-center">
                      <div className="w-full sm:max-w-xs">
                        <label htmlFor="surveyLink" className="sr-only">
                          Lien public
                        </label>
                        <input
                          id="surveyLink"
                          type="text"
                          placeholder="Enter your email"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          value={getPublicFormUrl()}
                          disabled
                        />
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getPublicFormUrl());
                          toast("Link copied to clipboard 🙌");
                        }}
                        className="inline-flex items-center justify-center w-full px-4 py-2 mt-3 font-medium text-white bg-gray-800 border border-transparent rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Copier
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
