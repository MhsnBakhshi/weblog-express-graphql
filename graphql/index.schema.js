import * as userTypes from "./types/user.types.js";
import * as verificationsTypes from "./types/verifications.types.js";
import * as responsesTypes from "./types/responses.types.js";
import * as articleTypes from "./types/article.types.js";
import * as fileTypes from "./types/file.types.js";
import * as tagTypes from "./types/tag.types.js";

export const schema = `
      scalar Upload

      ${userTypes.Auth}
      ${userTypes.User}
      ${userTypes.UserRole}
      ${userTypes.OptionalUserInput}
      ${verificationsTypes.Captcha}
      ${verificationsTypes.Otp}
      ${verificationsTypes.AccessToken}
      ${responsesTypes.Response}
      ${articleTypes.Article}
      ${articleTypes.Tag}
      ${articleTypes.createArticleInput}
      ${fileTypes.File}
      ${tagTypes.Tag}
       
      type Query {
      users (page: Int!, limit: Int!): [User!]!
      user (id: ID!): User!
      generateCaptcha: Captcha!
      refreshToken: AccessToken!
      getMe: User!
      getAllAdmins: [User!]!
      findAllArticle (page: Int!, limit: Int!): [Article!]!
      findArticleBuySlug (slug: String!): [Article]
      findArticleBuyTag (tag: String!): [Article]
      getAllTag: [Tag!]!
      }

      type Mutation {
      register (name: String!, username: String!, password: String!, phone: String!, input: OptionalUserInput, role: UserRole!): Auth!
      login (phone: String!, captcha: String!, uuid: String!): Otp!
      verifyOtp (phone: String!, code: String!): Auth!
      removeUser (userID: Int!): User
      logOut: Response!
      setAvatar (file: Upload!): File!
      removeAvatar: Response!
      changeRole (role: UserRole!, userID: Int!): Response!
      createArticle (input: createArticleInput!, cover: Upload!): Article!
      delArticleCover (id: Int!) : Response!
      removeArticle (id: Int!) : Response!
      updateArticle (articleID: Int!, title: String!, content: String!) : Response!
      addTag (articleID: Int!, title: String!): Response!
      editTag (tagID: Int!, title: String!): Response!
      removeTagArticle (articleID: Int!, tagID: Int!): Response!
      removeTagFromAdmin (tagID: Int!): Response!
      removeAllTag : Response!
      }
`;
