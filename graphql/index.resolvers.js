import * as userResolvers from "./resolvers/user.resolvers.js";
import * as captchaResolvers from "./resolvers/captcha.resolvers.js";
import * as articleResolvers from "./resolvers/article.resolvers.js";
import * as tagResolvers from "./resolvers/tag.resolvers.js";
import * as likeResolvers from "./resolvers/like.resolvers.js";
import * as bookMarkResolvers from "./resolvers/bookMark.resolvers.js";

export const RootResolvers = {
  Query: {
    users: userResolvers.users,
    user: userResolvers.user,
    generateCaptcha: captchaResolvers.generateCaptcha,
    getMe: userResolvers.getMe,
    refreshToken: userResolvers.refreshToken,
    getAllAdmins: userResolvers.getAllAdmins,
    findAllArticle: articleResolvers.findAllArticle,
    findArticleBuySlug: articleResolvers.findArticleBuySlug,
    findArticleBuyTag: articleResolvers.findArticleBuyTag,
    getAllTag: tagResolvers.getAllTag,
    getAllLikes: likeResolvers.getAllLikes,
    getAllBookMarks: bookMarkResolvers.getAllBookMarks,
  },

  Mutation: {
    register: userResolvers.register,
    login: userResolvers.login,
    verifyOtp: userResolvers.verifyOtp,
    removeUser: userResolvers.removeUser,
    logOut: userResolvers.logOut,
    setAvatar: userResolvers.setAvatar,
    removeAvatar: userResolvers.removeAvatar,
    changeRole: userResolvers.changeRole,
    createArticle: articleResolvers.createArticle,
    updateArticle: articleResolvers.updateArticle,
    removeArticle: articleResolvers.removeArticle,
    delArticleCover: articleResolvers.delArticleCover,
    addTag: tagResolvers.addTag,
    editTag: tagResolvers.editTag,
    removeTagArticle: tagResolvers.removeTagArticle,
    removeTagFromAdmin: tagResolvers.removeTagFromAdmin,
    removeAllTag: tagResolvers.removeAllTag,
    addBookMark: bookMarkResolvers.addBookMark,
    removeBookMark: bookMarkResolvers.removeBookMark,
    addLike: likeResolvers.addLike,
    disLike: likeResolvers.disLike,
  },
};
