/*
 Navicat Premium Data Transfer

 Source Server         : connection1
 Source Server Type    : PostgreSQL
 Source Server Version : 130001
 Source Host           : localhost:5432
 Source Catalog        : surveywizard
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 130001
 File Encoding         : 65001

 Date: 01/08/2021 11:07:18
*/


-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS "public"."categories";
CREATE TABLE "public"."categories" (
  "id" uuid NOT NULL ,
  "name" text COLLATE "pg_catalog"."default",
  "user_id" uuid,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false
)
;
