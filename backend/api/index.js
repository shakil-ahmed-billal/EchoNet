import {
  __toESM,
  config_default,
  init_esm_shims,
  prisma,
  prisma_default,
  require_client
} from "./chunk-QORS2UPE.js";

// src/index.ts
init_esm_shims();

// src/app.ts
init_esm_shims();
import cors from "cors";
import express18 from "express";
import httpStatus20 from "http-status";

// src/app/middleware/globalErrorHandler.ts
init_esm_shims();

// src/app/errorHelpers/ApiError.ts
init_esm_shims();
var ApiError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var ApiError_default = ApiError;

// src/app/utils/logger.ts
init_esm_shims();
import winston from "winston";
import path from "path";
var { combine, timestamp, json, colorize, printf } = winston.format;
var customFormat = printf(({ level, message, timestamp: timestamp2, stack }) => {
  return `${timestamp2} [${level}]: ${stack || message}`;
});
var isProduction = config_default.env === "production";
var transports = [
  new winston.transports.Console()
];
if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "error.log"),
      level: "error"
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "combined.log")
    })
  );
}
var logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    isProduction ? json() : colorize(),
    isProduction ? json() : customFormat
  ),
  transports
});
var logger_default = logger;

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let code = "INTERNAL_SERVER_ERROR";
  let details = [];
  if (error instanceof ApiError_default) {
    statusCode = error?.statusCode;
    message = error.message;
    details = error?.message ? [{ path: "", message: error?.message }] : [];
    code = error.name || "API_ERROR";
  } else if (error instanceof Error) {
    message = error?.message;
    details = error?.message ? [{ path: "", message: error?.message }] : [];
  }
  logger_default.error(`${req.method} ${req.originalUrl} - ${message}`, {
    stack: error.stack,
    code,
    details
  });
  res.status(statusCode).json({
    success: false,
    message,
    code,
    details,
    stack: config_default.env !== "production" ? error?.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app/middleware/notFound.ts
init_esm_shims();
import httpStatus from "http-status";
var notFound = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found"
      }
    ]
  });
};
var notFound_default = notFound;

// src/app/routes/index.ts
init_esm_shims();
import { Router as Router10 } from "express";

// src/app/module/user/user.route.ts
init_esm_shims();
import express from "express";

// src/app/module/user/user.controller.ts
init_esm_shims();
import httpStatus2 from "http-status";

// src/app/utils/catchAsync.ts
init_esm_shims();
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
var catchAsync_default = catchAsync;

// src/app/utils/sendResponse.ts
init_esm_shims();
var sendResponse = (res, data) => {
  const responseData = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || void 0,
    data: data.data || null || void 0
  };
  res.status(data.statusCode).json(responseData);
};
var sendResponse_default = sendResponse;

// src/app/module/user/user.service.ts
init_esm_shims();

// src/app/utils/QueryBuilder.ts
init_esm_shims();
var QueryBuilder = class {
  constructor(model, queryParams, config = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config;
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10
    };
    this.countQuery = {
      where: {}
    };
  }
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  search() {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions = searchableFields.map((field) => {
        if (field.includes(".")) {
          const parts = field.split(".");
          if (parts.length === 2) {
            const [relation, nestedField] = parts;
            const stringFilter2 = { contains: searchTerm, mode: "insensitive" };
            return { [relation]: { [nestedField]: stringFilter2 } };
          } else if (parts.length === 3) {
            const [relation, nestedRelation, nestedField] = parts;
            const stringFilter2 = { contains: searchTerm, mode: "insensitive" };
            return { [relation]: { some: { [nestedRelation]: { [nestedField]: stringFilter2 } } } };
          }
        }
        const stringFilter = { contains: searchTerm, mode: "insensitive" };
        return { [field]: stringFilter };
      });
      const whereConditions = this.query.where;
      whereConditions.OR = searchConditions;
      const countWhereConditions = this.countQuery.where;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "include"];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === "") return;
      const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);
      if (key.includes(".")) {
        const parts = key.split(".");
        if (filterableFields && !filterableFields.includes(key)) return;
        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }
          queryWhere[relation][nestedField] = this.parseFilterValue(value);
          countQueryWhere[relation][nestedField] = this.parseFilterValue(value);
          return;
        }
        if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          if (!queryWhere[relation]) {
            queryWhere[relation] = { some: {} };
            countQueryWhere[relation] = { some: {} };
          }
          const qSome = queryWhere[relation].some;
          const cSome = countQueryWhere[relation].some;
          if (!qSome[nestedRelation]) {
            qSome[nestedRelation] = {};
            cSome[nestedRelation] = {};
          }
          qSome[nestedRelation][nestedField] = this.parseFilterValue(value);
          cSome[nestedRelation][nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) return;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value);
        countQueryWhere[key] = this.parseRangeFilter(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Math.min(Number(this.queryParams.limit) || 10, 100);
    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const [relation, nestedField] = parts;
        this.query.orderBy = { [relation]: { [nestedField]: sortOrder } };
      } else if (parts.length === 3) {
        const [relation, nestedRelation, nestedField] = parts;
        this.query.orderBy = { [relation]: { [nestedRelation]: { [nestedField]: sortOrder } } };
      } else {
        this.query.orderBy = { [sortBy]: sortOrder };
      }
    } else {
      this.query.orderBy = { [sortBy]: sortOrder };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields;
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam.split(",").map((f) => f.trim());
      this.selectFields = {};
      fieldsArray.forEach((field) => {
        if (this.selectFields) this.selectFields[field] = true;
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) return this;
    this.query.include = {
      ...this.query.include,
      ...relation
    };
    return this;
  }
  where(condition) {
    this.query.where = this.deepMerge(
      this.query.where,
      condition
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      condition
    );
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery),
      this.model.findMany(this.query)
    ]);
    const totalPages = Math.ceil(total / this.limit);
    return {
      data,
      meta: { page: this.page, limit: this.limit, total, totalPages }
    };
  }
  async count() {
    return await this.model.count(this.countQuery);
  }
  getQuery() {
    return this.query;
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && result[key] && typeof result[key] === "object" && !Array.isArray(result[key])) {
        result[key] = this.deepMerge(
          result[key],
          source[key]
        );
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") return Number(value);
    if (Array.isArray(value)) return { in: value.map((item) => this.parseFilterValue(item)) };
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];
      const parsedValue = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : operatorValue;
      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;
        case "in":
        case "notIn":
          rangeQuery[operator] = Array.isArray(operatorValue) ? operatorValue : [parsedValue];
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
};

// src/app/module/user/user.service.ts
var getAllUsers = async (query, currentUserId) => {
  const result = await new QueryBuilder(prisma_default.user, query, {
    searchableFields: ["name", "email"],
    filterableFields: ["role", "isSuspended"]
  }).search().filter().sort().paginate().execute();
  if (!currentUserId) return result;
  const enriched = result.data.map((u) => {
    const isFollowing = u.followers?.some((f) => f.status === "PENDING") ?? false;
    const isFriend = u.followers?.some((f) => f.status === "ACCEPTED") ?? false;
    return { ...u, isFollowing, isFriend, followers: void 0, following: void 0 };
  });
  return { ...result, data: enriched };
};
var getUserById = async (id, currentUserId) => {
  const result = await prisma_default.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          followers: { where: { status: "ACCEPTED" } },
          following: { where: { status: "ACCEPTED" } },
          posts: true
        }
      },
      followers: currentUserId ? {
        where: { followerId: currentUserId },
        select: { status: true }
      } : false,
      following: currentUserId ? {
        where: { followingId: currentUserId },
        select: { status: true }
      } : false
    }
  });
  if (!result) return null;
  let isFollowing = false;
  let isFriend = false;
  let followStatus = "NONE";
  if (result.followers && result.followers.length > 0) {
    followStatus = result.followers[0].status;
    if (result.followers[0].status === "ACCEPTED") {
      isFollowing = true;
      if (result.following && result.following.length > 0 && result.following[0].status === "ACCEPTED") {
        isFriend = true;
      }
    }
  }
  return {
    ...result,
    isFollowing,
    isFriend,
    followStatus,
    followers: void 0,
    following: void 0
  };
};
var updateUser = async (id, payload) => {
  const result = await prisma_default.user.update({
    where: { id },
    data: payload
  });
  return result;
};
var suspendUser = async (id) => {
  const result = await prisma_default.user.update({
    where: { id },
    data: { isSuspended: true }
  });
  return result;
};
var UserServices = {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser
};

// src/app/module/user/user.controller.ts
var getAllUsers2 = catchAsync_default(async (req, res) => {
  const currentUserId = req.user?.id;
  const result = await UserServices.getAllUsers(req.query, currentUserId);
  sendResponse_default(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result
  });
});
var getUserById2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const currentUserId = req.user?.id;
  const result = await UserServices.getUserById(id, currentUserId);
  sendResponse_default(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "User retrieved successfully",
    data: result
  });
});
var updateUser2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const loggedInUserId = req.user.id;
  const role = req.user.role;
  if (loggedInUserId !== id && role !== "ADMIN") {
    throw new ApiError_default(httpStatus2.FORBIDDEN, "You are not authorized to edit this profile");
  }
  const result = await UserServices.updateUser(id, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var suspendUser2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const result = await UserServices.suspendUser(id);
  sendResponse_default(res, {
    statusCode: httpStatus2.OK,
    success: true,
    message: "User suspended successfully",
    data: result
  });
});
var UserControllers = {
  getAllUsers: getAllUsers2,
  getUserById: getUserById2,
  updateUser: updateUser2,
  suspendUser: suspendUser2
};

// src/app/middleware/auth.ts
init_esm_shims();
import httpStatus3 from "http-status";
import { fromNodeHeaders } from "better-auth/node";

// src/app/lib/auth.ts
init_esm_shims();
var import_client = __toESM(require_client(), 1);
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";

