import express from "express";
import { ApolloServer } from "apollo-server-express";
import { schema } from "./graphql/index.schema.js";
import { RootResolvers } from "./graphql/index.resolvers.js";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import configs from "./configs/configs.js";
import { connectToDB } from "./configs/db.js";

const app = express();
app.use(graphqlUploadExpress());
const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers: RootResolvers,
    context: ({ req }) => {
      return { req };
    },
  });

  await server.start();

  server.applyMiddleware({ app, cors: "*", path: "/blog" });

  app.listen(configs.port, () => {
    console.log(`Server Runned Successfully On Port ${configs.port}`);
  });
};

async function run() {
  await startServer();
  await connectToDB();
}

run();
