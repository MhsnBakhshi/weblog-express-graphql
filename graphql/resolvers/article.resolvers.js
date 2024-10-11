import { Article, Tag, User } from "../../configs/db.js";
import { authGuard } from "../../utils/authGuard.js";
import { Op } from "sequelize";
import {
  calculateDurationCreateAtOfArticles,
  generateSlugForArticle,
  isArticleExist,
  removeFileFromPath,
  uploaderHandler,
} from "../../utils/helper.js";

export const createArticle = async (_, args, context) => {
  const user = await authGuard(context.req);

  const { filename, createReadStream } = await args.cover.file;
  let { title, content, tags } = args.input;

  let slug = generateSlugForArticle(title);

  tags = Array.isArray(tags) ? tags : [tags];

  tags = tags.map((tag) =>
    Tag.findOrCreate({ where: { title: tag.trim() }, raw: true })
  );
  tags = await Promise.all(tags);

  await uploaderHandler("cover", filename, createReadStream);
  const filePath = `/images/cover/${await args.cover?.file?.filename}`;

  let article = await isArticleExist(slug);

  if (article) {
    throw new Error(`slug: ${slug} تکراری است!`);
  }
  article = await Article.create({
    title,
    slug,
    author_id: user.id,
    cover: filePath,
    content,
  });

  await article.addTags(tags.map((tag) => tag[0]));

  return {
    ...article.dataValues,
    tags: tags.map((tag) => tag[0]),
    author: user,
  };
};

export const updateArticle = async (_, args, context) => {
  const { id: userID, role } = await authGuard(context.req);
  const { articleID, title, content } = args;
  const slug = generateSlugForArticle(title);

  const articleAuthor = await Article.findOne({
    where: {
      id: articleID,
      author_id: userID,
    },
  });

  if (role === "ADMIN" || articleAuthor) {
    await Article.update(
      { content, title, slug },
      {
        where: {
          id: articleID,
        },
      }
    );

    return {
      success: true,
      error: false,
      message: "مقاله ویرایش شد",
    };
  } else {
    return {
      success: false,
      error: true,
      message:
        "Forbidden !!, دسترسی غیر مجاز و یا مقاله برای شما نیست که بتوانید ویرایش کنید.",
    };
  }
};

export const removeArticle = async (_, args, context) => {
  const { role, id } = await authGuard(context.req);
  const articleAuthor = await Article.findOne({
    where: {
      id: args.id,
      author_id: id,
    },
  });

  if (role === "ADMIN" || articleAuthor) {
    await Article.destroy({ where: { id: args.id } });
    return {
      success: true,
      error: false,
      message: "مقاله حذف شد.",
    };
  } else {
    return {
      success: false,
      error: true,
      message:
        "Forbidden !!, دسترسی غیر مجاز و یا مقاله برای شما نیست که بتوانید حذف کنید.",
    };
  }
};
export const delArticleCover = async (_, args, context) => {
  const { id } = await authGuard(context.req);

  const findArticleFromThisAuthor = await Article.findOne({
    where: { author_id: id, id: args.id },
  });

  if (!findArticleFromThisAuthor) {
    return {
      success: false,
      error: true,
      message: "مقاله ایی یافت نشد یا برای این توکن کاربر نیست",
    };
  } else {
    removeFileFromPath(findArticleFromThisAuthor.dataValues.cover);
    await findArticleFromThisAuthor.update({ cover: null });

    return {
      success: true,
      error: false,
      message: "مقاله حذف شد.",
    };
  }
};

export const findAllArticle = async (_, { limit, page }) => {
  const articles = await Article.findAll({
    include: [
      {
        model: Tag,
        attributes: ["title"],
        through: {
          attributes: [],
        },
      },
      {
        model: User,
        attributes: {
          exclude: ["password"],
        },
        as: "author",
      },
    ],
    limit,
    offset: (page - 1) * limit,

    order: [["created_at", "DESC"]],
  });

  articles.forEach((article) => {
    article.dataValues.created_at = calculateDurationCreateAtOfArticles(
      article.dataValues.created_at
    );
  });
  return articles;
};

export const findArticleBuySlug = async (_, { slug }) => {
  const articles = await Article.findAll({
    where: {
      slug: {
        [Op.like]: `%${slug}%`,
      },
    },
    include: [
      {
        model: Tag,
        attributes: ["title"],
        through: {
          attributes: [],
        },
      },
      {
        model: User,
        attributes: {
          exclude: ["password"],
        },
        as: "author",
      },
    ],
  });

  if (!articles.length) {
    throw new Error("مقاله ایی وجود ندارد با slug دریافتی ...");
  }
  articles.forEach((article) => {
    article.dataValues.created_at = calculateDurationCreateAtOfArticles(
      article.dataValues.created_at
    );
  });
  return articles;
};
export const findArticleBuyTag = async (_, { tag }) => {
  const articles = await Article.findAll({
    include: [
      {
        model: Tag,
        where: {
          title: tag,
        },
        attributes: ["title", "id"],
        through: {
          attributes: [],
        },
      },
      {
        model: User,
        attributes: {
          exclude: ["password"],
        },
        as: "author",
      },
    ],
  });

  if (!articles.length) {
    throw new Error("مقاله ایی وجود ندارد با Tag دریافتی ...");
  }
  articles.forEach((article) => {
    article.dataValues.created_at = calculateDurationCreateAtOfArticles(
      article.dataValues.created_at
    );
  });
  return articles;
};
