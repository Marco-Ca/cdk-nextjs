import * as cdk from '@aws-cdk/core';
import * as amplify from '@aws-cdk/aws-amplify';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as iam from '@aws-cdk/aws-iam';

export class AmplifyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const token = cdk.SecretValue.secretsManager('GithubTokenAmplify')
    const sourceCodeProvider = new amplify.GitHubSourceCodeProvider({
      owner: 'Marco-Ca',
      repository: 'cdk-nextjs',
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

    const role = new iam.Role(this, 'MyRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
    });
    const iManagedPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AdministratorAccess',
    );

    role.addManagedPolicy(iManagedPolicy)

    const amplifyApp = new amplify.App(this, "cdk-next-app", {
      sourceCodeProvider: sourceCodeProvider,
      buildSpec: buildSpec,
      role: role
    });

    amplifyApp.addBranch('master');
  }
}