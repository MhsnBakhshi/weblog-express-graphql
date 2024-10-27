import { Sequelize } from "sequelize";
import configs from "./configs.js";
import { User as UserModel } from "../models/user.js";
import { Tag as TagModel } from "../models/tags.js";
import { Article as ArticleModel } from "../models/articles.js";
import { TagsArticles as TagsArticlesModel } from "../models/tagsArticles.js";
import { BookMark as BookMarkModel } from "../models/bookmark.js";
import { Like as LikeModel } from "../models/like.js";

export const sequelize = new Sequelize({
  username: configs.db.user,
  database: configs.db.name,
  host: configs.db.host,
  password: configs.db.password,
  dialect: configs.db.dialect,
  // logging: configs.isProduction ? false : console.log,
  logging: false,
});

//! JsDoc
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const User = UserModel(sequelize);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const Tag = TagModel(sequelize);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const Article = ArticleModel(sequelize);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const TagsArticles = TagsArticlesModel(sequelize);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const Like = LikeModel(sequelize);
/** @type {import('sequelize').ModelCtor<import('sequelize').Model<any, any>} */
export const BookMark = BookMarkModel(sequelize);

User.hasMany(Article, {
  foreignKey: "author_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Article.belongsTo(User, {
  foreignKey: "author_id",
  as: "author",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Article.belongsToMany(Tag, {
  through: TagsArticles,
  foreignKey: "article_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Tag.belongsToMany(Article, {
  through: TagsArticles,
  foreignKey: "tag_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(BookMark, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BookMark.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Article.hasMany(BookMark, {
  foreignKey: "article_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
BookMark.belongsTo(Article, {
  foreignKey: "article_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Like, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Like.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Article.hasMany(Like, {
  foreignKey: "article_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Like.belongsTo(Article, {
  foreignKey: "article_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
export const connectToDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Connect To DB Successfully ... `);
  } catch (err) {
    console.log(`Error On Connect To DB -> ${err.message}`);
  }
};
