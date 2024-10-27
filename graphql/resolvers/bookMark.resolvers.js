import { Article, BookMark, User } from "../../configs/db.js";
import { authGuard } from "../../utils/authGuard.js";
export const addBookMark = async (_, { articleId }, context) => {
  const user = await authGuard(context.req);

  const existingArticle = await Article.findOne({ where: { id: articleId } });

  if (!existingArticle) {
    return {
      success: false,
      error: true,
      message: "مقاله یافت نشد !!",
    };
  }

  const checkArticleSaved = await BookMark.findOne({
    article_id: articleId,
    user_id: user.id,
  });

  if (checkArticleSaved) {
    return {
      success: false,
      error: true,
      message: "مقاله  از قبل سیو شده است !!",
    };
  }

  await BookMark.create({ article_id: articleId, user_id: user.id });

  return {
    success: true,
    error: false,
    message: "مقاله سیو شد. ",
  };
};
export const removeBookMark = async (_, { articleId }, context) => {
  const user = await authGuard(context.req);

  const existingArticle = await Article.findOne({ where: { id: articleId } });

  if (!existingArticle) {
    return {
      success: false,
      error: true,
      message: "مقاله یافت نشد !!",
    };
  }

  const getUserBookMark = await BookMark.findOne({
    where: {
      article_id: articleId,
      user_id: user.id,
    },
  });

  if (!getUserBookMark) {
    return {
      success: false,
      error: true,
      message: "مقاله سیو شده برای شما نیست یا پیدا نشد !!",
    };
  }

  await BookMark.destroy({
    where: {
      article_id: articleId,
      user_id: user.id,
    },
  });

  return {
    success: true,
    error: false,
    message: "مقاله با موفقیت unsave شد !!",
  };
};
export const getAllBookMarks = async (_, { page = 1, limit = 10 }, context) => {
  const user = await authGuard(context.req);

  const bookMarks = await BookMark.findAll({
    where: { user_id: user.id },
    include: [
      {
        model: User,
        attributes: {
          exclude: ["password"],
        },
      },
      {
        model: Article,
        include: [
          {
            model: User,
            attributes: {
              exclude: ["password"],
            },
            as: "author",
          },
        ],
      },
    ],
    limit,
    offset: (page - 1) * limit,

    order: [["created_at", "DESC"]],
  });

  return bookMarks;
};
