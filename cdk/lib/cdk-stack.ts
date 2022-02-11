import * as cdk from '@aws-cdk/core';
import * as amplify from '@aws-cdk/aws-amplify';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';

export class AmplifyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
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
    const buildSpec = codebuild.BuildSpec.fromObjectToYaml(
      {
        version: 1,
        applications: [
          {
            frontend: {
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
          }
        ]
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