// src/app/lib/email.ts
init_esm_shims();
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: config_default.smtp.host,
  port: config_default.smtp.port,
  secure: config_default.smtp.port === 465,
  auth: {
    user: config_default.smtp.user,
    pass: config_default.smtp.pass
  }
});
var emailHelper = {
  sendResetPasswordEmail: async (email, otp) => {
    try {
      await transporter.sendMail({
        from: `"EchoNet Security" <${config_default.smtp.from}>`,
        to: email,
        subject: "Reset your EchoNet Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
            <p style="color: #555; font-size: 16px;">We received a request to reset your EchoNet password. Here is your 6-digit confirmation code:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 25px; background: #f4f4f4; color: #333; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `
      });
      logger_default.info(`Password reset OTP sent to ${email}`);
    } catch (error) {
      logger_default.error(`Failed to send password reset email to ${email}:`, error);
    }
  },
  sendVerificationEmail: async (email, otp) => {
    try {
      await transporter.sendMail({
        from: `"EchoNet Security" <${config_default.smtp.from}>`,
        to: email,
        subject: "Verify your EchoNet Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
            <p style="color: #555; font-size: 16px;">Welcome to EchoNet! Please use the following 6-digit code to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 15px 25px; background: #f4f4f4; color: #333; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #555; font-size: 14px;">This code will expire shortly.</p>
          </div>
        `
      });
      logger_default.info(`Verification OTP sent to ${email}`);
    } catch (error) {
      logger_default.error(`Failed to send verification email to ${email}:`, error);
    }
  }
};

// src/app/lib/auth.ts
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  secret: config_default.jwt_secret,
  baseURL: "http://localhost:8000",
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await emailHelper.sendVerificationEmail(email, otp);
        } else if (type === "forget-password") {
          await emailHelper.sendResetPasswordEmail(email, otp);
        }
      }
    })
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      mapProfileToUser: (profile) => ({
        role: import_client.Role.USER,
        isDeleted: false,
        avatarUrl: profile.picture,
        image: profile.picture
      })
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      mapProfileToUser: (profile) => ({
        role: import_client.Role.USER,
        isDeleted: false,
        avatarUrl: profile.picture?.data?.url || (typeof profile.picture === "string" ? profile.picture : ""),
        image: profile.picture?.data?.url || (typeof profile.picture === "string" ? profile.picture : "")
      })
    }
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: import_client.Role.USER },
      isDeleted: { type: "boolean", required: true, defaultValue: false },
      isSuspended: { type: "boolean", required: true, defaultValue: false },
      avatarUrl: { type: "string", required: false }
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
      // 5 minutes
    }
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    disableCSRFCheck: true
    // Allow requests without Origin header (Postman, mobile apps, etc.)
  }
});

// src/app/middleware/auth.ts
import jwt from "jsonwebtoken";
var auth2 = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      let sessionUser = null;
      let session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
      });
      if (session?.user) {
        sessionUser = session.user;
      }
      if (!sessionUser) {
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
          token = req.headers.authorization.split(" ")[1];
        }
        if (token) {
          try {
            const decoded = jwt.verify(token, config_default.jwt_secret);
            sessionUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
          } catch (e) {
          }
        }
      }
      if (!sessionUser) {
        const token = req.cookies["better-auth.session_token"];
        if (token) {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
          });
          if (dbSession && !dbSession.user.isDeleted && !dbSession.user.isSuspended) {
            sessionUser = dbSession.user;
          }
        }
      }
      if (!sessionUser) {
        throw new ApiError_default(httpStatus3.UNAUTHORIZED, "You are not authorized");
      }
      const user = sessionUser;
      req.user = user;
      if (user.isSuspended) {
        throw new ApiError_default(httpStatus3.FORBIDDEN, "Your account is suspended");
      }
      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new ApiError_default(httpStatus3.FORBIDDEN, "You do not have permission to access this resource");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var optionalAuth = async (req, res, next) => {
  try {
    let sessionUser = null;
    let session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (session?.user) {
      sessionUser = session.user;
    }
    if (!sessionUser) {
      let token = req.cookies?.accessToken;
      if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, config_default.jwt_secret);
          sessionUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
        } catch (e) {
        }
      }
    }
    if (!sessionUser) {
      const token = req.cookies["better-auth.session_token"];
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { token },
          include: { user: true }
        });
        if (dbSession && !dbSession.user.isDeleted && !dbSession.user.isSuspended) {
          sessionUser = dbSession.user;
        }
      }
    }
    if (sessionUser) {
      const user = await prisma.user.findUnique({
        where: { email: sessionUser.email }
      });
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
var auth_default = auth2;

// src/app/module/user/user.route.ts
var import_client2 = __toESM(require_client(), 1);
var router = express.Router();
router.get("/", optionalAuth, UserControllers.getAllUsers);
router.get("/:id", optionalAuth, UserControllers.getUserById);
router.patch("/:id", auth_default(import_client2.Role.USER, import_client2.Role.ADMIN, import_client2.Role.MODERATOR), UserControllers.updateUser);
router.patch("/:id/suspend", auth_default(import_client2.Role.ADMIN, import_client2.Role.MODERATOR), UserControllers.suspendUser);
var UserRoutes = router;

// src/app/module/auth/auth.route.ts
init_esm_shims();
import { Router } from "express";

// src/app/module/auth/auth.controller.ts
init_esm_shims();
import httpStatus4 from "http-status";

// src/app/module/auth/auth.service.ts
init_esm_shims();
import status from "http-status";

// src/app/utils/token.ts
init_esm_shims();

// src/app/utils/jwt.ts
init_esm_shims();
import jwt2 from "jsonwebtoken";
var createToken = (payload, secret, options) => {
  return jwt2.sign(payload, secret, options);
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt2.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error };
  }
};
var jwtUtils = { createToken, verifyToken };

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  return jwtUtils.createToken(
    payload,
    config_default.jwt_secret,
    { expiresIn: config_default.jwt_access_expires_in }
  );
};
var getRefreshToken = (payload) => {
  return jwtUtils.createToken(
    payload,
    config_default.jwt_secret,
    { expiresIn: config_default.jwt_refresh_expires_in }
  );
};
var setAccessTokenCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: config_default.env === "production",
    sameSite: config_default.env === "production" ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1e3,
    // 2 hours
    path: "/"
  });
};
var setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: config_default.env === "production",
    sameSite: config_default.env === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    path: "/"
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  res.cookie("better-auth.session_token", token, {
    httpOnly: true,
    secure: config_default.env === "production",
    sameSite: config_default.env === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    path: "/"
  });
};
var tokenUtils = { getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie };

// src/app/module/auth/auth.service.ts
var registerUser = async (payload) => {
  const { name, email, password } = payload;
  const response = await auth.api.signUpEmail({
    body: { name, email, password: password || "" },
    asResponse: true
  });
  const data = await response.json();
  if (!response.ok || !data.user) {
    throw new ApiError_default(status.BAD_REQUEST, data.message || "Failed to register user");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email
  });
  const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  return { ...data, accessToken, refreshToken, __cookies: cookies };
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  let response;
  let data;
  try {
    response = await auth.api.signInEmail({
      body: { email, password: password || "" },
      asResponse: true
    });
    data = await response.json();
  } catch (error) {
    throw new ApiError_default(status.UNAUTHORIZED, error?.message || "Invalid credentials");
  }
  if (!response.ok || !data || !data.user) {
    throw new ApiError_default(status.UNAUTHORIZED, data?.message || "Invalid credentials");
  }
  const user = await prisma.user.findUnique({
    where: { id: data.user.id }
  });
  if (user?.isSuspended) {
    throw new ApiError_default(status.FORBIDDEN, "User is suspended");
  }
  if (user?.isDeleted) {
    throw new ApiError_default(status.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email
  });
  const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  return { ...data, accessToken, refreshToken, __cookies: cookies };
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
  });
  return result;
};
var getMe = async (headers) => {
  const sessionData = await auth.api.getSession({ headers });
  if (!sessionData || !sessionData.session || !sessionData.user) {
    throw new ApiError_default(status.NOT_FOUND, "Session not found");
  }
  if (/* @__PURE__ */ new Date() > sessionData.session.expiresAt) {
    throw new ApiError_default(status.NOT_FOUND, "Session expired");
  }
  const { user, session } = sessionData;
  return { session, user };
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
  });
  if (!session) {
    throw new ApiError_default(status.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true
    },
    headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var getNewToken = async (refreshToken, headers) => {
  const sessionData = await auth.api.getSession({ headers });
  if (!sessionData || !sessionData.session) {
    throw new ApiError_default(status.UNAUTHORIZED, "Invalid session token");
  }
  const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config_default.jwt_secret);
  if (!verifiedRefreshToken.success) {
    throw new ApiError_default(status.UNAUTHORIZED, "Invalid refresh token");
  }
  const data = verifiedRefreshToken.data;
  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email
  });
  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: sessionData.session.token
  };
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: { email, otp }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });
  }
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email }
  });
  if (!isUserExist) {
    throw new ApiError_default(status.NOT_FOUND, "User not found");
  }
  if (isUserExist.isSuspended) {
    throw new ApiError_default(status.FORBIDDEN, "User is suspended");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: { email }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email }
  });
  if (!isUserExist) {
    throw new ApiError_default(status.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: { email, otp, password: newPassword }
  });
  await prisma.session.deleteMany({
    where: { userId: isUserExist.id }
  });
};
var googleLoginSuccess = async (session) => {
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email
  });
  return { accessToken, refreshToken };
};
var AuthService = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getNewToken,
  changePassword,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLoginSuccess
};

// src/app/utils/cookie.ts
init_esm_shims();
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies?.[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/app/module/auth/auth.controller.ts
var registerUser2 = catchAsync_default(async (req, res) => {
  const url = new URL("/api/auth/sign-up/email", "http://localhost:8000");
  const betterAuthReq = new Request(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "http://localhost:8000", "Host": "localhost:8000" },
    body: JSON.stringify(req.body)
  });
  const betterAuthRes = await auth.handler(betterAuthReq);
  const data = await betterAuthRes.clone().json();
  if (!betterAuthRes.ok) {
    return sendResponse_default(res, { statusCode: betterAuthRes.status, success: false, message: data.message || "Registration failed" });
  }
  const { accessToken, refreshToken } = await AuthService.googleLoginSuccess({ user: data.user });
  let token = data.token || "";
  if (betterAuthRes.headers.has("set-cookie")) {
    const cookies = betterAuthRes.headers.getSetCookie();
    for (const cookie of cookies) {
      const match = cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  sendResponse_default(res, {
    statusCode: httpStatus4.CREATED,
    success: true,
    message: "User registered successfully",
    data: { token, accessToken, refreshToken, user: data.user }
  });
});
var loginUser2 = catchAsync_default(async (req, res) => {
  const url = new URL("/api/auth/sign-in/email", "http://localhost:8000");
  const betterAuthReq = new Request(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "http://localhost:8000", "Host": "localhost:8000" },
    body: JSON.stringify(req.body)
  });
  const betterAuthRes = await auth.handler(betterAuthReq);
  const data = await betterAuthRes.clone().json();
  if (!betterAuthRes.ok) {
    return sendResponse_default(res, { statusCode: betterAuthRes.status, success: false, message: data.message || "Invalid credentials" });
  }
  const { accessToken, refreshToken } = await AuthService.googleLoginSuccess({ user: data.user });
  let token = data.token || "";
  if (betterAuthRes.headers.has("set-cookie")) {
    const cookies = betterAuthRes.headers.getSetCookie();
    for (const cookie of cookies) {
      const match = cookie.match(/better-auth\.session_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "User logged in successfully",
    data: { token, accessToken, refreshToken, user: data.user }
  });
});
var logoutUser2 = catchAsync_default(async (req, res) => {
  const betterAuthSessionToken = req.cookies?.["better-auth.session_token"] || "";
  const result = await AuthService.logoutUser(betterAuthSessionToken);
  const isProd = config_default.env === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/"
  };
  CookieUtils.clearCookie(res, "accessToken", cookieOptions);
  CookieUtils.clearCookie(res, "refreshToken", cookieOptions);
  CookieUtils.clearCookie(res, "better-auth.session_token", cookieOptions);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "User logged out successfully",
    data: result
  });
});
var getMe2 = catchAsync_default(async (req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) headers.append(key, value);
  });
  const token = req.cookies?.["better-auth.session_token"];
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const result = await AuthService.getMe(headers);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "User session retrieved successfully",
    data: result
  });
});
var forgetPassword2 = catchAsync_default(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Password reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync_default(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Password reset successfully"
  });
});
var changePassword2 = catchAsync_default(async (req, res) => {
  const betterAuthSessionToken = req.cookies?.["better-auth.session_token"] || "";
  const result = await AuthService.changePassword(req.body, betterAuthSessionToken);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var getNewToken2 = catchAsync_default(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || "";
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) headers.append(key, value);
  });
  const result = await AuthService.getNewToken(refreshToken, headers);
  const { accessToken, refreshToken: newRefreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result
  });
});
var verifyEmail2 = catchAsync_default(async (req, res) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);
  sendResponse_default(res, {
    statusCode: httpStatus4.OK,
    success: true,
    message: "Email verified successfully"
  });
});
var googleLogin = catchAsync_default(async (req, res) => {
  const redirectPath = req.query.redirect || "/";
  const callbackURL = `http://localhost:8000/api/v1/auth/google/success?redirect=${encodeURIComponent(redirectPath)}`;
  const url = new URL("/api/auth/sign-in/social", "http://localhost:8000");
  const betterAuthReq = new Request(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": req.headers.cookie || "",
      "Origin": "http://localhost:8000",
      "Host": "localhost:8000"
    },
    body: JSON.stringify({ provider: "google", callbackURL })
  });
  const betterAuthRes = await auth.handler(betterAuthReq);
  betterAuthRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      res.append("Set-Cookie", value);
    }
  });
  const location = betterAuthRes.headers.get("location");
  if (location) {
    return res.redirect(location);
  }
  return res.status(500).json({ message: "Failed to initiate Google OAuth" });
});
var googleLoginSuccess2 = catchAsync_default(async (req, res) => {
  const redirectPath = req.query.redirect || "/";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`http://localhost:3000/login?error=oauth_failed`);
  }
  const headers = new Headers();
  if (req.headers.cookie) {
    headers.set("cookie", req.headers.cookie);
  }
  let sessionData = null;
  try {
    sessionData = await auth.api.getSession({ headers });
  } catch (e) {
    console.error("Failed to get BetterAuth session:", e);
  }
  if (!sessionData || !sessionData.user) {
    return res.redirect(`http://localhost:3000/login?error=no_session_found`);
  }
  const { accessToken, refreshToken } = await AuthService.googleLoginSuccess(sessionData);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  res.redirect(`http://localhost:3000${redirectPath}`);
});
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  logoutUser: logoutUser2,
  getMe: getMe2,
  forgetPassword: forgetPassword2,
  resetPassword: resetPassword2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  changePassword: changePassword2,
  getNewToken: getNewToken2,
  verifyEmail: verifyEmail2
};

// src/app/module/auth/auth.route.ts
var router2 = Router();
router2.post("/register", AuthController.registerUser);
router2.post("/login", AuthController.loginUser);
router2.get("/me", auth_default(), AuthController.getMe);
router2.post("/refresh-token", AuthController.getNewToken);
router2.post("/change-password", auth_default(), AuthController.changePassword);
router2.post("/logout", AuthController.logoutUser);
router2.post("/verify-email", AuthController.verifyEmail);
router2.post("/forget-password", AuthController.forgetPassword);
router2.post("/reset-password", AuthController.resetPassword);
router2.get("/login/google", AuthController.googleLogin);
router2.get("/google/success", AuthController.googleLoginSuccess);
var AuthRoutes = router2;

// src/app/module/post/post.route.ts
init_esm_shims();
import express2 from "express";

// src/app/module/post/post.controller.ts
init_esm_shims();
import httpStatus5 from "http-status";

// src/app/module/post/post.service.ts
init_esm_shims();
var import_client3 = __toESM(require_client(), 1);

// src/app/lib/cloudinary.ts
init_esm_shims();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: config_default.cloudinary_cloud_name,
  api_key: config_default.cloudinary_api_key,
  api_secret: config_default.cloudinary_api_secret
});
var uploadMedia = async (file, folder = "echonet") => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto"
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    throw error;
  }
};
var deleteMedia = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
  }
};

// src/app/module/post/post.service.ts
import fs from "fs";

