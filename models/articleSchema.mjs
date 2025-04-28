import Joi from "joi";

export const articleSchema = Joi.object({
  title: Joi.string().required(),
  lead: Joi.string().optional(),
  content: Joi.string().required(),
  version: Joi.string().required(),
  figures: Joi.array().items(Joi.string()).optional(),
  date: Joi.date().optional(),
  category: Joi.string().required(),
  footer: Joi.string().optional(),
  id: Joi.string().required(),
  _id: Joi.string().optional(),
});
