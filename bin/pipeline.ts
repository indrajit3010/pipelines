#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-stack";
import { BillingStack } from "../lib/billing-stack";
import { ServiceStack } from "../lib/service-stack";

const app = new cdk.App();
const pipelineStack = new PipelineStack(app, "PipelineStack", {});
new BillingStack(app, "BillingStack", {
  budgetAmount: 5,
  emailAddress: "pingale.indrajit@gmail.com",
});
const serviceStack = new ServiceStack(app, "ServiceStack");
pipelineStack.addServiceStage(serviceStack, "Prod");