// src/app/module/hashtag/hashtag.service.ts
init_esm_shims();
var upsertHashtags = async (content, postId) => {
  const hashtags = content.match(/#(\w+)/g);
  await prisma_default.postHashtag.deleteMany({
    where: { postId }
  });
  if (!hashtags) return;
  const uniqueTags = Array.from(new Set(hashtags.map((tag) => tag.slice(1).toLowerCase())));
  for (const tag of uniqueTags) {
    const hashtag = await prisma_default.hashtag.upsert({
      where: { tag },
      update: { postCount: { increment: 1 } },
      create: { tag, postCount: 1 }
    });
    await prisma_default.postHashtag.create({
      data: {
        postId,
        hashtagId: hashtag.id
      }
    });
  }
};
var getTrendingHashtags = async (limit = 10) => {
  const result = await prisma_default.hashtag.findMany({
    orderBy: { postCount: "desc" },
    take: limit
  });
  return result;
};
var HashtagServices = {
  upsertHashtags,
  getTrendingHashtags
};

// src/app/module/post/post.service.ts
var createPost = async (authorId, payload, files) => {
  const uploadedMedia = [];
  try {
    console.log("PostServices.createPost called with authorId:", authorId, "payload:", payload);
    if (files && files.length > 0) {
      for (const file of files) {
        console.log("Uploading file to Cloudinary:", file.path);
        const result = await uploadMedia(file.path);
        uploadedMedia.push(result);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    console.log("Creating post in database with mediaUrls:", uploadedMedia.map((m) => m.url));
    const post = await prisma_default.post.create({
      data: {
        authorId,
        content: payload.content,
        mediaUrls: uploadedMedia.map((m) => m.url)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });
    console.log("Post created successfully:", post.id);
    if (payload.content) {
      await HashtagServices.upsertHashtags(payload.content, post.id);
    }
    return post;
  } catch (error) {
    console.error("PostServices.createPost ERROR:", error);
    if (uploadedMedia.length > 0) {
      console.log("Rolling back Cloudinary uploads due to DB error.");
      for (const media of uploadedMedia) {
        await deleteMedia(media.public_id);
      }
    }
    if (files) {
      for (const file of files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    throw error;
  }
};
var getScoredFeed = async (userId, limit = 20, cursor) => {
  const following = await prisma_default.follow.findMany({
    where: { followerId: userId, status: "ACCEPTED" },
    select: { followingId: true }
  });
  const followingIds = following.map((f) => f.followingId);
  const authorIds = [...followingIds, userId];
  const seventyTwoHoursAgo = /* @__PURE__ */ new Date();
  seventyTwoHoursAgo.setHours(seventyTwoHoursAgo.getHours() - 72);
  const posts = await prisma_default.post.findMany({
    where: {
      authorId: { in: authorIds },
      status: "ACTIVE",
      createdAt: { gte: seventyTwoHoursAgo },
      deletedAt: null
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true }
      },
      _count: {
        select: {
          reactions: true,
          comments: true,
          savedBy: true
        }
      },
      reactions: {
        where: { userId },
        select: { id: true, type: true }
      },
      savedBy: {
        where: { userId },
        select: { id: true }
      }
    }
  });
  const now = /* @__PURE__ */ new Date();
  const scoredPosts = posts.map((post) => {
    const hoursSince = (now.getTime() - post.createdAt.getTime()) / (1e3 * 60 * 60);
    const recentness = Math.max(0, 48 - hoursSince);
    const timePenalty = hoursSince * 0.5;
    const isSelf = post.authorId === userId;
    const relBoost = isSelf ? 1 : 1.3;
    const score = (post._count.reactions * 2 + post._count.comments * 3 + post._count.savedBy * 5 + recentness) * relBoost - timePenalty;
    return {
      ...post,
      score,
      isLiked: post.reactions.length > 0,
      isSaved: post.savedBy.length > 0,
      reactions: void 0,
      savedBy: void 0
    };
  });
  scoredPosts.sort((a, b) => b.score - a.score);
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = scoredPosts.findIndex((p) => p.id === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  const paginatedPosts = scoredPosts.slice(startIndex, startIndex + limit);
  const hasNextPage = scoredPosts.length > startIndex + limit;
  const nextCursor = hasNextPage ? paginatedPosts[paginatedPosts.length - 1].id : null;
  return {
    posts: paginatedPosts,
    nextCursor
  };
};
var getAllPosts = async (limit = 10, cursor, userId, discover = false, authorId) => {
  if (userId && !discover && !authorId) {
    return getScoredFeed(userId, limit, cursor);
  }
  let where = { deletedAt: null };
  if (authorId) {
    where.authorId = authorId;
  } else if (userId && discover) {
    const following = await prisma_default.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const followingIds = following.map((f) => f.followingId);
    where.authorId = { notIn: [...followingIds, userId] };
  }
  where.status = "ACTIVE";
  const result = await prisma_default.post.findMany({
    where,
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : void 0,
    include: {
      author: true,
      _count: {
        select: {
          comments: true,
          reactions: true,
          savedBy: true
        }
      },
      reactions: userId ? {
        where: { userId },
        select: { id: true, type: true }
      } : false,
      savedBy: userId ? {
        where: { userId },
        select: { id: true }
      } : false
    },
    orderBy: { createdAt: "desc" }
  });
  const hasNextPage = result.length > limit;
  const posts = hasNextPage ? result.slice(0, -1) : result;
  const mappedPosts = posts.map((post) => ({
    ...post,
    isLiked: userId ? post.reactions && post.reactions.length > 0 : false,
    isSaved: userId ? post.savedBy && post.savedBy.length > 0 : false,
    reactions: void 0,
    savedBy: void 0
  }));
  const nextCursor = hasNextPage ? posts[posts.length - 1].id : null;
  return {
    posts: mappedPosts,
    nextCursor
  };
};
var updatePostStatus = async (id, status2) => {
  const result = await prisma_default.post.update({
    where: { id },
    data: { status: status2 }
  });
  return result;
};
var getFlaggedPosts = async (query) => {
  return await new QueryBuilder(prisma_default.post, query, {
    searchableFields: ["content", "author.name"],
    filterableFields: ["status"]
  }).search().filter().where({ status: import_client3.PostStatus.FLAGGED, deletedAt: null }).sort().paginate().include({
    author: { select: { id: true, name: true, avatarUrl: true } },
    _count: { select: { comments: true, reactions: true } }
  }).execute();
};
var updatePost = async (id, authorId, payload) => {
  const post = await prisma_default.post.findUnique({ where: { id } });
  if (!post || post.authorId !== authorId) {
    throw new Error("Unauthorized or post not found");
  }
  const result = await prisma_default.post.update({
    where: { id },
    data: {
      content: payload.content,
      mediaUrls: payload.mediaUrls
    },
    include: { author: true }
  });
  if (payload.content) {
    await HashtagServices.upsertHashtags(payload.content, id);
  }
  return result;
};
var deletePost = async (id, authorId, isAdmin = false) => {
  const post = await prisma_default.post.findUnique({ where: { id } });
  if (!post) {
    throw new Error("Post not found");
  }
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Unauthorized");
  }
  const result = await prisma_default.post.delete({
    where: { id }
  });
  return result;
};
var PostServices = {
  createPost,
  getAllPosts,
  updatePostStatus,
  getFlaggedPosts,
  updatePost,
  deletePost
};

// src/app/module/post/post.controller.ts
var import_client4 = __toESM(require_client(), 1);
var createPost2 = catchAsync_default(async (req, res) => {
  console.log("PostControllers.createPost - Request Body:", req.body);
  console.log("PostControllers.createPost - Files:", req.files?.length || 0);
  const authorId = req.user?.id;
  console.log("PostControllers.createPost - User ID:", authorId);
  const result = await PostServices.createPost(authorId, req.body, req.files);
  sendResponse_default(res, {
    statusCode: httpStatus5.CREATED,
    success: true,
    message: "Post created successfully",
    data: result
  });
});
var getAllPosts2 = catchAsync_default(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;
  const userId = req.user?.id;
  const discover = req.query.discover === "true";
  const authorId = req.query.authorId;
  const status2 = req.query.status;
  if (status2 === "FLAGGED") {
    const flaggedPosts = await PostServices.getFlaggedPosts(req.query);
    sendResponse_default(res, {
      statusCode: httpStatus5.OK,
      success: true,
      message: "Flagged posts retrieved successfully",
      data: flaggedPosts
    });
    return;
  }
  const result = await PostServices.getAllPosts(limit, cursor, userId, discover, authorId);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: result
  });
});
var updatePostStatus2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const { status: status2 } = req.body;
  const result = await PostServices.updatePostStatus(id, status2);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Post status updated successfully",
    data: result
  });
});
var updatePost2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const authorId = req.user?.id;
  const result = await PostServices.updatePost(id, authorId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Post updated successfully",
    data: result
  });
});
var deletePost2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const authorId = req.user?.id;
  const isAdmin = req.user?.role === import_client4.Role.ADMIN;
  const result = await PostServices.deletePost(id, authorId, isAdmin);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Post deleted successfully",
    data: result
  });
});
var PostControllers = {
  createPost: createPost2,
  getAllPosts: getAllPosts2,
  updatePostStatus: updatePostStatus2,
  updatePost: updatePost2,
  deletePost: deletePost2
};

// src/app/module/post/post.route.ts
var import_client5 = __toESM(require_client(), 1);

// src/app/middleware/multer.ts
init_esm_shims();
import multer from "multer";
import path2 from "path";
import fs2 from "fs";
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path2.join(process.cwd(), "uploads");
    if (!fs2.existsSync(uploadPath)) {
      fs2.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path2.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and MP4/MOV videos are allowed."), false);
  }
};
var upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  }
});

// src/app/module/post/post.route.ts
var router3 = express2.Router();
router3.post(
  "/",
  auth_default(import_client5.Role.USER, import_client5.Role.ADMIN, import_client5.Role.MODERATOR),
  upload.array("media", 10),
  PostControllers.createPost
);
router3.get("/", optionalAuth, PostControllers.getAllPosts);
router3.patch("/:id", auth_default(import_client5.Role.USER, import_client5.Role.ADMIN, import_client5.Role.MODERATOR), PostControllers.updatePost);
router3.patch("/:id/status", auth_default(import_client5.Role.ADMIN, import_client5.Role.MODERATOR), PostControllers.updatePostStatus);
router3.delete("/:id", auth_default(import_client5.Role.ADMIN, import_client5.Role.MODERATOR, import_client5.Role.USER), PostControllers.deletePost);
var PostRoutes = router3;

// src/app/module/comment/comment.route.ts
init_esm_shims();
import express3 from "express";

// src/app/module/comment/comment.controller.ts
init_esm_shims();
import httpStatus6 from "http-status";

// src/app/module/comment/comment.service.ts
init_esm_shims();
var createComment = async (authorId, postId, payload) => {
  const result = await prisma_default.comment.create({
    data: {
      authorId,
      postId,
      content: payload.content,
      parentId: payload.parentId
    }
  });
  return result;
};
var getCommentsForPost = async (postId) => {
  const result = await prisma_default.comment.findMany({
    where: {
      postId,
      parentId: null
      // start with top-level comments
    },
    include: {
      author: true,
      _count: {
        select: {
          likes: true,
          replies: true
        }
      },
      replies: {
        include: {
          author: true,
          _count: {
            select: {
              likes: true,
              replies: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var deleteComment = async (id) => {
  const result = await prisma_default.comment.delete({
    where: { id }
  });
  return result;
};
var CommentServices = {
  createComment,
  getCommentsForPost,
  deleteComment
};

// src/app/module/comment/comment.controller.ts
var createComment2 = catchAsync_default(async (req, res) => {
  const authorId = req.user?.id;
  const postId = req.params.postId;
  const result = await CommentServices.createComment(authorId, postId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus6.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result
  });
});
var getCommentsForPost2 = catchAsync_default(async (req, res) => {
  const postId = req.params.postId;
  const result = await CommentServices.getCommentsForPost(postId);
  sendResponse_default(res, {
    statusCode: httpStatus6.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result
  });
});
var deleteComment2 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const result = await CommentServices.deleteComment(id);
  sendResponse_default(res, {
    statusCode: httpStatus6.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result
  });
});
var CommentControllers = {
  createComment: createComment2,
  getCommentsForPost: getCommentsForPost2,
  deleteComment: deleteComment2
};

// src/app/module/comment/comment.route.ts
var import_client6 = __toESM(require_client(), 1);
var router4 = express3.Router();
router4.post("/post/:postId", auth_default(import_client6.Role.USER, import_client6.Role.ADMIN, import_client6.Role.MODERATOR), CommentControllers.createComment);
router4.get("/post/:postId", CommentControllers.getCommentsForPost);
router4.delete("/:id", auth_default(import_client6.Role.USER, import_client6.Role.ADMIN, import_client6.Role.MODERATOR), CommentControllers.deleteComment);
var CommentRoutes = router4;

// src/app/module/like/like.route.ts
init_esm_shims();
import express4 from "express";

// src/app/module/like/like.controller.ts
init_esm_shims();
import httpStatus7 from "http-status";

// src/app/module/like/like.service.ts
init_esm_shims();
var toggleLike = async (userId, payload) => {
  const existingLike = await prisma_default.like.findFirst({
    where: {
      userId,
      postId: payload.postId || null,
      commentId: payload.commentId || null
    }
  });
  if (existingLike) {
    await prisma_default.like.delete({ where: { id: existingLike.id } });
    if (payload.postId) {
      await prisma_default.post.update({ where: { id: payload.postId }, data: { likesCount: { decrement: 1 } } });
    } else if (payload.commentId) {
      await prisma_default.comment.update({ where: { id: payload.commentId }, data: { likesCount: { decrement: 1 } } });
    }
    return { liked: false };
  } else {
    await prisma_default.like.create({
      data: {
        userId,
        postId: payload.postId || null,
        commentId: payload.commentId || null
      }
    });
    if (payload.postId) {
      await prisma_default.post.update({ where: { id: payload.postId }, data: { likesCount: { increment: 1 } } });
    } else if (payload.commentId) {
      await prisma_default.comment.update({ where: { id: payload.commentId }, data: { likesCount: { increment: 1 } } });
    }
    return { liked: true };
  }
};
var LikeServices = {
  toggleLike
};

// src/app/module/like/like.controller.ts
var toggleLike2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const result = await LikeServices.toggleLike(userId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus7.OK,
    success: true,
    message: result.liked ? "Liked successfully" : "Unliked successfully",
    data: result
  });
});
var LikeControllers = {
  toggleLike: toggleLike2
};

// src/app/module/like/like.route.ts
var import_client7 = __toESM(require_client(), 1);
var router5 = express4.Router();
router5.post("/toggle", auth_default(import_client7.Role.USER, import_client7.Role.ADMIN, import_client7.Role.MODERATOR), LikeControllers.toggleLike);
var LikeRoutes = router5;

// src/app/module/follow/follow.route.ts
init_esm_shims();
import { Router as Router2 } from "express";

// src/app/module/follow/follow.controller.ts
init_esm_shims();
import httpStatus9 from "http-status";

// src/app/module/follow/follow.service.ts
init_esm_shims();
import httpStatus8 from "http-status";

// src/app/module/notification/notification.service.ts
init_esm_shims();

// src/app/lib/redis.ts
init_esm_shims();
import { createClient } from "redis";
var redisClient = config_default.redis_url ? createClient({ url: config_default.redis_url }) : null;
if (redisClient) {
  redisClient.on("error", (err) => logger_default.error("Redis Client Error", err));
}
var redis_default = redisClient;

// src/app/lib/socket.ts
init_esm_shims();
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient as createClient2 } from "redis";
var io;
var getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// src/app/module/notification/notification.service.ts
var createNotification = async (data) => {
  const result = await prisma_default.notification.create({
    data
  });
  if (redis_default) {
    const cacheKey = `notifications:unread_count:${data.userId}`;
    await redis_default.del(cacheKey);
  }
  try {
    const io2 = getIO();
    io2.to(data.userId).emit("notification", result);
  } catch (error) {
  }
  return result;
};
var getUserNotifications = async (userId) => {
  if (!userId) return [];
  const result = await prisma_default.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var getUnreadCount = async (userId) => {
  if (!userId) return 0;
  const cacheKey = `notifications:unread_count:${userId}`;
  if (redis_default) {
    const cachedCount = await redis_default.get(cacheKey);
    if (cachedCount !== null) {
      return parseInt(cachedCount);
    }
  }
  const count = await prisma_default.notification.count({
    where: { userId, isRead: false }
  });
  if (redis_default) {
    await redis_default.setEx(cacheKey, 3600, count.toString());
  }
  return count;
};
var markAsRead = async (id, userId) => {
  if (!id || !userId) return null;
  const result = await prisma_default.notification.update({
    where: { id },
    data: { isRead: true }
  });
  if (redis_default) {
    const cacheKey = `notifications:unread_count:${userId}`;
    await redis_default.del(cacheKey);
  }
  return result;
};
var NotificationServices = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead
};

// src/app/module/follow/follow.service.ts
var import_client8 = __toESM(require_client(), 1);
var followUser = async (followerId, followingId) => {
  if (followerId === followingId) {
    throw new ApiError_default(httpStatus8.BAD_REQUEST, "You cannot follow yourself");
  }
  const targetUser = await prisma_default.user.findUnique({
    where: { id: followingId },
    select: { isPrivate: true, name: true }
  });
  if (!targetUser) {
    throw new ApiError_default(httpStatus8.NOT_FOUND, "Target user not found");
  }
  const existing = await prisma_default.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } }
  });
  if (existing) {
    if (existing.status === "ACCEPTED") {
      return existing;
    }
    return existing;
  }
  const status2 = targetUser.isPrivate ? "PENDING" : "ACCEPTED";
  const result = await prisma_default.follow.create({
    data: {
      followerId,
      followingId,
      status: status2
    }
  });
  const follower = await prisma_default.user.findUnique({ where: { id: followerId } });
  await NotificationServices.createNotification({
    userId: followingId,
    type: status2 === "ACCEPTED" ? import_client8.NotificationType.FOLLOW : import_client8.NotificationType.FOLLOW_REQUEST,
    referenceId: followerId,
    message: status2 === "ACCEPTED" ? `${follower?.name} started following you.` : `${follower?.name} sent you a follow request.`
  });
  return result;
};
var acceptFollow = async (receiverId, senderId) => {
  const result = await prisma_default.follow.update({
    where: {
      followerId_followingId: {
        followerId: senderId,
        followingId: receiverId
      }
    },
    data: {
      status: "ACCEPTED"
    }
  });
  const receiver = await prisma_default.user.findUnique({ where: { id: receiverId } });
  await NotificationServices.createNotification({
    userId: senderId,
    type: import_client8.NotificationType.FRIEND_ACCEPT,
    referenceId: receiverId,
    message: `${receiver?.name} accepted your friend request.`
  });
  return result;
};
var unfollowUser = async (userId1, userId2) => {
  const result = await prisma_default.follow.deleteMany({
    where: {
      OR: [
        { followerId: userId1, followingId: userId2 },
        { followerId: userId2, followingId: userId1 }
      ]
    }
  });
  return result;
};
var getFollowers = async (userId) => {
  const result = await prisma_default.follow.findMany({
    where: { followingId: userId, status: "ACCEPTED" },
    include: { follower: true }
  });
  return result.map((f) => f.follower);
};
var getFollowing = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const result = await prisma_default.follow.findMany({
    where: { followerId: userId, status: "ACCEPTED" },
    include: { following: true },
    skip,
    take: limit
  });
  return result.map((f) => f.following);
};
var getPendingRequests = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const result = await prisma_default.follow.findMany({
    where: { followingId: userId, status: "PENDING" },
    include: { follower: true },
    skip,
    take: limit
  });
  return result.map((f) => f.follower);
};
var getSuggestions = async (userId, page = 1, limit = 15) => {
  const skip = (page - 1) * limit;
  const result = await prisma_default.user.findMany({
    where: {
      AND: [
        { id: { not: userId } },
        { isDeleted: false },
        {
          NOT: {
            followers: {
              some: { followerId: userId }
            }
          }
        },
        {
          NOT: {
            following: {
              some: { followingId: userId }
            }
          }
        }
      ]
    },
    skip,
    take: limit
  });
  return result;
};
var FollowServices = {
  followUser,
  acceptFollow,
  unfollowUser,
  getFollowers,
  getFollowing,
  getPendingRequests,
  getSuggestions
};

