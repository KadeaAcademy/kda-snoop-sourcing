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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
      currentStep="results"
    >
      <SecondNavBar
        navItems={formResultsSecondNavigation}
        currentItemId="summary"
      />

      <LimitedWidth>
        <h1 className="mt-8 text-2xl font-bold text-ui-gray-dark max-sm:pl-4 max-md:pl-4">
          {form.name}
        </h1>
        <div className="flex-col mt-8   p-4 border w-2/3 rounded-sm">
          <p className="mb-2">Filtre</p>
          <div className="flex items-center">
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={startDate || new Date(form?.createdAt)}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            <p className="m-4">Au</p>
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={endDate || new Date(form?.dueDate)}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>
            <div className="ml-2">
              <button
                type="button"
                className="bg-[#e74c3c] text-white p-4 rounded-sm"
              >
                APPLIQUER
              </button>
            </div>
          </div>
        </div>
        {form && (
          <ResultsSummary
            formId={formId}
            startDate={startDate || new Date(form?.createdAt)}
            endDate={endDate || new Date(form?.dueDate)}
          />
        )}
      </LimitedWidth>
    </BaseLayoutManagement>
  );
}

export default withAuthentication(ResultsSummaryPage);
