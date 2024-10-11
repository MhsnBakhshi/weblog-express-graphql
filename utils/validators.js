import yup from "yup";

export const registerUserValidatorSchema = yup.object().shape({
  name: yup
    .string("نام و نام خانوادگی باید بصورت متن باشد!")
    .required("نام و نام خانوادگی اجباری است!")
    .max(30, "نام و نام خانوادگی باید حداکثر 30 کاراکتر باشد !"),

  email: yup.string().email("فورمت ایمیل معتبر نیست").optional(),
  avatar: yup.string().optional(),

  username: yup
    .string("نام کاربری باید بصورت متن باشد!")
    .min(8, "نام کاربری باید حداقل 8 کاراکتر داشته باشد!")
    .max(24, "نام کاربری باید حداکثر 24 کاراکتر داشته باشد!")
    .required("نام کاربری اجباری است!"),

  phone: yup
    .string("شماره تلفن باید بصورت متن باشد")
    .matches(
      /^(0|98)?([ ]|-|[()]){0,2}9[0-4|9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}$/,
      "شماره تلفن معتبر نمیباشد"
    )
    .required("شماره تلفن اجباری است!"),

  password: yup
    .string("پسپورد باید بصورت متن باشد!")
    .min(8, "پسپورد باید حداقل 8 کاراکتر داشته باشد!")
    .max(24, " پسپورد باید حداکثر 24 کاراکتر داشته باشد!")
    .required(" پسپورد اجباری است!"),
});
export const loginUserValidatorSchema = yup.object().shape({
  phone: yup
    .string("شماره تلفن باید بصورت متن باشد")
    .matches(
      /^(0|98)?([ ]|-|[()]){0,2}9[0-4|9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}$/,
      "شماره تلفن معتبر نمیباشد"
    )
    .required("شماره تلفن اجباری است!"),

  uuid: yup.string().uuid().required(),
  captcha: yup.string().max(6).required(),
});

