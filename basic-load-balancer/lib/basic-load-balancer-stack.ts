import {
  Vpc,
  IVpc,
  SecurityGroup,
  Peer,
  Port,
  InstanceType,
  InstanceClass,
  InstanceSize,
  AmazonLinuxImage,
  AmazonLinuxGeneration,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { AutoScalingGroup } from "aws-cdk-lib/aws-autoscaling";
import { Stack, StackProps, CfnOutput } from "aws-cdk-lib/core";

export class BasicLoadBalancerStack extends Stack {
  public readonly vpc: IVpc;
  public readonly loadBalancer: ApplicationLoadBalancer;
  public readonly albSecurityGroup: SecurityGroup;
  public readonly ec2SecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "MyVpc", {
      maxAzs: 2,
    });

    this.albSecurityGroup = new SecurityGroup(this, "ALBSecurityGroup", {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    // ALB is allowed to get traffic from anywhere on port 80
    this.albSecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      "Allow HTTP traffic from anywhere",
    );

    this.ec2SecurityGroup = new SecurityGroup(this, "EC2SecurityGroup", {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    // EC2 instances are allowed to receive traffic from the ALB on port 80
    this.ec2SecurityGroup.addIngressRule(
      this.albSecurityGroup,
      Port.tcp(80),
      "Allow HTTP traffic from ALB",
    );

    this.loadBalancer = new ApplicationLoadBalancer(this, "ALB", {
      vpc: this.vpc,
      internetFacing: true,
      securityGroup: this.albSecurityGroup,
    });

    const asg = new AutoScalingGroup(this, "ASG", {
      vpc: this.vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      securityGroup: this.ec2SecurityGroup,
      minCapacity: 1,
      maxCapacity: 4,
    });

    asg.addUserData(
      "yum update -y",
      "yum install -y httpd",
      "systemctl start httpd",
      "systemctl enable httpd",
      "echo 'Hello from ASG' > /var/www/html/index.html",
    );

    asg.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    const listener = this.loadBalancer.addListener("Listener", {
      port: 80,
    });

    listener.addTargets("Target", {
      port: 80,
      targets: [asg],
    });

    new CfnOutput(this, "LoadBalancerDNS", {
      value: this.loadBalancer.loadBalancerDnsName,
    });
  }
}
