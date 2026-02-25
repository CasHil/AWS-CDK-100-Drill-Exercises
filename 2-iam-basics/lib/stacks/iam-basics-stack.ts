import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import { IAMUserWithPassword } from "../constructs/iam-user-with-password";
import { Environment } from "@common/parameters/environments";
import { IamUserGroup } from "../constructs/iam-user-with-group";
import { SwitchRoleUser } from "../constructs/iam-user-with-switch-role";

export interface StackProps extends cdk.StackProps {
  project: string;
  environment: Environment;
  isAutoDeleteObject: boolean;
}

export class IamBasicsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new iam.User(this, "CDKDefaultUser", {});

    new IAMUserWithPassword(this, "CDKUserWithPassword", {
      project: props.project,
      environment: props.environment,
    });

    new IamUserGroup(this, "UserGroup", {
      project: props.project,
      environment: props.environment,
    });

    new SwitchRoleUser(this, "SwitchRoleUser", {
      project: props.project,
      environment: props.environment,
    });
  }
}
