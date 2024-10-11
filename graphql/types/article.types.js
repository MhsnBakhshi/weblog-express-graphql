export const Article = `
  type Article {
  id: ID
  title: String
  content: String
  tags: [Tag]
  slug: String
  cover: String
  author: User
  created_at: String
}`;
export const Tag = `
  type Tag {
  id: ID
  title: String
}`;

export const createArticleInput = `
  input createArticleInput {
    title: String
    content: String
    tags: [String]     
  }`;