// src/app/module/follow/follow.controller.ts
var followUser2 = catchAsync_default(async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;
  const result = await FollowServices.followUser(followerId, followingId);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Followed successfully",
    data: result
  });
});
var unfollowUser2 = catchAsync_default(async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;
  const result = await FollowServices.unfollowUser(followerId, followingId);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Request deleted/unfollowed successfully",
    data: result
  });
});
var acceptFollow2 = catchAsync_default(async (req, res) => {
  const receiverId = req.user.id;
  const { senderId } = req.body;
  const result = await FollowServices.acceptFollow(receiverId, senderId);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Friend request accepted",
    data: result
  });
});
var getFollowers2 = catchAsync_default(async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await FollowServices.getFollowers(userId);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Followers retrieved successfully",
    data: result
  });
});
var getFollowing2 = catchAsync_default(async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await FollowServices.getFollowing(userId, page, limit);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Following list retrieved successfully",
    data: result
  });
});
var getPendingRequests2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log(`[DEBUG] Fetching pending requests for user: ${userId}`);
  const result = await FollowServices.getPendingRequests(userId, page, limit);
  console.log(`[DEBUG] Found ${result.length} pending requests`);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Pending requests retrieved successfully",
    data: result
  });
});
var getSuggestions2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const result = await FollowServices.getSuggestions(userId, page, limit);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Suggestions retrieved successfully",
    data: result
  });
});
var FollowControllers = {
  followUser: followUser2,
  acceptFollow: acceptFollow2,
  unfollowUser: unfollowUser2,
  getFollowers: getFollowers2,
  getFollowing: getFollowing2,
  getPendingRequests: getPendingRequests2,
  getSuggestions: getSuggestions2
};

// src/app/module/follow/follow.route.ts
var import_client9 = __toESM(require_client(), 1);
var router6 = Router2();
router6.use(auth_default(import_client9.Role.USER, import_client9.Role.ADMIN, import_client9.Role.MODERATOR));
router6.post("/follow", FollowControllers.followUser);
router6.post("/accept", FollowControllers.acceptFollow);
router6.post("/unfollow", FollowControllers.unfollowUser);
router6.get("/requests", FollowControllers.getPendingRequests);
router6.get("/suggestions", FollowControllers.getSuggestions);
router6.get("/:userId/followers", FollowControllers.getFollowers);
router6.get("/:userId/following", FollowControllers.getFollowing);
var FollowRoutes = router6;

// src/app/module/message/message.route.ts
init_esm_shims();
import express5 from "express";

// src/app/module/message/message.controller.ts
init_esm_shims();
import httpStatus10 from "http-status";

// src/app/module/message/message.service.ts
init_esm_shims();
var createMessage = async (payload) => {
  const result = await prisma_default.message.create({
    data: payload
  });
  try {
    const io2 = getIO();
    const targetRoom = payload.groupId ? `group_${payload.groupId}` : payload.receiverId;
    io2.to(targetRoom).emit("new-message", result);
  } catch (error) {
    console.error("Failed to emit new message:", error);
  }
  return result;
};
var getChatHistory = async (userId1, otherId, isGroup) => {
  if (isGroup) {
    return prisma_default.message.findMany({
      where: { groupId: otherId },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { name: true, image: true, id: true } } }
    });
  }
  return prisma_default.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: otherId },
        { senderId: otherId, receiverId: userId1 }
      ]
    },
    orderBy: { createdAt: "asc" }
  });
};
var markAsRead2 = async (senderId, receiverId) => {
  const result = await prisma_default.message.updateMany({
    where: {
      senderId,
      receiverId,
      isRead: false
    },
    data: {
      isRead: true
    }
  });
  return result;
};
var MessageServices = {
  getChatHistory,
  createMessage,
  markAsRead: markAsRead2
};

// src/app/module/message/message.controller.ts
var sendMessage = catchAsync_default(async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, groupId, content } = req.body;
  const result = await MessageServices.createMessage({
    senderId,
    receiverId,
    groupId,
    content
  });
  try {
    const io2 = getIO();
    const targetRoom = groupId ? `group_${groupId}` : receiverId;
    io2.to(targetRoom).emit("new-message", {
      senderId,
      receiverId,
      groupId,
      content,
      createdAt: result.createdAt,
      isRead: result.isRead,
      id: result.id,
      senderName: req.user.name || "Someone"
    });
  } catch (err) {
    console.error("Socket error on sendMessage:", err);
  }
  sendResponse_default(res, {
    statusCode: httpStatus10.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result
  });
});
var getChatHistory2 = catchAsync_default(async (req, res) => {
  const otherUserId = req.params.otherUserId;
  const userId = req.user.id;
  const prisma2 = await import("./prisma-JYXB53R3.js").then((m) => m.prisma);
  const isGroup = !!await prisma2.group.findUnique({ where: { id: otherUserId } });
  const result = await MessageServices.getChatHistory(userId, otherUserId, isGroup);
  sendResponse_default(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Chat history retrieved successfully",
    data: result
  });
});
var markAsRead3 = catchAsync_default(async (req, res) => {
  const senderId = req.params.senderId;
  const receiverId = req.user.id;
  const result = await MessageServices.markAsRead(senderId, receiverId);
  try {
    const io2 = getIO();
    io2.to(senderId).emit("messages-read", { by: receiverId });
  } catch (e) {
    console.error("Socket error on markAsRead:", e);
  }
  sendResponse_default(res, {
    statusCode: httpStatus10.OK,
    success: true,
    message: "Messages marked as read successfully",
    data: result
  });
});
var MessageControllers = {
  getChatHistory: getChatHistory2,
  sendMessage,
  markAsRead: markAsRead3
};

// src/app/module/message/message.route.ts
var router7 = express5.Router();
router7.post("/", auth_default(), MessageControllers.sendMessage);
router7.get("/:otherUserId", auth_default(), MessageControllers.getChatHistory);
router7.patch("/:senderId/read", auth_default(), MessageControllers.markAsRead);
var MessageRoutes = router7;

// src/app/module/announcement/announcement.route.ts
init_esm_shims();
import express6 from "express";

// src/app/module/announcement/announcement.controller.ts
init_esm_shims();
import httpStatus11 from "http-status";

// src/app/module/announcement/announcement.service.ts
init_esm_shims();
var createAnnouncement = async (adminId, payload) => {
  const result = await prisma_default.announcement.create({
    data: {
      adminId,
      title: payload.title,
      body: payload.body
    }
  });
  return result;
};
var getAnnouncements = async () => {
  const result = await prisma_default.announcement.findMany({
    orderBy: { createdAt: "desc" }
  });
  return result;
};
var AnnouncementServices = {
  createAnnouncement,
  getAnnouncements
};

// src/app/module/announcement/announcement.controller.ts
var createAnnouncement2 = catchAsync_default(async (req, res) => {
  const adminId = req.user?.id || req.body.adminId;
  const result = await AnnouncementServices.createAnnouncement(adminId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus11.CREATED,
    success: true,
    message: "Announcement created successfully",
    data: result
  });
});
var getAnnouncements2 = catchAsync_default(async (req, res) => {
  const result = await AnnouncementServices.getAnnouncements();
  sendResponse_default(res, {
    statusCode: httpStatus11.OK,
    success: true,
    message: "Announcements retrieved successfully",
    data: result
  });
});
var AnnouncementControllers = {
  createAnnouncement: createAnnouncement2,
  getAnnouncements: getAnnouncements2
};

// src/app/module/announcement/announcement.route.ts
var router8 = express6.Router();
router8.post("/", AnnouncementControllers.createAnnouncement);
router8.get("/", AnnouncementControllers.getAnnouncements);
var AnnouncementRoutes = router8;

// src/app/module/notification/notification.route.ts
init_esm_shims();
import express7 from "express";

// src/app/module/notification/notification.controller.ts
init_esm_shims();
import httpStatus12 from "http-status";
var getUserNotifications2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const result = await NotificationServices.getUserNotifications(userId);
  sendResponse_default(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result
  });
});
var getUnreadCount2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const result = await NotificationServices.getUnreadCount(userId);
  sendResponse_default(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Unread count retrieved successfully",
    data: result
  });
});
var markAsRead4 = catchAsync_default(async (req, res) => {
  const id = req.params.id;
  const userId = req.user?.id || req.body.userId;
  const result = await NotificationServices.markAsRead(id, userId);
  sendResponse_default(res, {
    statusCode: httpStatus12.OK,
    success: true,
    message: "Notification marked as read",
    data: result
  });
});
var NotificationControllers = {
  getUserNotifications: getUserNotifications2,
  getUnreadCount: getUnreadCount2,
  markAsRead: markAsRead4
};

// src/app/module/notification/notification.route.ts
var router9 = express7.Router();
router9.get("/", NotificationControllers.getUserNotifications);
router9.get("/unread-count", NotificationControllers.getUnreadCount);
router9.patch("/:id/read", NotificationControllers.markAsRead);
var NotificationRoutes = router9;

// src/app/module/upload/upload.route.ts
init_esm_shims();
import { Router as Router3 } from "express";

// src/app/module/upload/upload.controller.ts
init_esm_shims();
import httpStatus13 from "http-status";
import fs3 from "fs";
var uploadFile = catchAsync_default(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new Error("No file uploaded");
  }
  try {
    const result = await uploadMedia(file.path);
    fs3.unlinkSync(file.path);
    sendResponse_default(res, {
      statusCode: httpStatus13.OK,
      success: true,
      message: "File uploaded successfully",
      data: { url: result.url }
    });
  } catch (error) {
    if (fs3.existsSync(file.path)) {
      fs3.unlinkSync(file.path);
    }
    throw error;
  }
});
var UploadControllers = {
  uploadFile
};

