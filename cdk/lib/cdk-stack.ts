import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AmplifyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // Make sure you have a GithubTokenAmplify on your secrets manager and it should be of type 'plain text'
    const token = cdk.SecretValue.secretsManager('GithubTokenAmplify')
    const sourceCodeProvider = new amplify.GitHubSourceCodeProvider({
      // Github account name
      owner: '<GithubAccountName>',
      // Github repo name
      repository: '<GithubRepoName>',
      oauthToken: token
    });
    const buildSpec = codebuild.BuildSpec.fromObject(
      {
        version: '0.2',
        phases: {
          preBuild: {
            commands: [
              "npm install",
            ]
          },
          build: {
            commands: [
              "npm run build"
            ]
          }
        },
        artifacts: {
          baseDirectory: ".next",
          files: [
            "**/*"
          ]
        },
        cache: {
          paths: [
            "node_modules/**/*"
          ]
        }
      }
    );

    const role = new iam.Role(this, 'AmplifyAdminAccessRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    });

    const managedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AdministratorAccess-Amplify',
    );

    role.addManagedPolicy(managedPolicy)

    const amplifyApp = new amplify.App(this, "cdk-next-app", {
      sourceCodeProvider: sourceCodeProvider,
      buildSpec: buildSpec,
      role: role
    });
    // branch of the repo
    amplifyApp.addBranch('master');
  }
}
