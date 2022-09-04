import * as cdk from "aws-cdk-lib";
import { SecretValue } from "aws-cdk-lib";
import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CloudFormationCreateUpdateStackAction,
  CodeBuildAction,
  GitHubSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { Construct } from "constructs";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new Pipeline(this, "Pipeline", {
      pipelineName: "Pipeline",
      crossAccountKeys: false,
    });

    const cdkSourceOutput = new Artifact("cdkSourceOutput");
    const serviceSourceOutput = new Artifact("serviceSourceOutput");

    pipeline.addStage({
      stageName: "Source",
      actions: [
        new GitHubSourceAction({
          owner: "indrajit3010",
          repo: "pipelines",
          branch: "main",
          actionName: "Pipeline_Source",
          oauthToken: SecretValue.secretsManager("GithubPipeline"),
          output: cdkSourceOutput,
        }),
        new GitHubSourceAction({
          owner: "indrajit3010",
          repo: "express-server",
          branch: "main",
          actionName: "Service_Source",
          oauthToken: SecretValue.secretsManager("GithubPipeline"),
          output: serviceSourceOutput,
        }),
      ],
    });

    const cdkBuildOutput = new Artifact("CDKBuildOutput");

    pipeline.addStage({
      stageName: "Build",
      actions: [
        new CodeBuildAction({
          actionName: "CDK_Build",
          input: cdkSourceOutput,
          outputs: [cdkBuildOutput],
          project: new PipelineProject(this, "CdkBuildProject", {
            environment: {
              buildImage: LinuxBuildImage.STANDARD_5_0,
            },
            buildSpec: BuildSpec.fromSourceFilename(
              "build-spec/cdk-build-spec.yml"
            ),
          }),
        }),
      ],
    });

    pipeline.addStage({
      stageName: "Pipeline_Update",
      actions: [
        new CloudFormationCreateUpdateStackAction({
          actionName: "Pipeline_Update",
          stackName: "PipelineStack",
          templatePath: cdkBuildOutput.atPath("PipelineStack.template.json"),
          adminPermissions: true,
        }),
      ],
    });
  }
}
