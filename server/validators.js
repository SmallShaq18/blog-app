//const Joi = require("joi");
import Joi from "joi"



//schema for blog register
export const registerValidator = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().max(1024).required(),
  password: Joi.string().min(6).required()
});

// schema for user login (single identifier field)
export const loginValidator = Joi.object({
  identifier: Joi.string().min(3).max(1024).required(), // can be username OR email
  password: Joi.string().min(6).required()
});

//schema for blog posts
export const postValidator = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),
  author: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  image: Joi.string().optional(),
  likes: Joi.array().items(Joi.string()).optional()
});

//schema for blog comments
export const commentValidator = Joi.object({
  text: Joi.string().min(1).max(500).required(),
  post: Joi.string().optional(),
  author: Joi.string().optional()
});

