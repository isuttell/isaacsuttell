/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as articles_admin from "../articles/admin.js";
import type * as articles_internal from "../articles/internal.js";
import type * as articles_model from "../articles/model.js";
import type * as articles_queries from "../articles/queries.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_validators from "../lib/validators.js";
import type * as mcp_auth from "../mcp/auth.js";
import type * as mcp_handler from "../mcp/handler.js";
import type * as mcp_internal from "../mcp/internal.js";
import type * as mcp_oauth from "../mcp/oauth.js";
import type * as mcp_tools from "../mcp/tools.js";
import type * as tags_internal from "../tags/internal.js";
import type * as tags_mutations from "../tags/mutations.js";
import type * as tags_queries from "../tags/queries.js";
import type * as users_internal from "../users/internal.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "articles/admin": typeof articles_admin;
  "articles/internal": typeof articles_internal;
  "articles/model": typeof articles_model;
  "articles/queries": typeof articles_queries;
  auth: typeof auth;
  crons: typeof crons;
  files: typeof files;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/validators": typeof lib_validators;
  "mcp/auth": typeof mcp_auth;
  "mcp/handler": typeof mcp_handler;
  "mcp/internal": typeof mcp_internal;
  "mcp/oauth": typeof mcp_oauth;
  "mcp/tools": typeof mcp_tools;
  "tags/internal": typeof tags_internal;
  "tags/mutations": typeof tags_mutations;
  "tags/queries": typeof tags_queries;
  "users/internal": typeof users_internal;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
