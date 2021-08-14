/*
 Navicat Premium Data Transfer

 Source Server         : ddddd
 Source Server Type    : PostgreSQL
 Source Server Version : 130001
 Source Host           : 34.230.165.54:5432
 Source Catalog        : surveywizard
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 130001
 File Encoding         : 65001

 Date: 11/06/2021 22:48:12
*/


-- ----------------------------
-- Table structure for weblinks
-- ----------------------------
DROP TABLE IF EXISTS "public"."weblinks";
CREATE TABLE "public"."weblinks" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v1(),
  "name" text COLLATE "pg_catalog"."default",
  "link_id" text COLLATE "pg_catalog"."default",
  "survey_id" int4,
  "close_quota" int4,
  "close_date" date,
  "is_active" bool,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false,
  "user_id" uuid
)
;

-- ----------------------------
-- Records of weblinks
-- ----------------------------
INSERT INTO "public"."weblinks" VALUES ('2b6ffdd4-5f41-11eb-b239-25b7f5e3edfd', 'Survey Web Link', 'tfekipqg', 1, 5, '2021-01-25', 't', '2021-01-25 19:11:47.019764+00', 't', '095ff2de-50ce-11eb-a07c-bf277141b12d');
INSERT INTO "public"."weblinks" VALUES ('9693533e-685d-11eb-ac93-271d9b62dc35', 'Mohammed Foad Omer', 'dujiotao', 131, NULL, NULL, 'f', '2021-02-06 09:27:53.075025+00', 'f', '095ff2de-50ce-11eb-a07c-bf277141b12d');
INSERT INTO "public"."weblinks" VALUES ('c82a6124-5f3b-11eb-b239-25b7f5e3edfd', 'Web Link', 'gvpkhpmq', 1, NULL, '2021-02-06', 't', '2021-01-25 18:33:12.938634+00', 't', '095ff2de-50ce-11eb-a07c-bf277141b12d');
INSERT INTO "public"."weblinks" VALUES ('9aadab2e-5fa0-11eb-b0df-437bc3ee80d1', '123456', 'abas', 1, NULL, NULL, 'f', '2021-01-26 06:34:54.479243+00', 't', '095ff2de-50ce-11eb-a07c-bf277141b12d');
INSERT INTO "public"."weblinks" VALUES ('6b823744-b5c6-11eb-be15-f563c7d6db22', 'Abu Baker Survey', 'ocuidjxy', 157, NULL, '2021-06-29', 't', '2021-05-15 21:42:15.212397+00', 'f', '095ff2de-50ce-11eb-a07c-bf277141b12d');

-- ----------------------------
-- Primary Key structure for table weblinks
-- ----------------------------
ALTER TABLE "public"."weblinks" ADD CONSTRAINT "weblinks_pkey" PRIMARY KEY ("id");
