import { DataTypes } from "sequelize";
export const Article = (sequelize) => {
  return sequelize.define(
    "article",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cover: DataTypes.STRING(255),
    },
    {
      tableName: "articles",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
