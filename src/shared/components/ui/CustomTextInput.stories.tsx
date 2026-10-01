import { CustomTextInput } from "./CustomTextInput";
import { FaUser } from "react-icons/fa";

export default {
  title: "Components/Shared/Inputs",
  component: CustomTextInput,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
};

const MyTextInput = () => {
  return (
    <CustomTextInput
      icon={
        <span>
          <FaUser />
        </span>
      }
      label="Nome do Campo"
      placeholder="Seu texto aqui."
      value={""}
      onChange={() => {}}
      maxLength={50}
    />
  );
};

export { MyTextInput as "Custom Text Input" };
