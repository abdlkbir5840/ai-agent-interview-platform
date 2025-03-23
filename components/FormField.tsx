import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
interface FormFieldType<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}
const FormField = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldType<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel className="lable">{label}</FormLabel>
        <FormControl>
          <Input
            className="input"
            placeholder={placeholder}
            type={type}
            {...field}
          />
        </FormControl>
        {/* <FormMessage /> */}
        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}

      </FormItem>
    )}
  />
);

export default FormField;