// src/app/module/upload/upload.route.ts
var router10 = Router3();
router10.post("/", upload.single("file"), UploadControllers.uploadFile);
var UploadRoutes = router10;

// src/app/module/story/story.route.ts
init_esm_shims();
import { Router as Router4 } from "express";

// src/app/module/story/story.controller.ts
init_esm_shims();

// src/app/module/story/story.service.ts
init_esm_shims();
import fs4 from "fs";
var STORY_TTL_HOURS = 48;
var cleanupExpiredStories = async () => {
  const expiredStories = await prisma_default.story.findMany({
    where: { expiresAt: { lt: /* @__PURE__ */ new Date() } },
    select: { id: true, mediaUrl: true }
  });
  if (expiredStories.length > 0) {
    for (const story of expiredStories) {
      try {
        const parts = story.mediaUrl.split("/");
        const filename = parts[parts.length - 1];
        const publicId = filename.split(".")[0];
        await deleteMedia(publicId);
      } catch (_) {
      }
    }
    await prisma_default.story.deleteMany({
      where: { expiresAt: { lt: /* @__PURE__ */ new Date() } }
    });
  }
};
var getStories = async (currentUserId) => {
  await cleanupExpiredStories();
  const stories = await prisma_default.story.findMany({
    where: {
      expiresAt: { gt: /* @__PURE__ */ new Date() }
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true, image: true }
      },
      views: {
        where: { viewerId: currentUserId },
        select: { id: true }
      },
      _count: { select: { views: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const grouped = {};
  for (const story of stories) {
    if (!grouped[story.authorId]) {
      grouped[story.authorId] = {
        author: story.author,
        stories: [],
        hasUnseen: false,
        isOwn: story.authorId === currentUserId
      };
    }
    const isSeen = story.views.length > 0;
    if (!isSeen) grouped[story.authorId].hasUnseen = true;
    grouped[story.authorId].stories.push({
      id: story.id,
      mediaUrl: story.mediaUrl,
      caption: story.caption,
      expiresAt: story.expiresAt,
      createdAt: story.createdAt,
      isSeen,
      viewsCount: story._count.views
    });
  }
  return Object.values(grouped).sort((a, b) => {
    if (a.isOwn) return -1;
    if (b.isOwn) return 1;
    if (a.hasUnseen && !b.hasUnseen) return -1;
    if (!a.hasUnseen && b.hasUnseen) return 1;
    return 0;
  });
};
var createStory = async (authorId, payload, file) => {
  let mediaUrl = "";
  if (file) {
    const result = await uploadMedia(file.path);
    mediaUrl = result.url;
    if (fs4.existsSync(file.path)) fs4.unlinkSync(file.path);
  }
  if (!mediaUrl) throw new Error("Media file is required for a story");
  const expiresAt = /* @__PURE__ */ new Date();
  expiresAt.setHours(expiresAt.getHours() + STORY_TTL_HOURS);
  const story = await prisma_default.story.create({
    data: {
      authorId,
      mediaUrl,
      caption: payload.caption,
      expiresAt
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true, image: true } }
    }
  });
  return story;
};
var deleteStory = async (storyId, currentUserId) => {
  const story = await prisma_default.story.findUnique({ where: { id: storyId } });
  if (!story) throw new Error("Story not found");
  if (story.authorId !== currentUserId) throw new Error("Not authorized");
  try {
    const parts = story.mediaUrl.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];
    await deleteMedia(publicId);
  } catch (_) {
  }
  await prisma_default.story.delete({ where: { id: storyId } });
  return { message: "Story deleted" };
};
var viewStory = async (storyId, viewerId) => {
  await prisma_default.storyView.upsert({
    where: { storyId_viewerId: { storyId, viewerId } },
    create: { storyId, viewerId },
    update: { viewedAt: /* @__PURE__ */ new Date() }
  });
  return { message: "Story marked as viewed" };
};
var StoryServices = { getStories, createStory, deleteStory, viewStory };

// src/app/module/story/story.controller.ts
var getStories2 = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const data = await StoryServices.getStories(currentUserId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
var createStory2 = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const file = req.file;
    const data = await StoryServices.createStory(currentUserId, req.body, file);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var deleteStory2 = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const id = req.params.id;
    const data = await StoryServices.deleteStory(id, currentUserId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var viewStory2 = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const id = req.params.id;
    const data = await StoryServices.viewStory(id, currentUserId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
var StoryControllers = { getStories: getStories2, createStory: createStory2, deleteStory: deleteStory2, viewStory: viewStory2 };

// src/app/module/story/story.route.ts
var import_client10 = __toESM(require_client(), 1);
var router11 = Router4();
router11.get("/", auth_default(import_client10.Role.USER, import_client10.Role.ADMIN, import_client10.Role.MODERATOR), StoryControllers.getStories);
router11.post("/", auth_default(import_client10.Role.USER, import_client10.Role.ADMIN, import_client10.Role.MODERATOR), upload.single("media"), StoryControllers.createStory);
router11.delete("/:id", auth_default(import_client10.Role.USER, import_client10.Role.ADMIN, import_client10.Role.MODERATOR), StoryControllers.deleteStory);
router11.post("/:id/view", auth_default(import_client10.Role.USER, import_client10.Role.ADMIN, import_client10.Role.MODERATOR), StoryControllers.viewStory);
var StoryRoutes = router11;

// src/app/module/search/search.route.ts
init_esm_shims();
import { Router as Router5 } from "express";

// src/app/module/search/search.controller.ts
init_esm_shims();
import httpStatus14 from "http-status";

// src/app/module/search/search.service.ts
init_esm_shims();
var globalSearch = async (searchTerm, type = "users", limit = 20) => {
  if (type === "users") {
    const result = await prisma_default.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { bio: { contains: searchTerm, mode: "insensitive" } }
        ],
        isDeleted: false
      },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        followersCount: true,
        followingCount: true
      }
    });
    return result;
  }
  if (type === "posts") {
    const result = await prisma_default.post.findMany({
      where: {
        content: { contains: searchTerm, mode: "insensitive" },
        status: "ACTIVE",
        deletedAt: null
      },
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true }
        },
        _count: {
          select: {
            reactions: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return result;
  }
  if (type === "tags") {
    const result = await prisma_default.hashtag.findMany({
      where: {
        tag: { contains: searchTerm.startsWith("#") ? searchTerm.slice(1).toLowerCase() : searchTerm.toLowerCase() }
      },
      take: limit,
      orderBy: { postCount: "desc" }
    });
    return result;
  }
  return [];
};
var SearchServices = {
  globalSearch
};

// src/app/module/search/search.controller.ts
var globalSearch2 = catchAsync_default(async (req, res) => {
  const { q, type, limit } = req.query;
  const searchTerm = q;
  const searchType = type || "users";
  const searchLimit = limit ? parseInt(limit) : 20;
  const result = await SearchServices.globalSearch(searchTerm, searchType, searchLimit);
  sendResponse_default(res, {
    statusCode: httpStatus14.OK,
    success: true,
    message: "Search results fetched successfully",
    data: result
  });
});
var SearchControllers = {
  globalSearch: globalSearch2
};

// src/app/module/search/search.route.ts
var router12 = Router5();
router12.get("/", SearchControllers.globalSearch);
var SearchRoutes = router12;

// src/app/module/hashtag/hashtag.route.ts
init_esm_shims();
import { Router as Router6 } from "express";

// src/app/module/hashtag/hashtag.controller.ts
init_esm_shims();
import httpStatus15 from "http-status";
var getTrendingHashtags2 = catchAsync_default(async (req, res) => {
  const { limit } = req.query;
  const trendingLimit = limit ? parseInt(limit) : 10;
  const result = await HashtagServices.getTrendingHashtags(trendingLimit);
  sendResponse_default(res, {
    statusCode: httpStatus15.OK,
    success: true,
    message: "Trending hashtags fetched successfully",
    data: result
  });
});
var HashtagControllers = {
  getTrendingHashtags: getTrendingHashtags2
};

// src/app/module/hashtag/hashtag.route.ts
var router13 = Router6();
router13.get("/trending", HashtagControllers.getTrendingHashtags);
var HashtagRoutes = router13;

// src/app/module/savedPost/savedPost.route.ts
init_esm_shims();
import { Router as Router7 } from "express";

// src/app/module/savedPost/savedPost.controller.ts
init_esm_shims();
import httpStatus16 from "http-status";

// src/app/module/savedPost/savedPost.service.ts
init_esm_shims();
var savePost = async (userId, postId) => {
  return await prisma_default.savedPost.upsert({
    where: { userId_postId: { userId, postId } },
    update: {},
    create: { userId, postId }
  });
};
var unsavePost = async (userId, postId) => {
  return await prisma_default.savedPost.deleteMany({
    where: { userId, postId }
  });
};
var getSavedPosts = async (userId, limit = 20, cursor) => {
  const result = await prisma_default.savedPost.findMany({
    where: { userId },
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : void 0,
    include: {
      post: {
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true }
          },
          _count: {
            select: {
              reactions: true,
              comments: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  const hasNextPage = result.length > limit;
  const items = hasNextPage ? result.slice(0, -1) : result;
  const nextCursor = hasNextPage ? items[items.length - 1].id : null;
  return {
    posts: items.map((item) => item.post),
    nextCursor
  };
};
var SavedPostServices = {
  savePost,
  unsavePost,
  getSavedPosts
};

// src/app/module/savedPost/savedPost.controller.ts
var savePost2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const result = await SavedPostServices.savePost(userId, postId);
  sendResponse_default(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Post saved successfully",
    data: result
  });
});
var unsavePost2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;
  const result = await SavedPostServices.unsavePost(userId, postId);
  sendResponse_default(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Post unsaved successfully",
    data: result
  });
});
var getSavedPosts2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { limit, cursor } = req.query;
  const savedLimit = limit ? parseInt(limit) : 20;
  const result = await SavedPostServices.getSavedPosts(userId, savedLimit, cursor);
  sendResponse_default(res, {
    statusCode: httpStatus16.OK,
    success: true,
    message: "Saved posts fetched successfully",
    data: result
  });
});
var SavedPostControllers = {
  savePost: savePost2,
  unsavePost: unsavePost2,
  getSavedPosts: getSavedPosts2
};

// src/app/module/savedPost/savedPost.route.ts
var router14 = Router7();
console.log("SavedPostRoutes router initialized");
router14.use((req, res, next) => {
  console.log(`SavedPost request: ${req.method} ${req.url}`);
  next();
});
router14.post("/:postId", auth_default("USER", "ADMIN", "MODERATOR"), SavedPostControllers.savePost);
router14.delete("/:postId", auth_default("USER", "ADMIN", "MODERATOR"), SavedPostControllers.unsavePost);
router14.get("/", auth_default("USER", "ADMIN", "MODERATOR"), SavedPostControllers.getSavedPosts);
var SavedPostRoutes = router14;

// src/app/module/reaction/reaction.route.ts
init_esm_shims();
import { Router as Router8 } from "express";

// src/app/module/reaction/reaction.controller.ts
init_esm_shims();
import httpStatus17 from "http-status";

// src/app/module/reaction/reaction.service.ts
init_esm_shims();
var toggleReaction = async (userId, payload) => {
  const where = {
    userId,
    postId: payload.postId || null,
    commentId: payload.commentId || null
  };
  const existingReaction = await prisma_default.reaction.findFirst({
    where: {
      userId,
      postId: payload.postId || null,
      commentId: payload.commentId || null
    }
  });
  if (existingReaction) {
    if (existingReaction.type === payload.type) {
      await prisma_default.reaction.delete({ where: { id: existingReaction.id } });
      if (payload.postId) {
        await prisma_default.post.update({ where: { id: payload.postId }, data: { likesCount: { decrement: 1 } } });
      } else if (payload.commentId) {
        await prisma_default.comment.update({ where: { id: payload.commentId }, data: { likesCount: { decrement: 1 } } });
      }
      return { reacted: false, type: null };
    } else {
      const updated = await prisma_default.reaction.update({
        where: { id: existingReaction.id },
        data: { type: payload.type }
      });
      return { reacted: true, type: updated.type };
    }
  } else {
    const result = await prisma_default.reaction.create({
      data: {
        userId,
        postId: payload.postId || null,
        commentId: payload.commentId || null,
        type: payload.type
      }
    });
    if (payload.postId) {
      await prisma_default.post.update({ where: { id: payload.postId }, data: { likesCount: { increment: 1 } } });
      const post = await prisma_default.post.findUnique({ where: { id: payload.postId }, include: { author: true } });
      const reactor = await prisma_default.user.findUnique({ where: { id: userId } });
      if (post && post.authorId !== userId) {
        await prisma_default.notification.create({
          data: {
            userId: post.authorId,
            type: "REACTION",
            referenceId: post.id,
            message: `${reactor?.name} reacted with ${payload.type} to your post.`
          }
        });
      }
    } else if (payload.commentId) {
      await prisma_default.comment.update({ where: { id: payload.commentId }, data: { likesCount: { increment: 1 } } });
      const comment = await prisma_default.comment.findUnique({ where: { id: payload.commentId }, include: { author: true } });
      const reactor = await prisma_default.user.findUnique({ where: { id: userId } });
      if (comment && comment.authorId !== userId) {
        await prisma_default.notification.create({
          data: {
            userId: comment.authorId,
            type: "REACTION",
            referenceId: comment.id,
            message: `${reactor?.name} reacted with ${payload.type} to your comment.`
          }
        });
      }
    }
    return { reacted: true, type: result.type };
  }
};
var ReactionServices = {
  toggleReaction
};

// src/app/module/reaction/reaction.controller.ts
var toggleReaction2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await ReactionServices.toggleReaction(userId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus17.OK,
    success: true,
    message: "Reaction toggled successfully",
    data: result
  });
});
var ReactionControllers = {
  toggleReaction: toggleReaction2
};

// src/app/module/reaction/reaction.route.ts
var router15 = Router8();
router15.post("/", auth_default("USER", "ADMIN", "MODERATOR"), ReactionControllers.toggleReaction);
var ReactionRoutes = router15;

