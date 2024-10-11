"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn("articles", "author_id", {
        type: Sequelize.INTEGER.UNSIGNED,
        alloNull: false,
        references: {
          model: "users",
          key: "id",
        },

        onDelete: "CASCADE",
      });

      await queryInterface.createTable("tags_articles", {
        article_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          alloNull: false,
          references: {
            model: "articles",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        tag_id: {
          type: Sequelize.INTEGER.UNSIGNED,
          alloNull: false,
          references: {
            model: "tags",
            key: "id",
          },
          onDelete: "CASCADE",
        },
      });

      await queryInterface.addConstraint("tags_articles", {
        fields: ["tag_id", "article_id"],
        type: "unique",
        name: "unique_articles_tag",
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error("You have err in creating relations ->", error);
    }
  },
  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn("articles", "article_id");
      await queryInterface.removeColumn("padcasts", "article_id");
      await queryInterface.dropTable("tags_articles");

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error("You have err in droping relations ->", error);
    }
    await queryInterface.dropTable("relations");
  },
};
