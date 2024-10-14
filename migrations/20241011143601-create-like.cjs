"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("likes", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      article_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        alloNull: false,
        references: {
          model: "articles",
          key: "id",
        },

        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        alloNull: false,
        references: {
          model: "users",
          key: "id",
        },

        onDelete: "CASCADE",
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("likes");
  },
};
