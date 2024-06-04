import { sequelize } from "./plugins/db";

sequelize
  .sync({
    alter: true,
    logging: console.log,
  })
  .then(() => {
    console.log("done");
  })
  .catch(console.error);
