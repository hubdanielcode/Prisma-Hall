import { useState } from "react";
import { CalendarProvider } from "@/features/events";
import { CustomDateTimePicker } from "./CustomDateTimePicker";

export default {
  title: "Components/Shared",
  component: CustomDateTimePicker,
};

const PickerPreview = () => {
  const [startsAt, setStartsAt] = useState<string>("");

  return (
    <CustomDateTimePicker
      value={startsAt}
      onChange={setStartsAt}
    />
  );
};

const dateTimePicker = () => {
  return (
    <CalendarProvider>
      <PickerPreview />
    </CalendarProvider>
  );
};

export { dateTimePicker as "Custom DateTime Picker" };
