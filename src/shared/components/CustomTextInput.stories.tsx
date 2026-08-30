import { FaUser } from "react-icons/fa";
import { CustomTextInput } from "./CustomTextInput";

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
    <div className="[&>div>span:first-child]:text-white/60">
      <CustomTextInput
        className="text-black"
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
    </div>
  );
};

export { MyTextInput as "Custom Text Input" };
