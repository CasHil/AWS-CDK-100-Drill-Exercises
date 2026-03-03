import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as BasicLoadBalancer from "../lib/basic-load-balancer-stack";

test("Infrastructure Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new BasicLoadBalancer.BasicLoadBalancerStack(
    app,
    "MyTestStack",
  );
  // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::ElasticLoadBalancingV2::LoadBalancer", {
    Scheme: "internet-facing",
  });

  template.hasResourceProperties("AWS::AutoScaling::AutoScalingGroup", {
    MinSize: "1",
    MaxSize: "4",
  });
});
