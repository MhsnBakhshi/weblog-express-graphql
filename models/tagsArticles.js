export const TagsArticles = (sequelize) => {
  return sequelize.define(
    "tags_articles",
    {},
    {
      tableName: "tags_articles",
      timestamps: false,
    }
  );
};
