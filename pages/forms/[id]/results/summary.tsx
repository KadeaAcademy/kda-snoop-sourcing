import BaseLayoutManagement from "../../../../components/layout/BaseLayoutManagement";
import LimitedWidth from "../../../../components/layout/LimitedWidth";
import Loading from "../../../../components/Loading";
import MessagePage from "../../../../components/MessagePage";
import ResultsSummary from "../../../../components/results/ResultsSummary";
import SecondNavBar from "../../../../components/layout/SecondNavBar";
import { useForm } from "../../../../lib/forms";
import { useFormMenuSteps } from "../../../../lib/navigation/formMenuSteps";
import { useFormResultsSecondNavigation } from "../../../../lib/navigation/formResultsSecondNavigation";
import { useRouter } from "next/router";
import withAuthentication from "../../../../components/layout/WithAuthentication";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import { useState } from "react";

function ResultsSummaryPage() {
  const router = useRouter();
  const formId = router.query.id?.toString();
  const { form, isLoadingForm, isErrorForm } = useForm(formId);
  const formMenuSteps = useFormMenuSteps(formId);
  const formResultsSecondNavigation = useFormResultsSecondNavigation(formId);
  const [start, setStart] = useState(new Date(form.createdAt));
  const [end, setEnd] = useState(new Date(form.dueDate));

  console.log({ form });
  if (isLoadingForm) {
    return <Loading />;
  }

  if (isErrorForm) {
    return (
      <MessagePage text="Unable to load this page. Maybe you don't have enough rights." />
    );
  }

  return (
    <BaseLayoutManagement
      title={`${form.name} - KDA Sourcing`}
      breadcrumbs={[{ name: form.name, href: "#", current: true }]}
      steps={formMenuSteps}
      currentStep='results'
    >
      <SecondNavBar
        navItems={formResultsSecondNavigation}
        currentItemId='summary'
      />

      <LimitedWidth>
        <div className='flex-col mt-8  p-4 border w-2/3 rounded-sm'>
          <p className='mb-2'>Filtre</p>
          <div className='flex items-center'>
            <div className='mr-2 '>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={start}
                  onChange={(newValue) => {
                    setStart(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <p>Au</p>
            <div className='ml-2'>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={end}
                  onChange={(newValue) => {
                    setEnd(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            <button
              className='ml-6 bg-red-400 py-4 px-2 rounded-sm text-white'
              type='button'
            >
              APPLIQUER
            </button>
          </div>
        </div>

        <ResultsSummary formId={formId} />
      </LimitedWidth>
    </BaseLayoutManagement>
  );
}

export default withAuthentication(ResultsSummaryPage);
