import { Article, Tag, TagsArticles } from "../../configs/db.js";
import { authGuard } from "../../utils/authGuard.js";

export const addTag = async (_, args, context) => {
  await authGuard(context.req);
  const { articleID, title } = args;

  const article = await Article.findOne({ where: { id: articleID } });
  const tag = await Tag.create({ title });

  if (article) {
    await TagsArticles.create({
      article_id: article.dataValues.id,
      tag_id: tag.dataValues.id,
    });
    return {
      success: true,
      error: false,
      message: "تگ با موفقیت اضافه شد.",
    };
  } else {
    return {
      success: false,
      error: true,
      message: "مقاله ایی یافت نشد برای اضافه کردن تگ مدنظر !",
    };
  }
};
export const editTag = async (_, { title, tagID }, context) => {
  await authGuard(context.req);
  const editedTag = await Tag.findOne({ where: { id: tagID } });

  if (editedTag) {
    await editedTag.update({ title });
    return {
      success: true,
      error: false,
      message: "تگ با موفقیت ویرایش شد.",
    };
  } else {
    return {
      success: false,
      error: true,
      message: "تگ یافت نشد !!",
    };
  }
};

export const removeTagFromAdmin = async (_, { tagID }, context) => {
  const { role } = await authGuard(context.req);

  if (role === "ADMIN") {
    await Tag.destroy({ where: { id: tagID } });
    return {
      success: true,
      error: false,
      message: "تگ مورد نظر از تمامی مقاله ها حذف شد.",
    };
  } else {
    return {
      success: false,
      error: true,
      message: "Forbidden!! شما دسترسی ندارید.",
    };
  }
};
export const removeTagArticle = async (_, { articleID, tagID }, context) => {
  await authGuard(context.req);

  const removedTagFromArticle = await TagsArticles.findOne({
    where: { article_id: articleID, tag_id: tagID },
  });

  if (removedTagFromArticle) {
    await TagsArticles.destroy({
      where: { article_id: articleID, tag_id: tagID },
    });
    return {
      success: true,
      error: false,
      message: "تگ با موفقیت حذف شد.",
    };
  } else {
    return {
      success: false,
      error: true,
      message: "تگ یافت نشد !!",
    };
  }
};
export const removeAllTag = async (_, __, context) => {
  const { role } = await authGuard(context.req);

  if (role === "ADMIN") {
    await Tag.destroy({ where: {} });
    return {
      success: true,
      error: false,
      message: "تمامی تگ ها حذف شدند.",
    };
  } else {
    return {
      success: false,
      error: true,
      message: "Forbidden!! شما دسترسی ندارید.",
    };
  }
};
export const getAllTag = async (_, __, context) => {
  const { role } = await authGuard(context.req);

  if (role === "ADMIN") {
    const tags = await Tag.findAll({ where: {} });
    return tags;
  } else {
    throw new Error("Forbidden!! شما دسترسی ندارید.");
  }
};