// src/app/module/group/group.route.ts
init_esm_shims();
import { Router as Router9 } from "express";

// src/app/module/group/group.controller.ts
init_esm_shims();
import httpStatus18 from "http-status";

// src/app/module/group/group.service.ts
init_esm_shims();
var createGroup = async (payload) => {
  const { name, memberIds, createdBy } = payload;
  const allMemberIds = [.../* @__PURE__ */ new Set([createdBy, ...memberIds])];
  const group = await prisma.group.create({
    data: {
      name,
      createdBy,
      members: {
        create: allMemberIds.map((userId) => ({
          userId,
          role: userId === createdBy ? "ADMIN" : "MEMBER"
        }))
      }
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } }
      }
    }
  });
  return group;
};
var getUserGroups = async (userId) => {
  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId } }
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return groups;
};
var GroupService = { createGroup, getUserGroups };

// src/app/module/group/group.controller.ts
var createGroup2 = catchAsync_default(async (req, res) => {
  const currentUserId = req.user?.id;
  const { name, memberIds } = req.body;
  const result = await GroupService.createGroup({ name, memberIds, createdBy: currentUserId });
  sendResponse_default(res, {
    statusCode: httpStatus18.CREATED,
    success: true,
    message: "Group created successfully",
    data: result
  });
});
var getUserGroups2 = catchAsync_default(async (req, res) => {
  const currentUserId = req.user?.id;
  const result = await GroupService.getUserGroups(currentUserId);
  sendResponse_default(res, {
    statusCode: httpStatus18.OK,
    success: true,
    message: "Groups retrieved successfully",
    data: result
  });
});
var GroupController = { createGroup: createGroup2, getUserGroups: getUserGroups2 };

// src/app/module/group/group.route.ts
var router16 = Router9();
router16.post("/", auth_default(), GroupController.createGroup);
router16.get("/", auth_default(), GroupController.getUserGroups);
var GroupRoutes = router16;

// src/app/module/store/store.route.ts
init_esm_shims();
import express8 from "express";

// src/app/module/store/store.controller.ts
init_esm_shims();

// src/app/module/store/store.service.ts
init_esm_shims();
var createStore = async (userId, payload) => {
  const result = await prisma_default.store.create({
    data: {
      ...payload,
      ownerId: userId
    }
  });
  return result;
};
var getStoreById = async (id, currentUserId) => {
  const result = await prisma_default.store.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      },
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
          followers: true
        }
      },
      followers: currentUserId ? {
        where: { userId: currentUserId },
        select: { id: true }
      } : false
    }
  });
  if (!result) return null;
  return {
    ...result,
    isFollowing: result.followers ? result.followers.length > 0 : false,
    followers: void 0
  };
};
var getMyStore = async (userId) => {
  const result = await prisma_default.store.findUnique({
    where: { ownerId: userId },
    include: {
      _count: {
        select: {
          products: true,
          followers: true,
          orders: true
        }
      }
    }
  });
  return result;
};
var updateStore = async (userId, id, payload) => {
  const store = await prisma_default.store.findUnique({ where: { id } });
  if (!store || store.ownerId !== userId) {
    throw new Error("Not authorized to update this store");
  }
  const result = await prisma_default.store.update({
    where: { id },
    data: payload
  });
  return result;
};
var toggleFollowStore = async (userId, storeId) => {
  const existingFollow = await prisma_default.storeFollow.findUnique({
    where: {
      userId_storeId: { userId, storeId }
    }
  });
  if (existingFollow) {
    await prisma_default.$transaction([
      prisma_default.storeFollow.delete({
        where: { id: existingFollow.id }
      }),
      prisma_default.store.update({
        where: { id: storeId },
        data: { followersCount: { decrement: 1 } }
      })
    ]);
    return { followed: false };
  } else {
    await prisma_default.$transaction([
      prisma_default.storeFollow.create({
        data: { userId, storeId }
      }),
      prisma_default.store.update({
        where: { id: storeId },
        data: { followersCount: { increment: 1 } }
      })
    ]);
    return { followed: true };
  }
};
var StoreServices = {
  createStore,
  getStoreById,
  getMyStore,
  updateStore,
  toggleFollowStore
};

// src/app/module/store/store.controller.ts
var createStore2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await StoreServices.createStore(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Store created successfully",
    data: result
  });
});
var getStoreById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  const result = await StoreServices.getStoreById(id, currentUserId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Store fetched successfully",
    data: result
  });
});
var getMyStore2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await StoreServices.getMyStore(userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "My store fetched successfully",
    data: result
  });
});
var updateStore2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await StoreServices.updateStore(userId, id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Store updated successfully",
    data: result
  });
});
var toggleFollowStore2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id: storeId } = req.params;
  const result = await StoreServices.toggleFollowStore(userId, storeId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: result.followed ? "Followed store" : "Unfollowed store",
    data: result
  });
});
var StoreControllers = {
  createStore: createStore2,
  getStoreById: getStoreById2,
  getMyStore: getMyStore2,
  updateStore: updateStore2,
  toggleFollowStore: toggleFollowStore2
};

// src/app/module/store/store.route.ts
var router17 = express8.Router();
router17.post("/", auth_default("USER", "ADMIN", "MODERATOR"), StoreControllers.createStore);
router17.get("/my-store", auth_default("USER", "ADMIN", "MODERATOR"), StoreControllers.getMyStore);
router17.get("/:id", StoreControllers.getStoreById);
router17.put("/:id", auth_default("USER", "ADMIN", "MODERATOR"), StoreControllers.updateStore);
router17.post("/:id/follow", auth_default("USER", "ADMIN", "MODERATOR"), StoreControllers.toggleFollowStore);
var StoreRoutes = router17;

// src/app/module/product/product.route.ts
init_esm_shims();
import express9 from "express";

// src/app/module/product/product.controller.ts
init_esm_shims();

// src/app/module/product/product.service.ts
init_esm_shims();
var createProduct = async (userId, payload) => {
  const store = await prisma_default.store.findUnique({
    where: { ownerId: userId }
  });
  if (!store) {
    throw new Error("User does not have a store. Create a store first.");
  }
  const result = await prisma_default.product.create({
    data: {
      ...payload,
      storeId: store.id,
      price: Number(payload.price),
      stock: Number(payload.stock)
    }
  });
  return result;
};
var getAllProducts = async (query) => {
  const statusFilter = query.status || "ACTIVE";
  return await new QueryBuilder(prisma_default.product, query, {
    searchableFields: ["title", "description"],
    filterableFields: ["storeId", "categoryId", "status"]
  }).search().filter().where({ deletedAt: null, status: statusFilter }).sort().paginate().include({
    store: { select: { id: true, name: true } },
    category: { select: { id: true, name: true } },
    flags: { take: 1, orderBy: { createdAt: "desc" } }
  }).execute();
};
var getProductById = async (id) => {
  const result = await prisma_default.product.findUnique({
    where: { id },
    include: {
      store: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        }
      },
      category: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  return result;
};
var updateProduct = async (userId, id, payload) => {
  const product = await prisma_default.product.findUnique({
    where: { id },
    include: { store: true }
  });
  if (!product || product.store.ownerId !== userId) {
    throw new Error("Not authorized to update this product");
  }
  const result = await prisma_default.product.update({
    where: { id },
    data: {
      ...payload,
      price: payload.price ? Number(payload.price) : void 0,
      stock: payload.stock ? Number(payload.stock) : void 0
    }
  });
  return result;
};
var deleteProduct = async (userId, id) => {
  const product = await prisma_default.product.findUnique({
    where: { id },
    include: { store: true }
  });
  if (!product || product.store.ownerId !== userId) {
    throw new Error("Not authorized to delete this product");
  }
  const result = await prisma_default.product.update({
    where: { id },
    data: { deletedAt: /* @__PURE__ */ new Date(), status: "INACTIVE" }
  });
  return result;
};
var ProductServices = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};

// src/app/module/product/product.controller.ts
var createProduct2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await ProductServices.createProduct(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Product created successfully",
    data: result
  });
});
var getAllProducts2 = catchAsync_default(async (req, res) => {
  const result = await ProductServices.getAllProducts(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Products fetched successfully",
    data: result
  });
});
var getProductById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await ProductServices.getProductById(id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Product fetched successfully",
    data: result
  });
});
var updateProduct2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ProductServices.updateProduct(userId, id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Product updated successfully",
    data: result
  });
});
var deleteProduct2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ProductServices.deleteProduct(userId, id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Product deleted successfully",
    data: result
  });
});
var ProductControllers = {
  createProduct: createProduct2,
  getAllProducts: getAllProducts2,
  getProductById: getProductById2,
  updateProduct: updateProduct2,
  deleteProduct: deleteProduct2
};

// src/app/module/product/product.route.ts
var router18 = express9.Router();
router18.post("/", auth_default("USER", "ADMIN", "MODERATOR"), ProductControllers.createProduct);
router18.get("/", ProductControllers.getAllProducts);
router18.get("/:id", ProductControllers.getProductById);
router18.put("/:id", auth_default("USER", "ADMIN", "MODERATOR"), ProductControllers.updateProduct);
router18.delete("/:id", auth_default("USER", "ADMIN", "MODERATOR"), ProductControllers.deleteProduct);
var ProductRoutes = router18;

// src/app/module/category/category.route.ts
init_esm_shims();
import express10 from "express";

// src/app/module/category/category.controller.ts
init_esm_shims();

// src/app/module/category/category.service.ts
init_esm_shims();
var createCategory = async (userId, payload) => {
  const result = await prisma_default.category.create({
    data: {
      ...payload,
      createdBy: userId
    }
  });
  return result;
};
var getAllCategories = async (query) => {
  return await new QueryBuilder(prisma_default.category, query, {
    searchableFields: ["name", "description"],
    filterableFields: ["parentId"]
  }).search().filter().sort().paginate().include({
    children: true,
    _count: {
      select: { products: true }
    }
  }).execute();
};
var getCategoryById = async (id) => {
  const result = await prisma_default.category.findUnique({
    where: { id },
    include: {
      children: true,
      products: {
        where: { status: "ACTIVE" },
        take: 10
      }
    }
  });
  return result;
};
var updateCategory = async (id, payload) => {
  const result = await prisma_default.category.update({
    where: { id },
    data: payload
  });
  return result;
};
var deleteCategory = async (id) => {
  const productCount = await prisma_default.product.count({
    where: { categoryId: id }
  });
  if (productCount > 0) {
    throw new Error("Cannot delete category with active products. Re-assign them first.");
  }
  const result = await prisma_default.category.delete({
    where: { id }
  });
  return result;
};
var CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};

// src/app/module/category/category.controller.ts
var createCategory2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await CategoryServices.createCategory(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: result
  });
});
var getAllCategories2 = catchAsync_default(async (req, res) => {
  const result = await CategoryServices.getAllCategories(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Categories fetched successfully",
    data: result
  });
});
var getCategoryById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryServices.getCategoryById(id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category fetched successfully",
    data: result
  });
});
var updateCategory2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryServices.updateCategory(id, req.body);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: result
  });
});
var deleteCategory2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryServices.deleteCategory(id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: result
  });
});
var CategoryControllers = {
  createCategory: createCategory2,
  getAllCategories: getAllCategories2,
  getCategoryById: getCategoryById2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2
};

// src/app/module/category/category.route.ts
var router19 = express10.Router();
router19.get("/", CategoryControllers.getAllCategories);
router19.get("/:id", CategoryControllers.getCategoryById);
router19.post("/", auth_default("ADMIN"), CategoryControllers.createCategory);
router19.put("/:id", auth_default("ADMIN"), CategoryControllers.updateCategory);
router19.delete("/:id", auth_default("ADMIN"), CategoryControllers.deleteCategory);
var CategoryRoutes = router19;

// src/app/module/order/order.route.ts
init_esm_shims();
import express11 from "express";

// src/app/module/order/order.controller.ts
init_esm_shims();

// src/app/module/order/order.service.ts
init_esm_shims();
var createOrder = async (userId, payload) => {
  const { storeId, items, shippingAddress } = payload;
  let totalAmount = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = await prisma_default.product.findUnique({
      where: { id: item.productId }
    });
    if (!product) throw new Error(`Product ${item.productId} not found`);
    if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);
    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;
    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      subtotal
    });
  }
  const result = await prisma_default.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        buyerId: userId,
        storeId,
        totalAmount,
        shippingAddress,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
    return order;
  });
  return result;
};
var getOrderById = async (id, userId, role) => {
  const order = await prisma_default.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true }
      },
      store: true,
      buyer: {
        select: { name: true, email: true, avatarUrl: true }
      },
      payment: true
    }
  });
  if (!order) return null;
  if (role !== "ADMIN" && order.buyerId !== userId && order.store.ownerId !== userId) {
    throw new Error("Not authorized to view this order");
  }
  return order;
};
var getMyOrders = async (userId) => {
  return await prisma_default.order.findMany({
    where: { buyerId: userId },
    include: {
      items: { include: { product: true } },
      store: true
    },
    orderBy: { createdAt: "desc" }
  });
};
var getStoreOrders = async (userId) => {
  const store = await prisma_default.store.findUnique({ where: { ownerId: userId } });
  if (!store) throw new Error("Store not found");
  return await prisma_default.order.findMany({
    where: { storeId: store.id },
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: "desc" }
  });
};
var updateOrderStatus = async (userId, orderId, status2) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: { store: true }
  });
  if (!order) throw new Error("Order not found");
  const isOwner = order.store.ownerId === userId;
  if (!isOwner) {
    const user = await prisma_default.user.findUnique({ where: { id: userId } });
    if (user?.role !== "ADMIN") throw new Error("Not authorized to update status");
  }
  return await prisma_default.order.update({
    where: { id: orderId },
    data: { status: status2 }
  });
};
var OrderServices = {
  createOrder,
  getOrderById,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus
};

