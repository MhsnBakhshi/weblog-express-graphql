import { DataTypes } from "sequelize";

export const Tag = (sequelize) => {
  return sequelize.define(
    "tags",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(55),
        allowNull: false,
      },
    },
    {
      tableName: "tags",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
