import { User } from "../../configs/db.js";
import { redis } from "../../configs/redis.js";
import { authGuard } from "../../utils/authGuard.js";
import {
  hashUserPassword,
  generateAccessToken,
  generateRefreshToken,
  isUserRegistered,
  setHashedRefreshTokenOnRedis,
  hashRefreshToken,
  resolveCaptcha,
  generateOtpCode,
  setOtpCodeOnRedis,
  cashOtpCodeFromRedis,
  extractUserFromJwt,
  cachedRefreshTokenFromRedis,
  compareRefreshTokenHandler,
  findUserById,
  uploaderHandler,
  removeFileFromPath,
} from "../../utils/helper.js";
import {
  registerUserValidatorSchema,
  loginUserValidatorSchema,
} from "../../utils/validators.js";

export const register = async (_, args) => {
  const { name, username, password, phone, email, avatar, role } = args;

  await registerUserValidatorSchema.validate(
    {
      name,
      username,
      password,
      phone,
      email,
      avatar,
    },
    { abortEarly: false }
  );

  const isUserExist = await isUserRegistered(phone);

  if (isUserExist) {
    throw new Error("The User Already Exist !!");
  }

  const hashedPassword = await hashUserPassword(password);

  const user = await User.create({
    name,
    username,
    password: hashedPassword,
    phone,
    email,
    avatar,
    role,
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const hashedRefreshToken = await hashRefreshToken(refreshToken);

  await setHashedRefreshTokenOnRedis(user.id, hashedRefreshToken);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (_, args) => {
  const { phone, uuid, captcha } = args;

  await loginUserValidatorSchema.validate({
    phone,
    uuid,
    captcha,
  });

  if (!(await isUserRegistered(phone))) {
    throw new Error("ابتدا ثبت نام کنید !");
  }

  const captchaResult = await resolveCaptcha(captcha.toLowerCase(), uuid);

  if (!captchaResult) {
    throw new Error("!! کپچا منقضی یا معتبر نیست");
  } else {
    const code = generateOtpCode(phone);

    if (!code) {
      throw new Error("ارور در ارسال کد ...");
    }

    const cashOtpCodeFromRedis = await setOtpCodeOnRedis(code, phone);

    if (!cashOtpCodeFromRedis) {
      throw new Error("Code Max Used !!");
    }

    return {
      code,
      message: "کد ارسال شد مدت زمان 3 دقیقه ...",
    };
  }
};

export const verifyOtp = async (_, args) => {
  const { phone, code } = args;
  const user = await authGuard(context.req);

  const isValidCode = await cashOtpCodeFromRedis(phone, code);

  if (!isValidCode) {
    throw new Error(
      "کد منقضی  یا به حداکثر مجاز استفاده رسیده!! بعد 10 دقیقه مجدد امتحان کنید"
    );
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  const hashedRefreshToken = await hashRefreshToken(refreshToken);
  await setHashedRefreshTokenOnRedis(user.id, hashedRefreshToken);

  return {
    accessToken,
    refreshToken,
    user,
  };
};

export const refreshToken = async (_, __, context) => {
  const user = await extractUserFromJwt(context);

  const cachedRefreshToken = await cachedRefreshTokenFromRedis(user.id);
  const compareRefreshToken = await compareRefreshTokenHandler(
    context,
    cachedRefreshToken
  );

  if (!compareRefreshToken) {
    throw new Error("رفرش توکن معتبر نیست !!");
  }

  return {
    token: generateAccessToken(user.id),
  };
};

export const user = async (_, args, context) => {
  const { role } = await authGuard(context.req);
  const { id } = args;

  if (role !== "ADMIN") {
    throw new Error("شما دسترسی ندارید تنها ادمین ها دسترسی دارند!");
  }

  const mainUser = await User.findOne({
    where: {
      id: Number(id),
    },
    attributes: { exclude: ["password"] },
    raw: true,
  });

  if (!mainUser) {
    throw new Error("کاربری یافت نشد!");
  }

  return mainUser;
};

export const users = async (_, args, context) => {
  const { page, limit } = args;
  const { role } = await authGuard(context.req);

  if (role !== "ADMIN") {
    throw new Error("شما دسترسی ندارید تنها ادمین ها دسترسی دارند!");
  }

  const allUsers = await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
    raw: true,
  });

  if (!allUsers) {
    throw new Error("لیست کاربران خالی است");
  }

  return allUsers;
};

export const removeUser = async (_, args, context) => {
  const { userID } = args;
  const { role } = await authGuard(context.req);

  if (role !== "ADMIN") {
    throw new Error("شما دسترسی ندارید تنها ادمین ها دسترسی دارند!");
  }
  const removedUser = await findUserById(userID);

  await User.destroy({ where: { id: userID } });

  return removedUser;
};

export const logOut = async (_, __, context) => {
  const user = await authGuard(context.req);

  const delkey = await redis.del(`refreshToken: ${user.id}`);

  if (!delkey) {
    return {
      success: false,
      error: true,
      message: "رفرش توکن منقضی و یا وجود ندارد در دیتابیس !!",
    };
  }

  return {
    success: true,
    error: false,
    message: " کاربر با موفقیت لاگ اوت شد",
  };
};

export const getMe = async (_, __, context) => {
  const user = await authGuard(context.req);

  return user;
};

export const setAvatar = async (_, { file }, context) => {
  const { id } = await authGuard(context.req);
  const { filename, mimetype, encoding, createReadStream } = await file.file;

  if (!filename || !mimetype || !encoding) {
    throw new Error("فایلی ارسال نشده");
  }

  await uploaderHandler("avatar", filename, createReadStream);

  const avatarPath = `/images/avatar/${
    (await file?.file?.filename) + Date.now()
  }`;

  await User.update(
    {
      avatar: avatarPath,
    },
    {
      where: {
        id,
        avatar: null,
      },
    }
  );

  return {
    filename,
    mimetype,
    encoding,
    link: avatarPath,
  };
};

export const removeAvatar = async (_, __, context) => {
  const user = await authGuard(context.req);

  if (user.avatar) {
    removeFileFromPath(user.avatar);

    await User.update({ avatar: null }, { where: { id: user.id } });
    return {
      success: true,
      error: false,
      message: "پروفایل حذف شد ..",
    };
  }

  return {
    success: false,
    error: true,
    message: "کاربر از قبل پروفایل ندارد ..",
  };
};
export const getAllAdmins = async (_, __, context) => {
  const { role } = await authGuard(context.req);

  if (role !== "ADMIN") {
    throw new Error("شما دسترسی ندارید تنها ادمین ها دسترسی دارند!");
  }

  const admins = await User.findAll({
    where: { role: "ADMIN" },
    attributes: {
      exclude: ["password"],
    },
    order: [["created_at", "DESC"]],
    raw: true,
  });

  return admins;
};

export const changeRole = async (_, args, context) => {
  const { role } = await authGuard(context.req);
  const userID = args.userID;

  if (role !== "ADMIN") {
    return {
      error: true,
      success: false,
      message: "شما دسترسی ندارید تنها ادمین ها دسترسی دارند!",
    };
  }

  const isUserExist = await User.findOne({ where: { id: userID } });

  if (!isUserExist) {
    return {
      error: true,
      success: false,
      message: "کاربری یافت نشد ایدی بررسی شود !!",
    };
  }

  await User.update({ role: args.role }, { where: { id: userID } });

  return {
    error: false,
    success: true,
    message: "نقش کاربر تغییر یافت",
  };
};