// src/app/module/order/order.controller.ts
var createOrder2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await OrderServices.createOrder(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Order created successfully",
    data: result
  });
});
var getMyOrders2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await OrderServices.getMyOrders(userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Orders fetched successfully",
    data: result
  });
});
var getStoreOrders2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await OrderServices.getStoreOrders(userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Store orders fetched successfully",
    data: result
  });
});
var getOrderById2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;
  const result = await OrderServices.getOrderById(id, userId, role);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Order fetched successfully",
    data: result
  });
});
var updateOrderStatus2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status: status2 } = req.body;
  const result = await OrderServices.updateOrderStatus(userId, id, status2);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Order status updated successfully",
    data: result
  });
});
var OrderControllers = {
  createOrder: createOrder2,
  getMyOrders: getMyOrders2,
  getStoreOrders: getStoreOrders2,
  getOrderById: getOrderById2,
  updateOrderStatus: updateOrderStatus2
};

// src/app/module/order/order.route.ts
var router20 = express11.Router();
router20.post("/", auth_default("USER", "ADMIN", "MODERATOR"), OrderControllers.createOrder);
router20.get("/my-orders", auth_default("USER", "ADMIN", "MODERATOR"), OrderControllers.getMyOrders);
router20.get("/store-orders", auth_default("USER", "ADMIN", "MODERATOR"), OrderControllers.getStoreOrders);
router20.get("/:id", auth_default("USER", "ADMIN", "MODERATOR"), OrderControllers.getOrderById);
router20.patch("/:id/status", auth_default("USER", "ADMIN", "MODERATOR"), OrderControllers.updateOrderStatus);
var OrderRoutes = router20;

// src/app/module/payment/payment.route.ts
init_esm_shims();
import express12 from "express";

// src/app/module/payment/payment.controller.ts
init_esm_shims();

// src/app/module/payment/payment.service.ts
init_esm_shims();
import Stripe from "stripe";

// src/app/utils/email.ts
init_esm_shims();
import nodemailer2 from "nodemailer";
var transporter2 = nodemailer2.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
var sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "EchoNet Marketplace"}" <${process.env.SMTP_FROM}>`,
    to,
    subject,
    html
  };
  try {
    const info = await transporter2.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// src/app/module/payment/payment.service.ts
var stripe = new Stripe(config_default.stripe_secret_key);
var initiatePayment = async (orderId, userId) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: true,
      items: {
        include: { product: true }
      }
    }
  });
  if (!order) throw new Error("Order not found");
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: order.items.map((item) => {
        const images = item.product.images.map((img) => {
          if (!img) return null;
          if (img.startsWith("http")) return img;
          const baseUrl = config_default.backend_url;
          const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
          const cleanImg = img.startsWith("/") ? img : `/${img}`;
          return `${cleanBase}${cleanImg}`;
        }).filter((img) => !!img).slice(0, 1);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.title,
              description: item.product.description.substring(0, 100),
              images: images.length > 0 ? images : void 0
            },
            unit_amount: Math.round(Number(item.unitPrice) * 100)
          },
          quantity: item.quantity
        };
      }),
      mode: "payment",
      success_url: `${config_default.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config_default.frontend_url}/payment/cancel`,
      metadata: {
        orderId: order.id,
        userId
      },
      customer_email: order.buyer.email
    });
    await prisma_default.payment.create({
      data: {
        orderId: order.id,
        transactionId: session.id,
        amount: order.totalAmount,
        provider: "STRIPE",
        status: "PENDING"
      }
    });
    return { url: session.url };
  } catch (stripeError) {
    console.error("STRIKE SESSION ERROR DETAILS:", {
      message: stripeError.message,
      type: stripeError.type,
      raw: stripeError.raw
    });
    throw stripeError;
  }
};
var handleWebhook = async (payload, sig) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      config_default.stripe_webhook_secret
    );
  } catch (err) {
    throw new Error(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await prisma_default.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: {
            status: "SUCCESS",
            paidAt: /* @__PURE__ */ new Date(),
            metadata: session
          }
        });
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID", paymentRef: session.id }
        });
      });
      const order = await prisma_default.order.findUnique({
        where: { id: orderId },
        include: { buyer: true }
      });
      if (order && order.buyer.email) {
        try {
          await sendEmail(
            order.buyer.email,
            "Payment Confirmation - EchoNet Marketplace",
            `
                  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h2 style="color: #000;">Payment Successful!</h2>
                      <p>Hello <strong>${order.buyer.name}</strong>,</p>
                      <p>Your payment for order <strong>#${order.id.substring(0, 8)}</strong> has been received successfully.</p>
                      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0;"><strong>Amount Paid:</strong> $${order.totalAmount}</p>
                          <p style="margin: 0;"><strong>Transaction ID:</strong> ${session.id}</p>
                      </div>
                      <p>Thank you for shopping on EchoNet Marketplace!</p>
                  </div>
                  `
          );
        } catch (emailErr) {
          console.error("Failed to send confirmation email:", emailErr);
        }
      }
    }
  }
  return { success: true };
};
var PaymentServices = {
  initiatePayment,
  handleWebhook
};

// src/app/module/payment/payment.controller.ts
var initiatePayment2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;
  const result = await PaymentServices.initiatePayment(orderId, userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Payment initiated successfully",
    data: result
  });
});
var handleWebhook2 = catchAsync_default(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const result = await PaymentServices.handleWebhook(req.rawBody, sig);
  res.status(200).send({ received: true });
});
var PaymentControllers = {
  initiatePayment: initiatePayment2,
  handleWebhook: handleWebhook2
};

// src/app/module/payment/payment.route.ts
var router21 = express12.Router();
router21.post("/initiate", auth_default("USER", "ADMIN", "MODERATOR"), PaymentControllers.initiatePayment);
router21.post("/webhook", PaymentControllers.handleWebhook);
var PaymentRoutes = router21;

// src/app/module/property/property.route.ts
init_esm_shims();
import express13 from "express";

// src/app/module/property/property.controller.ts
init_esm_shims();

// src/app/module/property/property.service.ts
init_esm_shims();
var import_client11 = __toESM(require_client(), 1);
var createProperty = async (userId, payload) => {
  const {
    title,
    description,
    price,
    priceUnit,
    listingType,
    category,
    city,
    area,
    address,
    latitude,
    longitude,
    details,
    images,
    amenities
  } = payload;
  const result = await prisma_default.$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        ownerId: userId,
        title,
        description,
        price,
        priceUnit,
        listingType,
        category,
        city,
        area,
        address,
        latitude,
        longitude,
        // 2. Create Details
        details: {
          create: details
        },
        // 3. Create Images
        images: {
          create: (images || []).map((img, index) => ({
            url: img.url,
            isCover: img.isCover || index === 0,
            publicId: img.publicId,
            order: index
          }))
        },
        // 4. Create Amenities
        amenities: {
          create: (amenities || []).map((name) => ({ name }))
        }
      },
      include: {
        details: true,
        images: true,
        amenities: true
      }
    });
    return property;
  });
  return result;
};
var getAllProperties = async (query) => {
  const statusFilter = query.status || import_client11.PropertyStatus.ACTIVE;
  const result = await new QueryBuilder(prisma_default.property, query, {
    searchableFields: ["title", "description", "address", "city", "area"],
    filterableFields: ["listingType", "category", "city", "area", "status"]
  }).search().filter().where({ deletedAt: null, status: statusFilter }).sort().paginate().include({
    details: true,
    images: { where: { isCover: true }, take: 1 },
    owner: { select: { id: true, name: true, avatarUrl: true } }
  }).execute();
  return result;
};
var getPropertyById = async (id) => {
  const property = await prisma_default.property.findUnique({
    where: { id },
    include: {
      details: true,
      images: { orderBy: { order: "asc" } },
      amenities: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          phoneNumber: true,
          createdAt: true
        }
      },
      agent: {
        include: {
          user: { select: { name: true, avatarUrl: true } }
        }
      },
      reviews: {
        include: {
          reviewer: { select: { name: true, avatarUrl: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!property || property.deletedAt) return null;
  await prisma_default.property.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  });
  return property;
};
var updateProperty = async (id, userId, payload) => {
  const { details, images, amenities, ...propertyData } = payload;
  const existingProperty = await prisma_default.property.findUnique({ where: { id } });
  if (!existingProperty || existingProperty.ownerId !== userId) {
    throw new Error("Not authorized to update this property");
  }
  const result = await prisma_default.$transaction(async (tx) => {
    const updatedProperty = await tx.property.update({
      where: { id },
      data: propertyData
    });
    if (details) {
      await tx.propertyDetail.update({
        where: { propertyId: id },
        data: details
      });
    }
    if (images) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      await tx.propertyImage.createMany({
        data: images.map((img, index) => ({
          propertyId: id,
          url: img.url,
          isCover: img.isCover || index === 0,
          publicId: img.publicId,
          order: index
        }))
      });
    }
    if (amenities) {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      await tx.propertyAmenity.createMany({
        data: amenities.map((name) => ({
          propertyId: id,
          name
        }))
      });
    }
    return tx.property.findUnique({
      where: { id },
      include: { details: true, images: true, amenities: true }
    });
  });
  return result;
};
var deleteProperty = async (id, userId) => {
  const existingProperty = await prisma_default.property.findUnique({ where: { id } });
  if (!existingProperty || existingProperty.ownerId !== userId) {
    throw new Error("Not authorized to delete this property");
  }
  return await prisma_default.property.update({
    where: { id },
    data: { deletedAt: /* @__PURE__ */ new Date(), status: import_client11.PropertyStatus.INACTIVE }
  });
};
var getMyProperties = async (userId, query) => {
  const result = await new QueryBuilder(prisma_default.property, query, {
    searchableFields: ["title", "description", "address", "city", "area"],
    filterableFields: ["listingType", "category", "city", "area", "status"]
  }).search().filter().where({ ownerId: userId, deletedAt: null }).sort().paginate().include({
    details: true,
    images: { where: { isCover: true }, take: 1 }
  }).execute();
  return result;
};
var updateStatus = async (id, status2) => {
  return await prisma_default.property.update({
    where: { id },
    data: { status: status2 }
  });
};
var PropertyServices = {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getMyProperties,
  updateStatus
};

// src/app/module/property/property.controller.ts
import fs5 from "fs";
var createProperty2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const payload = (typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body) || {};
  const files = req.files;
  const uploadedImages = [];
  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const result2 = await uploadMedia(file.path, "properties");
        uploadedImages.push({ url: result2.url, publicId: result2.public_id });
        if (fs5.existsSync(file.path)) fs5.unlinkSync(file.path);
      }
    }
    if (uploadedImages.length > 0) {
      const newImages = uploadedImages.map((img, index) => ({
        url: img.url,
        isCover: (payload.images || []).length === 0 && index === 0,
        publicId: img.publicId
      }));
      payload.images = [...payload.images || [], ...newImages];
    }
    const result = await PropertyServices.createProperty(userId, payload);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Property created successfully",
      data: result
    });
  } catch (error) {
    for (const img of uploadedImages) {
      await deleteMedia(img.publicId);
    }
    if (files) {
      for (const file of files) {
        if (fs5.existsSync(file.path)) fs5.unlinkSync(file.path);
      }
    }
    throw error;
  }
});
var getAllProperties2 = catchAsync_default(async (req, res) => {
  const result = await PropertyServices.getAllProperties(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Properties fetched successfully",
    data: result
  });
});
var getPropertyById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyServices.getPropertyById(id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Property fetched successfully",
    data: result
  });
});
var updateProperty2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const payload = (typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body) || {};
  const files = req.files;
  const uploadedImages = [];
  try {
    if (files && files.length > 0) {
      for (const file of files) {
        const result2 = await uploadMedia(file.path, "properties");
        uploadedImages.push({ url: result2.url, publicId: result2.public_id });
        if (fs5.existsSync(file.path)) fs5.unlinkSync(file.path);
      }
    }
    if (uploadedImages.length > 0) {
      const newImages = uploadedImages.map((img) => ({
        url: img.url,
        isCover: false,
        publicId: img.publicId
      }));
      payload.images = [...payload.images || [], ...newImages];
    }
    const result = await PropertyServices.updateProperty(id, userId, payload);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Property updated successfully",
      data: result
    });
  } catch (error) {
    for (const img of uploadedImages) {
      await deleteMedia(img.publicId);
    }
    if (files) {
      for (const file of files) {
        if (fs5.existsSync(file.path)) fs5.unlinkSync(file.path);
      }
    }
    throw error;
  }
});
var deleteProperty2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await PropertyServices.deleteProperty(id, userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Property deleted successfully",
    data: result
  });
});
var getMyProperties2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await PropertyServices.getMyProperties(userId, req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "My properties fetched successfully",
    data: result
  });
});
var approveProperty = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyServices.updateStatus(id, "ACTIVE");
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Property approved successfully",
    data: result
  });
});
var rejectProperty = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await PropertyServices.updateStatus(id, "REJECTED");
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Property rejected successfully",
    data: result
  });
});
var PropertyControllers = {
  createProperty: createProperty2,
  getAllProperties: getAllProperties2,
  getPropertyById: getPropertyById2,
  updateProperty: updateProperty2,
  deleteProperty: deleteProperty2,
  getMyProperties: getMyProperties2,
  approveProperty,
  rejectProperty
};

// src/app/module/property/property.route.ts
var router22 = express13.Router();
router22.post("/", auth_default("USER", "ADMIN", "MODERATOR"), upload.array("images", 10), PropertyControllers.createProperty);
router22.get("/", PropertyControllers.getAllProperties);
router22.get("/my-properties", auth_default("USER", "ADMIN", "MODERATOR"), PropertyControllers.getMyProperties);
router22.get("/:id", PropertyControllers.getPropertyById);
router22.put("/:id", auth_default("USER", "ADMIN", "MODERATOR"), upload.array("images", 10), PropertyControllers.updateProperty);
router22.delete("/:id", auth_default("USER", "ADMIN", "MODERATOR"), PropertyControllers.deleteProperty);
router22.put("/:id/approve", auth_default("ADMIN"), PropertyControllers.approveProperty);
router22.put("/:id/reject", auth_default("ADMIN"), PropertyControllers.rejectProperty);
var PropertyRoutes = router22;

// src/app/module/booking/booking.route.ts
init_esm_shims();
import express14 from "express";

// src/app/module/booking/booking.controller.ts
init_esm_shims();

