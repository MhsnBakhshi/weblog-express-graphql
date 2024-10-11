import { v4 as uuidv4 } from "uuid";
import svgCaptcha from "svg-captcha";
import { redis } from "../../configs/redis.js";

export const generateCaptcha = async () => {
  const uuid = uuidv4();
  const captcha = svgCaptcha.create({
    noise: 4,
    color: true,
    size: 6,
  });

  await redis.set(`captcha:${uuid}`, captcha.text.toLowerCase(), "EX", 60 * 3); //3 min

  console.log(captcha.text);

  return {
    uuid,
    captcha: captcha.data,
  };
};
