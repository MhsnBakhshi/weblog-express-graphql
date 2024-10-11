import jwt from "jsonwebtoken";
import configs from "../configs/configs.js";
import { findUserById } from "./helper.js";

export const authGuard = async (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new Error("توکنی ارسال نشده !!");
    }

    const payLoad = jwt.verify(token, configs.auth.accessTokenSecretKey);

    if (!payLoad) {
      throw new Error("توکن منقضی شده !!");
    }

    const user = await findUserById(payLoad.id);

    if (user) {
      return user;
    } else {
      throw new Error("کاربری یافت نشد ! توکن معتبر نیست ..");
    }
  } else {
    throw new Error("توکنی ارسال نشده !!");
  }
};
