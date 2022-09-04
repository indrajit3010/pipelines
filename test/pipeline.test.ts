import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as Pipeline from "../lib/pipeline-stack";
import * as Service from "../lib/service-stack";
import * as Billing from "../lib/billing-stack";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/pipeline-stack.ts
test("Pipeline Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Pipeline.PipelineStack(app, "MyTestStack");
  // THEN
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});

test("Adding service stage", () => {
  const app = new cdk.App();
  const pipelineStack = new Pipeline.PipelineStack(app, "PipleStack");
  const serviceStack = new Service.ServiceStack(app, "ServiceStack", {
    stageName: "Test",
  });

  // WHEN
  pipelineStack.addServiceStage(serviceStack, "Test");

  // THEN
  const template = Template.fromStack(pipelineStack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Name: "Test",
      }),
    ]),
  });
});

test("Adding billing stack to stage", () => {
  const app = new cdk.App();
  const pipelineStack = new Pipeline.PipelineStack(app, "PipleStack");
  const serviceStack = new Service.ServiceStack(app, "ServiceStack", {
    stageName: "Test",
  });
  const billingStack = new Billing.BillingStack(app, "BillingStack", {
    budgetAmount: 5,
    emailAddress: "test@exmaple.com",
  });
  const testStage = pipelineStack.addServiceStage(serviceStack, "Test");

  // WHEN
  pipelineStack.addBillingStackToStage(billingStack, testStage);

  const template = Template.fromStack(pipelineStack);
  template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
    Stages: Match.arrayWith([
      Match.objectLike({
        Actions: Match.arrayWith([
          Match.objectLike({
            Name: "Billing_Update",
          }),
        ]),
      }),
    ]),
  });
});