// src/app/module/booking/booking.service.ts
init_esm_shims();
var import_client12 = __toESM(require_client(), 1);
var createBooking = async (userId, payload) => {
  const { propertyId, visitDate, visitTime, message } = payload;
  const result = await prisma_default.booking.create({
    data: {
      propertyId,
      userId,
      visitDate: new Date(visitDate),
      visitTime,
      message
    },
    include: {
      property: {
        select: { title: true, address: true, ownerId: true }
      }
    }
  });
  return result;
};
var getMyBookings = async (userId, role) => {
  const bookingsAsVisitor = await prisma_default.booking.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          images: { where: { isCover: true } }
        }
      }
    },
    orderBy: { visitDate: "desc" }
  });
  const bookingsAsOwner = await prisma_default.booking.findMany({
    where: {
      property: { ownerId: userId }
    },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      property: { select: { title: true, address: true } }
    },
    orderBy: { visitDate: "desc" }
  });
  return { asVisitor: bookingsAsVisitor, asOwner: bookingsAsOwner };
};
var updateBookingStatus = async (id, userId, status2) => {
  const booking = await prisma_default.booking.findUnique({
    where: { id },
    include: { property: true }
  });
  if (!booking) throw new Error("Booking not found");
  const isOwner = booking.property.ownerId === userId;
  const isVisitor = booking.userId === userId;
  if (status2 === import_client12.BookingStatus.CANCELLED && !isVisitor && !isOwner) {
    throw new Error("Not authorized to cancel this booking");
  }
  if ((status2 === import_client12.BookingStatus.CONFIRMED || status2 === import_client12.BookingStatus.DONE) && !isOwner) {
    throw new Error("Only the property owner can update this status");
  }
  return await prisma_default.booking.update({
    where: { id },
    data: { status: status2 }
  });
};
var BookingServices = {
  createBooking,
  getMyBookings,
  updateBookingStatus
};

// src/app/module/booking/booking.controller.ts
var createBooking2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await BookingServices.createBooking(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: result
  });
});
var getMyBookings2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const result = await BookingServices.getMyBookings(userId, role);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "My bookings fetched successfully",
    data: result
  });
});
var updateBookingStatus2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status: status2 } = req.body;
  const result = await BookingServices.updateBookingStatus(id, userId, status2);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Booking status updated successfully",
    data: result
  });
});
var BookingControllers = {
  createBooking: createBooking2,
  getMyBookings: getMyBookings2,
  updateBookingStatus: updateBookingStatus2
};

// src/app/module/booking/booking.route.ts
var router23 = express14.Router();
router23.post("/", auth_default("USER", "ADMIN", "MODERATOR"), BookingControllers.createBooking);
router23.get("/my-bookings", auth_default("USER", "ADMIN", "MODERATOR"), BookingControllers.getMyBookings);
router23.put("/:id/status", auth_default("USER", "ADMIN", "MODERATOR"), BookingControllers.updateBookingStatus);
var BookingRoutes = router23;

// src/app/module/enquiry/enquiry.route.ts
init_esm_shims();
import express15 from "express";

// src/app/module/enquiry/enquiry.controller.ts
init_esm_shims();

// src/app/module/enquiry/enquiry.service.ts
init_esm_shims();
var sendEnquiry = async (senderId, payload) => {
  const { propertyId, message, phone } = payload;
  return await prisma_default.propertyEnquiry.create({
    data: {
      propertyId,
      senderId,
      message,
      phone
    },
    include: {
      property: { select: { title: true, ownerId: true } }
    }
  });
};
var getMyEnquiries = async (userId) => {
  const received = await prisma_default.propertyEnquiry.findMany({
    where: {
      property: { ownerId: userId }
    },
    include: {
      sender: { select: { name: true, avatarUrl: true, email: true } },
      property: { select: { title: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const sent = await prisma_default.propertyEnquiry.findMany({
    where: { senderId: userId },
    include: {
      property: {
        select: { title: true, ownerId: true },
        include: {
          owner: { select: { name: true, avatarUrl: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return { received, sent };
};
var markAsRead5 = async (id, userId) => {
  const enquiry = await prisma_default.propertyEnquiry.findUnique({
    where: { id },
    include: { property: true }
  });
  if (!enquiry || enquiry.property.ownerId !== userId) {
    throw new Error("Not authorized");
  }
  return await prisma_default.propertyEnquiry.update({
    where: { id },
    data: { isRead: true }
  });
};
var EnquiryServices = {
  sendEnquiry,
  getMyEnquiries,
  markAsRead: markAsRead5
};

// src/app/module/enquiry/enquiry.controller.ts
var sendEnquiry2 = catchAsync_default(async (req, res) => {
  const senderId = req.user.id;
  const result = await EnquiryServices.sendEnquiry(senderId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Enquiry sent successfully",
    data: result
  });
});
var getMyEnquiries2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await EnquiryServices.getMyEnquiries(userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "My enquiries fetched successfully",
    data: result
  });
});
var markAsRead6 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await EnquiryServices.markAsRead(id, userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Enquiry marked as read successfully",
    data: result
  });
});
var EnquiryControllers = {
  sendEnquiry: sendEnquiry2,
  getMyEnquiries: getMyEnquiries2,
  markAsRead: markAsRead6
};

// src/app/module/enquiry/enquiry.route.ts
var router24 = express15.Router();
router24.post("/", auth_default("USER", "ADMIN", "MODERATOR"), EnquiryControllers.sendEnquiry);
router24.get("/my-enquiries", auth_default("USER", "ADMIN", "MODERATOR"), EnquiryControllers.getMyEnquiries);
router24.put("/:id/read", auth_default("USER", "ADMIN", "MODERATOR"), EnquiryControllers.markAsRead);
var EnquiryRoutes = router24;

// src/app/module/agent/agent.route.ts
init_esm_shims();
import express16 from "express";

// src/app/module/agent/agent.controller.ts
init_esm_shims();

// src/app/module/agent/agent.service.ts
init_esm_shims();
var getAgentProfile = async (userId) => {
  return await prisma_default.agentProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      properties: {
        where: { deletedAt: null, status: "ACTIVE" },
        include: { details: true, images: { where: { isCover: true } } }
      }
    }
  });
};
var getAllAgents = async (query = {}) => {
  return await new QueryBuilder(prisma_default.agentProfile, query, {
    searchableFields: ["agencyName", "licenseNo", "user.name"],
    filterableFields: ["isVerified"]
  }).search().filter().sort().paginate().include({
    user: { select: { id: true, name: true, avatarUrl: true, email: true } }
  }).execute();
};
var createAgentProfile = async (userId, payload) => {
  return await prisma_default.agentProfile.create({
    data: {
      userId,
      ...payload,
      isVerified: false
    }
  });
};
var verifyAgent = async (id) => {
  return await prisma_default.agentProfile.update({
    where: { id },
    data: { isVerified: true }
  });
};
var AgentServices = {
  getAgentProfile,
  getAllAgents,
  createAgentProfile,
  verifyAgent
};

// src/app/module/agent/agent.controller.ts
var getAgentProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await AgentServices.getAgentProfile(userId);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Agent profile fetched successfully",
    data: result
  });
});
var getAllAgents2 = catchAsync_default(async (req, res) => {
  const result = await AgentServices.getAllAgents(req.query);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Agents fetched successfully",
    data: result
  });
});
var createAgentProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await AgentServices.createAgentProfile(userId, req.body);
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "Agent profile created and awaiting verification",
    data: result
  });
});
var verifyAgent2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await AgentServices.verifyAgent(id);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Agent verified successfully",
    data: result
  });
});
var AgentControllers = {
  getAgentProfile: getAgentProfile2,
  getAllAgents: getAllAgents2,
  createAgentProfile: createAgentProfile2,
  verifyAgent: verifyAgent2
};

// src/app/module/agent/agent.route.ts
var router25 = express16.Router();
router25.get("/profile", auth_default("USER", "ADMIN", "MODERATOR"), AgentControllers.getAgentProfile);
router25.get("/", AgentControllers.getAllAgents);
router25.post("/", auth_default("USER", "ADMIN", "MODERATOR"), AgentControllers.createAgentProfile);
router25.put("/:id/verify", auth_default("ADMIN"), AgentControllers.verifyAgent);
var AgentRoutes = router25;

// src/app/module/admin/admin.route.ts
init_esm_shims();
import express17 from "express";
var import_client14 = __toESM(require_client(), 1);

// src/app/module/admin/admin.controller.ts
init_esm_shims();
import httpStatus19 from "http-status";

// src/app/module/admin/admin.service.ts
init_esm_shims();
var import_client13 = __toESM(require_client(), 1);
var getDashboardStats = async () => {
  const [
    totalUsers,
    totalProperties,
    pendingProperties,
    totalProducts,
    flaggedProducts,
    totalOrders,
    totalRevenue,
    activeAgents,
    flaggedPosts
  ] = await Promise.all([
    prisma_default.user.count(),
    prisma_default.property.count({ where: { deletedAt: null } }),
    prisma_default.property.count({ where: { status: import_client13.PropertyStatus.PENDING, deletedAt: null } }),
    prisma_default.product.count({ where: { deletedAt: null } }),
    prisma_default.product.count({ where: { status: import_client13.ProductStatus.FLAGGED, deletedAt: null } }),
    prisma_default.order.count(),
    prisma_default.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true }
    }),
    prisma_default.agentProfile.count({ where: { isVerified: true } }),
    prisma_default.post.count({ where: { status: "FLAGGED", deletedAt: null } })
  ]);
  return {
    users: { total: totalUsers },
    properties: { total: totalProperties, pending: pendingProperties },
    products: { total: totalProducts, flagged: flaggedProducts },
    posts: { flagged: flaggedPosts },
    orders: { total: totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0 },
    agents: { total: activeAgents }
  };
};
var AdminServices = {
  getDashboardStats
};

// src/app/module/admin/admin.controller.ts
var getDashboardStats2 = catchAsync_default(async (req, res) => {
  const result = await AdminServices.getDashboardStats();
  sendResponse_default(res, {
    statusCode: httpStatus19.OK,
    success: true,
    message: "Dashboard stats retrieved successfully",
    data: result
  });
});
var AdminControllers = {
  getDashboardStats: getDashboardStats2
};

// src/app/module/admin/admin.route.ts
var router26 = express17.Router();
router26.get("/stats", auth_default(import_client14.Role.ADMIN, import_client14.Role.MODERATOR), AdminControllers.getDashboardStats);
var AdminRoutes = router26;

// src/app/routes/index.ts
var router27 = Router10();
var moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes
  },
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/posts",
    route: PostRoutes
  },
  {
    path: "/comments",
    route: CommentRoutes
  },
  {
    path: "/likes",
    route: LikeRoutes
  },
  {
    path: "/messages",
    route: MessageRoutes
  },
  {
    path: "/announcements",
    route: AnnouncementRoutes
  },
  {
    path: "/notifications",
    route: NotificationRoutes
  },
  {
    path: "/upload",
    route: UploadRoutes
  },
  {
    path: "/stories",
    route: StoryRoutes
  },
  {
    path: "/follow",
    route: FollowRoutes
  },
  {
    path: "/search",
    route: SearchRoutes
  },
  {
    path: "/hashtags",
    route: HashtagRoutes
  },
  {
    path: "/saved-posts",
    route: SavedPostRoutes
  },
  {
    path: "/reactions",
    route: ReactionRoutes
  },
  {
    path: "/groups",
    route: GroupRoutes
  },
  {
    path: "/stores",
    route: StoreRoutes
  },
  {
    path: "/products",
    route: ProductRoutes
  },
  {
    path: "/categories",
    route: CategoryRoutes
  },
  {
    path: "/orders",
    route: OrderRoutes
  },
  {
    path: "/payments",
    route: PaymentRoutes
  },
  {
    path: "/properties",
    route: PropertyRoutes
  },
  {
    path: "/bookings",
    route: BookingRoutes
  },
  {
    path: "/enquiries",
    route: EnquiryRoutes
  },
  {
    path: "/agents",
    route: AgentRoutes
  },
  {
    path: "/admin",
    route: AdminRoutes
  }
];
moduleRoutes.forEach((route) => {
  router27.use(route.path, route.route);
});
var routes_default = router27;

// src/app.ts
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

// src/app/middleware/sanitizeRequest.ts
init_esm_shims();

// src/app/utils/sanitizer.ts
init_esm_shims();
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
var window = new JSDOM("").window;
var DOMPurify = createDOMPurify(window);
var sanitize = (data) => {
  if (typeof data === "string") {
    return DOMPurify.sanitize(data);
  }
  if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = sanitize(data[key]);
      }
    }
  }
  return data;
};

// src/app/middleware/sanitizeRequest.ts
var sanitizeRequest = (req, res, next) => {
  if (req.body) {
    sanitize(req.body);
  }
  if (req.query) {
    sanitize(req.query);
  }
  if (req.params) {
    sanitize(req.params);
  }
  next();
};

// src/app.ts
import { toNodeHandler } from "better-auth/node";
import path3 from "path";
import { fileURLToPath } from "url";
var __filename2 = fileURLToPath(import.meta.url);
var __dirname2 = path3.dirname(__filename2);
var app = express18();
app.set("view engine", "ejs");
app.set("views", path3.join(__dirname2, "views"));
app.use(helmet());
var allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL
  // Production frontend URL
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.includes(origin) || /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use(cookieParser());
app.all("/api/auth/{*splat}", toNodeHandler(auth));
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 1e3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/v1/auth", authLimiter);
app.use(express18.json({
  limit: "10mb",
  verify: (req, res, buf) => {
    if (req.originalUrl.includes("/payments/webhook")) {
      req.rawBody = buf;
    }
  }
}));
app.use(express18.urlencoded({ extended: true, limit: "10mb" }));
app.use(sanitizeRequest);
app.use(morgan("dev"));
app.use("/api/v1", routes_default);
app.get("/", (req, res) => {
  res.status(httpStatus20.OK).json({
    success: true,
    message: "Welcome to EchoNet API"
  });
});
app.use(globalErrorHandler_default);
app.use(notFound_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
