import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as Billing from "../lib/billing-stack";

test("SQS Queue Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Billing.BillingStack(app, "BillingStack", {
    budgetAmount: 1,
    emailAddress: "test@example.com",
  });
  // THEN
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});
