#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { IamBasicsStack } from "../lib/stacks/iam-basics-stack";
import { Environment } from "@common/parameters/environments";

const app = new cdk.App();

const pjName: string = app.node.tryGetContext("project") || "iam-basics";
console.log("Project Name: ", pjName);
const envName: Environment =
  app.node.tryGetContext("env") || Environment.DEVELOPMENT;

new IamBasicsStack(app, "IamBasicsStack", {
  project: pjName,
  environment: envName,
  terminationProtection: false,
  isAutoDeleteObject: true,
});

cdk.Tags.of(app).add("Project", pjName);
cdk.Tags.of(app).add("Environment", envName);
