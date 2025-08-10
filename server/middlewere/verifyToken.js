const JWT = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.header;

    const getVaildToken = token.split(" ")[1];

    if (!getVaildToken) {
      res.status(401).json({
        success: false,
        message: "unAuthorize user",
      });
    }

    const verifyedToken = await JWT.verify(getVaildToken, JWT_Secret);

    req.user = verifyToken;

    next();
  } catch (error) {
    console.log(error);
  }
};
