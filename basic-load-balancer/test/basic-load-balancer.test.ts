import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as BasicLoadBalancer from "../lib/basic-load-balancer-stack";

const app = new cdk.App();
const stack = new BasicLoadBalancer.BasicLoadBalancerStack(app, "MyTestStack");
const template = Template.fromStack(stack);

test("Load balancer is internet-facing", () => {
  template.hasResourceProperties("AWS::ElasticLoadBalancingV2::LoadBalancer", {
    Scheme: "internet-facing",
  });
});

test("Auto Scaling Group is configured with correct capacity limits", () => {
  template.hasResourceProperties("AWS::AutoScaling::AutoScalingGroup", {
    MinSize: "1",
    MaxSize: "4",
  });

  template.hasResourceProperties("AWS::AutoScaling::ScalingPolicy", {
    PolicyType: "TargetTrackingScaling",
    TargetTrackingConfiguration: {
      PredefinedMetricSpecification: {
        PredefinedMetricType: "ASGAverageCPUUtilization",
      },
      TargetValue: 50,
    },
  });
});

test("ALB Security Group allows HTTP traffic from anywhere", () => {
  template.hasResourceProperties("AWS::EC2::SecurityGroup", {
    SecurityGroupIngress: Match.arrayWith([
      Match.objectLike({
        CidrIp: "0.0.0.0/0",
        FromPort: 80,
        IpProtocol: "tcp",
        ToPort: 80,
      }),
    ]),
  });
});
