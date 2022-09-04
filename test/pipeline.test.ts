import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as Pipeline from "../lib/pipeline-stack";
import * as Service from "../lib/service-stack";

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
  const serviceStack = new Service.ServiceStack(app, "ServiceStack");

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
