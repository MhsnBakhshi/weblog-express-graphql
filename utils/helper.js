import bcrypt from "bcryptjs";
import sharp from "sharp";
import { redis } from "../configs/redis.js";
import jwt from "jsonwebtoken";
import configs from "../configs/configs.js";
import { Article, Tag, User } from "../configs/db.js";
import request from "request";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import slugify from "slugify";

export const generateAccessToken = (userID) => {
  const token = jwt.sign({ id: userID }, configs.auth.accessTokenSecretKey, {
    expiresIn: configs.auth.accessTokenExpiresInSeconds + "s",
  });

  return token;
};

export const generateRefreshToken = (userID) => {
  const token = jwt.sign({ id: userID }, configs.auth.refreshTokenSecretKey, {
    expiresIn: configs.auth.refreshTokenExpiresInSeconds + "s",
  });

  return token;
};

export const hashUserPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 11);

  return hashedPassword;
};

export const hashRefreshToken = async (refreshToken) => {
  const hashedToken = await bcrypt.hash(refreshToken, 11);

  return hashedToken;
};

export const findUserById = async (userID) => {
  const user = await User.findOne({
    where: { id: userID },
    attributes: {
      exclude: ["password"],
    },
    raw: true,
  });

  if (user) {
    return user;
  } else {
    throw new Error("کاربری یافت نشد !  ..");
  }
};

export const isUserRegistered = async (phone) => {
  const isUserExist = await User.findOne({ where: { phone } });

  if (isUserExist) {
    return true;
  } else {
    return false;
  }
};

export const setHashedRefreshTokenOnRedis = async (userID, refreshToken) => {
  return await redis.set(
    `refreshToken: ${userID}`,
    refreshToken,
    "EX",
    configs.auth.refreshTokenExpiresInSeconds
  );
};

export const resolveCaptcha = async (captcha, uuid) => {
  const cachedCaptcha = await redis.get(`captcha:${uuid}`);

  if (cachedCaptcha) {
    await redis.del(`captcha:${uuid}`);
    return true;
  }

  if (cachedCaptcha !== captcha.toLowerCase()) {
    throw new Error("کپچا یا آیدی نامعتبر است !!");
  }
};

export const generateOtpCode = (phone) => {
  const code = Math.floor(Math.random() * 99999);

  request.post(
    {
      url: "http://ippanel.com/api/select",
      body: {
        op: "pattern",
        user: configs.FarazSmsPanel.user,
        pass: configs.FarazSmsPanel.pass,
        fromNum: configs.FarazSmsPanel.fromNum,
        toNum: phone,
        patternCode: configs.FarazSmsPanel.patternCode,
        inputData: [{ "login-code": code }],
      },
      json: true,
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        if (
          typeof response.body !== "number" &&
          Number(response.body[0]) !== 0
        ) {
          throw new Error(response.body[1]);
        }
        return true;
      }
    }
  );
  return code;
};

export const setOtpCodeOnRedis = async (code, phone) => {
  const maxUse = 0;
  const count = await redis.get(`${phone}:${code}`);

  if (count <= 3) {
    await redis.set(`${phone}:${code}`, maxUse + 1, "EX", 60 * 3); // 3min
    return true;
  }

  setTimeout(async () => {
    await redis.del(`${phone}:${code}`);
  }, 10 * 60 * 1000); // 10min

  return false;
};

export const cashOtpCodeFromRedis = async (phone, code) => {
  const count = await redis.get(`${phone}:${code}`);

  if (!count) {
    throw new Error(
      "کد منقضی  یا به حداکثر مجاز استفاده رسیده!! بعد 10 دقیقه مجدد امتحان کنید"
    );
  }

  return true;
};

export const extractUserFromJwt = async (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new Error("رفرش توکنی ارسال نشده !!");
    }

    const payload = jwt.verify(token, configs.auth.refreshTokenSecretKey);
    const user = await findUserById(payload.id);

    if (!user) {
      throw new Error("کاربری با این توکن یافت نشد!!");
    }

    return user;
  } else {
    throw new Error("رفرش توکنی ارسال نشده !!");
  }
};

export const cachedRefreshTokenFromRedis = async (userID) => {
  const token = await redis.get(`refreshToken: ${userID}`);

  if (token) {
    return token;
  } else {
    throw new Error("رفرش توکن منقضی شده است مجدد لاگین کنید ..");
  }
};

export const compareRefreshTokenHandler = async (
  context,
  hashedRefreshToken
) => {
  const authHeader = context.req.headers.authorization;

  const refreshToken = authHeader.replace("Bearer ", "");

  const result = await bcrypt.compare(refreshToken, hashedRefreshToken);

  if (result) {
    return true;
  } else {
    return false;
  }
};

export const uploaderHandler = async (folder, filename, createReadStream) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const ext = path.extname(filename).toLowerCase();

  const pathname = path.join(
    __dirname,
    `../public/images/${folder}/${filename}`
  );
  const stream = createReadStream();
  const chunks = [];

  for await (let chunk of stream) {
    chunks.push(chunk);
  }

  const fileBuffer = Buffer.concat(chunks);

  await compressedFile(fileBuffer, pathname, ext);
  const out = fs.createWriteStream(pathname);
  await stream.pipe(out);
};

export const removeFileFromPath = (filePath) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const uploadedFilePath = path.join(__dirname, "..", "/public", filePath);

  if (!fs.existsSync(uploadedFilePath)) {
    throw new Error("فایلی پیدا نشد !!");
  }
  fs.unlinkSync(uploadedFilePath);
};

const compressedFile = async (buffer, avatarPath, ext) => {
  switch (ext) {
    case ".png":
      sharp(buffer)
        .png({
          quality: 70,
        })
        .toFile(avatarPath);
      break;
    case ".jpeg":
      sharp(buffer)
        .jpeg({
          quality: 70,
        })
        .toFile(avatarPath);
      break;
    default:
      throw new Error("فرمت فایل ناشناخته است");
  }
};

export const generateSlugForArticle = (title) => {
  let slug = slugify(title, { lower: true });

  return slug;
};

export const isArticleExist = async (slug) => {
  const result = !!(await Article.findOne({ where: { slug } }));

  return result;
};

export const calculateDurationCreateAtOfArticles = (createdAt) => {
  const currentTime = new Date();
  const createdAtTime = new Date(createdAt);

  const timeDifference = Math.abs(currentTime - createdAtTime);
  const seconds = Math.floor(timeDifference / 1000);

  if (seconds < 60) {
    return "همین الان";
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقیقه پیش`;
  } else {
    const hours = Math.floor(seconds / 3600);
    if (hours < 24) {
      return `${hours} ساعت پیش`;
    } else if (seconds < 604800) {
      // 2592000 seconds = 30 days

      const days = Math.floor(seconds / 86400);
      return `${days} روز پیش`;
    } else if (seconds < 2592000) {
      const weeks = Math.floor(seconds / 604800); // 604800 seconds = 7 days
      return `${weeks} هفته پیش`;
    } else {
      const months = Math.floor(seconds / 2592000); // 30 days
      return `${months} ماه پیش`;
    }
  }
};

