import { DataTypes } from "sequelize";

export const Like = (sequelize) => {
  return sequelize.define(
    "likes",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      article_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        alloNull: false,
        references: {
          model: "articles",
          key: "id",
        },

        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        alloNull: false,
        references: {
          model: "users",
          key: "id",
        },

        onDelete: "CASCADE",
      },
    },
    {
      tableName: "likes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
