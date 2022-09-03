import { CfnBudget } from "aws-cdk-lib/aws-budgets";
import { Construct } from "constructs";

interface BudgetProps {
  budgetAmount: number;
  emailAddress: string;
}

export class Budget extends Construct {
  constructor(scope: Construct, id: string, props: BudgetProps) {
    super(scope, id);

    new CfnBudget(this, "Budget", {
      budget: {
        budgetLimit: {
          amount: props.budgetAmount,
          unit: "USD",
        },
        budgetName: "Monthly Budget",
        budgetType: "COST",
        timeUnit: "MONTHLY",
      },
      notificationsWithSubscribers: [
        {
          notification: {
            comparisonOperator: "GREATER_THAN",
            notificationType: "ACTUAL",
            threshold: 100,
            thresholdType: "ABSOLUTE_VALUE",
          },
          subscribers: [
            {
              address: props.emailAddress,
              subscriptionType: "EMAIL",
            },
          ],
        },
      ],
    });
  }
}
